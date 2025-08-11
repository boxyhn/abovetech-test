import OpenAI from 'openai'
import { OPENAI_CONFIG } from './config'

/**
 * OpenAI 클라이언트 싱글톤
 */
class OpenAIClient {
  private static instance: OpenAI | null = null

  static getInstance(): OpenAI {
    if (!this.instance) {
      const apiKey = process.env.OPENAI_API_KEY
      
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY is not configured')
      }

      this.instance = new OpenAI({ apiKey })
    }

    return this.instance
  }

  /**
   * 재시도 로직이 포함된 completion 요청
   */
  static async createCompletion(
    messages: OpenAI.Chat.ChatCompletionMessageParam[],
    options?: {
      model?: string
      temperature?: number
      maxTokens?: number
      responseFormat?: { type: 'json_object' | 'text' }
    }
  ): Promise<string | null> {
    const client = this.getInstance()
    const { retry } = OPENAI_CONFIG
    
    let lastError: Error | null = null
    
    for (let attempt = 1; attempt <= retry.maxAttempts; attempt++) {
      try {
        const completion = await client.chat.completions.create({
          model: options?.model || OPENAI_CONFIG.models.default,
          messages,
          temperature: options?.temperature ?? OPENAI_CONFIG.temperature.qa,
          max_tokens: options?.maxTokens ?? OPENAI_CONFIG.maxTokens.default,
          response_format: options?.responseFormat
        })

        return completion.choices[0].message.content
      } catch (error) {
        lastError = error as Error
        console.error(`OpenAI API attempt ${attempt} failed:`, error)
        
        if (attempt < retry.maxAttempts) {
          await this.delay(retry.delayMs * attempt) // 지수 백오프
        }
      }
    }

    console.error('All OpenAI API attempts failed:', lastError)
    return null
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export const openAIClient = OpenAIClient