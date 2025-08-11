import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import type { CreateSessionResponse, ApiError } from '@/types/api'

const INITIAL_MESSAGE = "와! 안녕하세요 선생님! 😊 저는 호키동자예요! 선생님의 사주를 봐드리려고 왔어요! ✨ 먼저 선생님에 대해 알려주시면 정확한 사주를 봐드릴게요! 이름이랑 생년월일, 태어난 시간, 성별을 편하게 말씀해주세요!"

export async function POST(): Promise<NextResponse<CreateSessionResponse | ApiError>> {
  try {
    // 새로운 세션 생성
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert([{}])
      .select()
      .single()

    if (sessionError) {
      console.error('Session creation error:', sessionError)
      return NextResponse.json(
        { error: '세션 생성에 실패했습니다.', code: 'SESSION_CREATE_FAILED' },
        { status: 500 }
      )
    }

    // 성공 응답
    return NextResponse.json(
      {
        session_id: session.id,
        initial_message: INITIAL_MESSAGE
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Unexpected error in session creation:', error)
    return NextResponse.json(
      { error: '예기치 않은 오류가 발생했습니다.', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}