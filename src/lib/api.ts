import type { CreateSessionResponse, SendMessageRequest, SendMessageResponse } from '@/types/api'

const API_BASE = '/api'

export class ApiClient {
  static async createSession(): Promise<CreateSessionResponse> {
    const response = await fetch(`${API_BASE}/chat/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to create session')
    }

    return response.json()
  }

  static async sendMessage(data: SendMessageRequest): Promise<SendMessageResponse> {
    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Failed to send message')
    }

    return response.json()
  }

  static async getSessionStatus(sessionId: string): Promise<{ status: string; latestMessage?: string }> {
    const response = await fetch(`${API_BASE}/chat/session/${sessionId}`)

    if (!response.ok) {
      throw new Error('Failed to get session status')
    }

    return response.json()
  }
}