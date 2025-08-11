import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import type { CreateSessionResponse, ApiError } from '@/types/api'

const INITIAL_MESSAGE = "안녕하세요! 사주풀이를 위해 당신의 정보를 알려주세요. 이름, 생년월일, 태어난 시간, 성별이 필요해요."

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