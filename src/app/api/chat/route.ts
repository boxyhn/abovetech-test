import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import type { SendMessageRequest, SendMessageResponse, ApiError } from '@/types/api'
import type { Session, Message } from '@/types/database'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: NextRequest): Promise<NextResponse<SendMessageResponse | ApiError>> {
  try {
    // 1. 요청 데이터 파싱 및 검증
    const body = await request.json() as SendMessageRequest
    
    if (!body.session_id || !body.message?.trim()) {
      return NextResponse.json(
        { error: '필수 파라미터가 누락되었습니다.', code: 'INVALID_REQUEST' },
        { status: 400 }
      )
    }

    // 2. 사용자 메시지 저장
    const { error: userMessageError } = await supabase
      .from('messages')
      .insert([{
        session_id: body.session_id,
        role: 'user',
        content: body.message
      }])

    if (userMessageError) {
      console.error('Failed to save user message:', userMessageError)
      return NextResponse.json(
        { error: '메시지 저장에 실패했습니다.', code: 'MESSAGE_SAVE_FAILED' },
        { status: 500 }
      )
    }

    // 3. 세션 정보 조회
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', body.session_id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: '세션을 찾을 수 없습니다.', code: 'SESSION_NOT_FOUND' },
        { status: 404 }
      )
    }

    // 4. 상태별 처리
    let botResponse = ''
    let responseStatus: SendMessageResponse['status'] = undefined

    switch (session.status) {
      case 'GATHERING_INFO':
        const gatheringResult = await handleGatheringInfo(session, body.message)
        botResponse = gatheringResult.message
        responseStatus = gatheringResult.status
        break

      case 'READY':
        botResponse = await handleQuestionAnswering(session, body.message)
        responseStatus = 'READY'
        break

      case 'ANALYZING':
        botResponse = '현재 사주를 분석 중입니다. 잠시만 기다려주세요.'
        responseStatus = 'ANALYZING'
        break

      default:
        return NextResponse.json(
          { error: '잘못된 세션 상태입니다.', code: 'INVALID_SESSION_STATE' },
          { status: 400 }
        )
    }

    // 5. 챗봇 응답 저장
    const { error: botMessageError } = await supabase
      .from('messages')
      .insert([{
        session_id: body.session_id,
        role: 'assistant',
        content: botResponse
      }])

    if (botMessageError) {
      console.error('Failed to save bot message:', botMessageError)
    }

    // 6. 응답 반환
    const response: SendMessageResponse = {
      response: botResponse
    }
    if (responseStatus) {
      response.status = responseStatus
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Unexpected error in message processing:', error)
    return NextResponse.json(
      { error: '메시지 처리 중 오류가 발생했습니다.', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

// 정보 수집 로직 처리 결과 타입
interface GatheringResult {
  message: string
  status?: 'ANALYZING' | 'GATHERING_INFO'
}

// 정보 수집 로직 처리 함수
async function handleGatheringInfo(session: Session, message: string): Promise<GatheringResult> {
  try {
    // 1. 최근 대화 내용 가져오기
    const { data: recentMessages } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', session.id)
      .order('created_at', { ascending: false })
      .limit(10)

    const conversationHistory = recentMessages
      ?.reverse()
      .map((msg: Message) => `${msg.role}: ${msg.content}`)
      .join('\n')

    // 2. LLM을 통해 정보 추출
    const extractionPrompt = `
다음 대화에서 사용자의 사주 정보를 추출해주세요:
- 이름
- 생년월일 (YYYY-MM-DD 형식)
- 태어난 시간 (HH:MM 형식, 24시간 형식)
- 성별 (남/여)

대화 내용:
${conversationHistory}
새 메시지: ${message}

추출한 정보를 JSON 형식으로 반환해주세요. 찾을 수 없는 정보는 null로 표시하세요.
예시: {"name": "홍길동", "birth_date": "1990-01-01", "birth_time": "14:30", "gender": "남"}
`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: '당신은 대화에서 정보를 추출하는 전문가입니다.' },
        { role: 'user', content: extractionPrompt }
      ],
      response_format: { type: 'json_object' }
    })

    const extractedInfo = JSON.parse(completion.choices[0].message.content || '{}')

    // 3. 추출한 정보로 세션 업데이트
    const updateData: Partial<Session> = {}
    if (extractedInfo.name) updateData.user_name = extractedInfo.name
    if (extractedInfo.birth_date) updateData.birth_date = extractedInfo.birth_date
    if (extractedInfo.birth_time) updateData.birth_time = extractedInfo.birth_time
    if (extractedInfo.gender) updateData.gender = extractedInfo.gender

    if (Object.keys(updateData).length > 0) {
      await supabase
        .from('sessions')
        .update(updateData)
        .eq('id', session.id)
    }

    // 4. 업데이트된 세션 정보 가져오기
    const { data: updatedSession } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', session.id)
      .single()

    // 5. 정보 완전성 검사
    const missingInfo: string[] = []
    if (!updatedSession?.user_name) missingInfo.push('이름')
    if (!updatedSession?.birth_date) missingInfo.push('생년월일')
    if (!updatedSession?.birth_time) missingInfo.push('태어난 시간')
    if (!updatedSession?.gender) missingInfo.push('성별')

    // 6. 응답 생성
    if (missingInfo.length === 0 && updatedSession) {
      // 모든 정보가 수집됨 - ANALYZING으로 상태 변경
      await supabase
        .from('sessions')
        .update({ status: 'ANALYZING' })
        .eq('id', session.id)

      // 비동기로 초기 분석 시작 (백그라운드 처리)
      startInitialAnalysis(session.id, updatedSession).catch(console.error)

      return {
        message: '모든 정보가 수집되었습니다. 사주 분석을 시작합니다...',
        status: 'ANALYZING' as const
      }
    } else {
      // 부족한 정보 요청
      const collectedInfo: string[] = []
      if (updatedSession?.user_name) collectedInfo.push(`이름: ${updatedSession.user_name}`)
      if (updatedSession?.birth_date) collectedInfo.push(`생년월일: ${updatedSession.birth_date}`)
      if (updatedSession?.birth_time) collectedInfo.push(`태어난 시간: ${updatedSession.birth_time}`)
      if (updatedSession?.gender) collectedInfo.push(`성별: ${updatedSession.gender}`)

      let responseMessage = ''
      if (collectedInfo.length > 0) {
        responseMessage = `감사합니다! 현재까지 알려주신 정보는 다음과 같습니다:\n${collectedInfo.join('\n')}\n\n`
      }
      responseMessage += `다음 정보를 추가로 알려주세요: ${missingInfo.join(', ')}`

      return {
        message: responseMessage,
        status: 'GATHERING_INFO' as const
      }
    }
  } catch (error) {
    console.error('정보 수집 오류:', error)
    return {
      message: '죄송합니다. 정보 처리 중 오류가 발생했습니다. 다시 시도해주세요.',
      status: 'GATHERING_INFO' as const
    }
  }
}

