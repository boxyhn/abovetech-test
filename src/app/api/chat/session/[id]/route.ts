import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import type { ApiError } from '@/types/api'

type RouteParams = {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const { id } = await params

    // 세션 정보 조회
    const { data: session, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !session) {
      return NextResponse.json(
        { error: '세션을 찾을 수 없습니다.', code: 'SESSION_NOT_FOUND' } as ApiError,
        { status: 404 }
      )
    }

    // 최신 메시지 확인 (분석 완료 메시지 등)
    const { data: latestMessage } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', id)
      .eq('role', 'assistant')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    return NextResponse.json({
      status: session.status,
      session,
      latestMessage: latestMessage?.content
    })

  } catch (error) {
    console.error('Session fetch error:', error)
    return NextResponse.json(
      { error: '세션 조회 중 오류가 발생했습니다.', code: 'INTERNAL_ERROR' } as ApiError,
      { status: 500 }
    )
  }
}