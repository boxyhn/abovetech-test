import { openAIClient } from '../openai/client'
import { OPENAI_CONFIG } from '../openai/config'
import { HOKIDONGZA_SAJU_EXPERT_PROMPT } from '@/constants/hokidongza'
import type { Session } from '@/types/database'

/**
 * 사주 분석 서비스
 */
export class SajuAnalyzerService {
  /**
   * 초기 사주 분석 수행
   */
  async performInitialAnalysis(userInfo: Session): Promise<string | null> {
    const prompt = this.buildAnalysisPrompt(userInfo)
    
    const response = await openAIClient.createCompletion(
      [
        { role: 'system', content: HOKIDONGZA_SAJU_EXPERT_PROMPT },
        { role: 'user', content: prompt }
      ],
      {
        model: OPENAI_CONFIG.models.analysis,
        temperature: OPENAI_CONFIG.temperature.analysis,
        maxTokens: OPENAI_CONFIG.maxTokens.analysis
      }
    )

    return response
  }

  /**
   * 분석 프롬프트 생성
   */
  private buildAnalysisPrompt(userInfo: Session): string {
    return `
다음 정보를 바탕으로 사주에 대한 전반적인 분석을 제공해주세요:

이름: ${userInfo.user_name}
생년월일: ${userInfo.birth_date}
태어난 시간: ${userInfo.birth_time}
성별: ${userInfo.gender}

다음 항목들을 포함하여 상세하게 분석해주세요:
1. 전반적인 사주 개요
2. 타고난 성격과 기질
3. 강점과 장점
4. 약점과 개선점
5. 인생의 주요 테마
6. 행운의 시기와 주의할 시기

전문적이면서도 이해하기 쉽게 설명해주세요.`
  }

  /**
   * 질의응답 처리
   */
  async answerQuestion(
    session: Session,
    conversationHistory: string,
    question: string,
    analysisResult?: string | null
  ): Promise<string | null> {
    const prompt = this.buildQAPrompt(session, conversationHistory, question, analysisResult)
    
    const response = await openAIClient.createCompletion(
      [
        { role: 'system', content: HOKIDONGZA_SAJU_EXPERT_PROMPT },
        { role: 'user', content: prompt }
      ],
      {
        model: OPENAI_CONFIG.models.default,
        temperature: OPENAI_CONFIG.temperature.qa,
        maxTokens: OPENAI_CONFIG.maxTokens.qa
      }
    )

    return response
  }

  /**
   * 질의응답 프롬프트 생성
   */
  private buildQAPrompt(
    session: Session,
    conversationHistory: string,
    question: string,
    analysisResult?: string | null
  ): string {
    return `
[사용자 정보]
이름: ${session.user_name}
생년월일: ${session.birth_date}
태어난 시간: ${session.birth_time}
성별: ${session.gender}

[초기 사주 분석 결과]
${analysisResult || '분석 중...'}

[이전 대화 내용]
${conversationHistory}

[현재 질문]
${question}

위 사용자의 사주 정보와 대화 맥락을 고려하여 질문에 답변해주세요. 
답변 시 다음 사항을 고려해주세요:
- 사용자의 생년월일과 시간을 바탕으로 한 사주 팔자 해석
- 이전 대화에서 언급된 내용과의 일관성
- 친근하고 전문적인 어조 유지
- 구체적이고 실용적인 조언 제공`
  }
}

export const sajuAnalyzerService = new SajuAnalyzerService()