import { openAIClient } from '../openai/client'
import { OPENAI_CONFIG } from '../openai/config'
import { HOKIDONGZA_INFO_EXTRACTOR_PROMPT } from '@/constants/hokidongza'
import type { Session } from '@/types/database'

export interface ExtractedInfo {
  name: string | null
  birth_date: string | null
  birth_time: string | null
  gender: string | null
}

export interface MissingInfo {
  fields: string[]
  hasAll: boolean
}

/**
 * 사주 정보 추출 서비스
 */
export class InfoExtractorService {
  /**
   * 대화에서 사주 정보 추출
   */
  async extractInfo(
    conversationHistory: string,
    newMessage: string
  ): Promise<ExtractedInfo> {
    const prompt = this.buildExtractionPrompt(conversationHistory, newMessage)
    
    const response = await openAIClient.createCompletion(
      [
        { role: 'system', content: HOKIDONGZA_INFO_EXTRACTOR_PROMPT },
        { role: 'user', content: prompt }
      ],
      {
        model: OPENAI_CONFIG.models.extraction,
        temperature: OPENAI_CONFIG.temperature.extraction,
        responseFormat: { type: 'json_object' }
      }
    )

    if (!response) {
      return { name: null, birth_date: null, birth_time: null, gender: null }
    }

    try {
      return JSON.parse(response)
    } catch (error) {
      console.error('Failed to parse extraction response:', error)
      return { name: null, birth_date: null, birth_time: null, gender: null }
    }
  }

  /**
   * 추출 프롬프트 생성
   */
  private buildExtractionPrompt(
    conversationHistory: string,
    newMessage: string
  ): string {
    return `
다음 대화에서 사용자의 사주 정보를 추출해주세요:

대화 내용:
${conversationHistory}
새 메시지: ${newMessage}

다음 형식에 맞춰 정보를 추출해주세요:
- name: 사용자의 이름 (문자열)
- birth_date: YYYY-MM-DD 형식 (예: 1990-01-01)
- birth_time: HH:MM 또는 H:MM 형식, 24시간제 (예: 14:30, 9:00, 09:00)
- gender: 성별은 반드시 "M" (남성) 또는 "F" (여성)으로만 표시

주의사항:
- 생년월일은 반드시 YYYY-MM-DD 형식으로 변환
- 시간은 HH:MM 또는 H:MM 형식으로 변환 (오전/오후를 24시간제로)
  * 오전 9시 → "9:00"
  * 오후 2시 30분 → "14:30"
  * 새벽 1시 → "1:00"
  * 정오 → "12:00"
  * 자정 → "0:00"
- 성별: 남자/남성/남 → "M", 여자/여성/여 → "F"
- 찾을 수 없는 정보는 null로 표시

JSON 형식으로 반환:
{"name": "홍길동", "birth_date": "1990-01-01", "birth_time": "14:30", "gender": "M"}`
  }

  /**
   * 누락된 정보 확인
   */
  checkMissingInfo(session: Session): MissingInfo {
    const missingFields: string[] = []
    
    if (!session.user_name) missingFields.push('이름')
    if (!session.birth_date) missingFields.push('생년월일')
    if (!session.birth_time) missingFields.push('태어난 시간')
    if (!session.gender) missingFields.push('성별')

    return {
      fields: missingFields,
      hasAll: missingFields.length === 0
    }
  }

  /**
   * 수집된 정보 포맷팅
   */
  formatCollectedInfo(session: Session): string[] {
    const info: string[] = []
    
    if (session.user_name) info.push(`이름: ${session.user_name}`)
    if (session.birth_date) info.push(`생년월일: ${session.birth_date}`)
    if (session.birth_time) info.push(`태어난 시간: ${session.birth_time}`)
    if (session.gender) {
      const genderText = session.gender === 'M' ? '남성' : session.gender === 'F' ? '여성' : session.gender
      info.push(`성별: ${genderText}`)
    }
    
    return info
  }

  /**
   * 정보 수집 응답 메시지 생성
   */
  buildInfoGatheringResponse(
    collectedInfo: string[],
    missingInfo: string[]
  ): string {
    let response = ''
    
    if (collectedInfo.length > 0) {
      response = `와! 선생님이 알려주신 정보예요 😊\n${collectedInfo.join('\n')}\n\n`
    }
    
    if (missingInfo.length > 0) {
      response += `선생님, 다음 정보도 알려주세요: ${missingInfo.join(', ')}`
    }
    
    return response
  }
}

export const infoExtractorService = new InfoExtractorService()