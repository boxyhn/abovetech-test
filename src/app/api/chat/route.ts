import { NextRequest } from 'next/server'
import { chatService } from '@/services/session/chatService'
import { createError } from '@/types/errors'
import { apiHandler, parseRequestBody } from '@/utils/apiHandler'
import type { SendMessageRequest, SendMessageResponse } from '@/types/api'

export const POST = apiHandler(async (request: NextRequest) => {
  // 1. 요청 데이터 파싱 및 검증
  const body = await parseRequestBody<SendMessageRequest>(request)
  
  if (!body.session_id || !body.message?.trim()) {
    throw createError.missingParameters()
  }

  // 2. 채팅 서비스를 통해 메시지 처리
  const chatResponse = await chatService.processMessage(
    body.session_id,
    body.message
  )

  // 3. 응답 생성
  const response: SendMessageResponse = {
    response: chatResponse.message
  }
  
  if (chatResponse.status) {
    response.status = chatResponse.status
  }

  return response
})