// 초기 사주 분석 시작 (백그라운드 처리)
async function startInitialAnalysis(sessionId: string, userInfo: Session): Promise<void> {
  try {
    // 1. LLM에게 사주 분석 요청
    const analysisPrompt = `
다음 정보를 바탕으로 사주에 대한 전반적인 분석을 제공해주세요:

이름: ${userInfo.user_name}
생년월일: ${userInfo.birth_date}
태어난 시간: ${userInfo.birth_time}
성별: ${userInfo.gender}

다음 항목들을 포함하여 상세하게 분석해주세요:
1. 전반적인 사주 개요
2. 타고난 성격과 기질
3. 강점과 장점
4. 약점과 개선점
5. 인생의 주요 테마
6. 행운의 시기와 주의할 시기

전문적이면서도 이해하기 쉽게 설명해주세요.
`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: '당신은 경험이 풍부한 사주 전문가입니다. 동양 철학과 사주팔자에 대한 깊은 이해를 바탕으로 정확하고 통찰력 있는 분석을 제공합니다.' 
        },
        { role: 'user', content: analysisPrompt }
      ],
      temperature: 0.8
    })

    const analysisResult = completion.choices[0].message.content
    console.log('사주 분석 완료:', analysisResult)

    // 2. 상태를 READY로 변경
    await supabase
      .from('sessions')
      .update({ status: 'READY' })
      .eq('id', sessionId)

    // 3. 완료 메시지를 messages 테이블에 저장
    await supabase
      .from('messages')
      .insert([{
        session_id: sessionId,
        role: 'assistant',
        content: '분석이 완료되었습니다. 이제 사주에 대해 무엇이든 물어보세요.'
      }])

    console.log('초기 분석 완료 및 READY 상태로 전환:', sessionId)
    
  } catch (error) {
    console.error('초기 분석 오류:', error)
    
    // 오류 발생 시 오류 메시지 저장
    await supabase
      .from('messages')
      .insert([{
        session_id: sessionId,
        role: 'assistant',
        content: '분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      }])
  }
}

// 질의응답 로직 처리 함수
async function handleQuestionAnswering(session: Session, message: string): Promise<string> {
  try {
    // 1. 이전 대화 기록 가져오기
    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', session.id)
      .order('created_at', { ascending: true })

    // 2. 대화 기록 포맷팅
    const conversationHistory = messages
      ?.map((msg: Message) => `${msg.role}: ${msg.content}`)
      .join('\n')

    // 3. LLM 프롬프트 구성
    const qaPrompt = `
[사용자 정보]
이름: ${session.user_name}
생년월일: ${session.birth_date}
태어난 시간: ${session.birth_time}
성별: ${session.gender}

[이전 대화 내용]
${conversationHistory}

[현재 질문]
${message}

위 사용자의 사주 정보와 대화 맥락을 고려하여 질문에 답변해주세요. 
답변 시 다음 사항을 고려해주세요:
- 사용자의 생년월일과 시간을 바탕으로 한 사주 팔자 해석
- 이전 대화에서 언급된 내용과의 일관성
- 친근하고 전문적인 어조 유지
- 구체적이고 실용적인 조언 제공
`

    // 4. LLM API 호출
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: '당신은 사주 전문가 챗봇입니다. 사용자의 사주 정보와 이전 대화 내용을 바탕으로 친절하고 전문적으로 답변해주세요. 동양 철학과 사주팔자에 대한 깊은 이해를 바탕으로 통찰력 있는 조언을 제공합니다.' 
        },
        { role: 'user', content: qaPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })

    // 5. 생성된 답변 반환
    return completion.choices[0].message.content || '답변을 생성할 수 없습니다.'

  } catch (error) {
    console.error('질의응답 처리 오류:', error)
    return '죄송합니다. 답변 생성 중 오류가 발생했습니다. 다시 시도해주세요.'
  }
}