/**
 * OpenAI 설정 관리
 */

export const OPENAI_CONFIG = {
  // 모델 설정
  models: {
    default: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    extraction: process.env.OPENAI_EXTRACTION_MODEL || 'gpt-4o-mini',
    analysis: process.env.OPENAI_ANALYSIS_MODEL || 'gpt-4o-mini'
  },
  
  // 온도 설정 (창의성 수준)
  temperature: {
    extraction: 0.3,  // 정보 추출은 정확성 우선
    analysis: 0.8,    // 사주 분석은 창의성 필요
    qa: 0.7          // 질의응답은 균형
  },
  
  // 토큰 제한
  maxTokens: {
    default: 1000,
    analysis: 2000,  // 상세 분석은 더 긴 응답 허용
    qa: 1000
  },
  
  // 재시도 설정
  retry: {
    maxAttempts: 3,
    delayMs: 1000
  }
} as const