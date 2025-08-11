import { supabase } from '@/lib/supabase'
import { NextRequest } from 'next/server'
import { createError } from '@/types/errors'
import { apiHandler } from '@/utils/apiHandler'

type RouteParams = {
  params: Promise<{ id: string }>
}

export const GET = apiHandler<unknown, RouteParams>(async (_request: NextRequest, context?: RouteParams) => {
  if (!context) throw createError.invalidRequest()
  const { params } = context
  const { id } = await params

  // 세션 정보 조회
  const { data: session, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !session) {
    throw createError.sessionNotFound()
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

  return {
    status: session.status,
    session,
    latestMessage: latestMessage?.content
  }
})