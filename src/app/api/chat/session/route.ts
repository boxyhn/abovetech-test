import { chatService } from '@/services/session/chatService'
import { apiHandler } from '@/utils/apiHandler'
import type { CreateSessionResponse } from '@/types/api'

export const POST = apiHandler(async () => {
  // 세션 서비스를 통해 새 세션 생성
  const { sessionId, initialMessage } = await chatService.createSession()

  // 성공 응답
  const response: CreateSessionResponse = {
    session_id: sessionId,
    initial_message: initialMessage
  }
  
  return response
})