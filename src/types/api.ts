// API Request/Response Types
export interface CreateSessionResponse {
  session_id: string
  initial_message: string
}

export interface SendMessageRequest {
  session_id: string
  message: string
}

export interface SendMessageResponse {
  response: string
  status?: 'ANALYZING' | 'GATHERING_INFO' | 'READY'
  message?: string  // 추가 메시지 (상태 변경 시 등)
}

export interface ApiError {
  error: string
  code?: string
}

// Validation helpers
export function isValidSessionId(id: unknown): id is string {
  return typeof id === 'string' && id.length > 0
}

export function isValidMessage(message: unknown): message is string {
  return typeof message === 'string' && message.trim().length > 0
}