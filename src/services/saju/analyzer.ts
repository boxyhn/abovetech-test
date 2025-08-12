import { openAIClient } from '../openai/client'
import { OPENAI_CONFIG } from '../openai/config'
import {
  HOKIDONGZA_SAJU_EXPERT_PROMPT,
  SAJU_ANALYSIS_PROMPT,
} from "@/constants/hokidongza";
import { 
  formatSajuDataForPrompt,
  detectQuestionType,
  QUESTION_TYPE_PROMPTS
} from '@/constants/sajuPrompts'
import type { Session } from '@/types/database'
import { 
  calculateSajuAnalysis,
  type SajuInputObject,
  type SajuAnalysisObject 
} from './index'

/**
 * 사주 분석 서비스
 */
export class SajuAnalyzerService {
  /**
   * 초기 사주 분석 수행 (전문 리포트 생성)
   */
  async performInitialAnalysis(userInfo: Session): Promise<string | null> {
    try {
      // 1. 알고리즘 기반 사주 계산
      const sajuData = await this.calculateSajuData(userInfo);

      // 2. 계산된 데이터를 포함한 프롬프트 생성
      const prompt = this.buildAnalysisPrompt(userInfo, sajuData);

      // 3. AI를 통한 전문 리포트 생성 (호키동자 캐릭터 제외)
      const systemPrompt = `당신은 다년간의 경험을 가진 전문적이고 따뜻한 사주 명리학 상담가입니다. 
제공된 사주 분석 데이터를 바탕으로 체계적이고 전문적인 사주 분석 리포트를 작성해주세요.
모든 전문 용어는 일상적인 언어로 쉽게 풀어서 설명하고, 긍정적이고 희망적인 관점에서 분석해주세요.`;

      const response = await openAIClient.createCompletion(
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        {
          model: OPENAI_CONFIG.models.analysis,
          temperature: OPENAI_CONFIG.temperature.analysis,
          maxTokens: OPENAI_CONFIG.maxTokens.analysis,
        }
      );

      return response;
    } catch (error) {
      console.error("사주 분석 중 오류:", error);
      return null;
    }
  }

  /**
   * 사주 데이터 계산 또는 조회
   */
  private async calculateSajuData(
    userInfo: Session
  ): Promise<SajuAnalysisObject | null> {
    // 1. 먼저 DB에 저장된 사주 데이터 확인
    if (userInfo.id) {
      try {
        const { sessionRepository } = await import(
          "@/repositories/sessionRepository"
        );
        const savedData = await sessionRepository.getSajuAnalysis(userInfo.id);
        if (savedData) {
          console.log("Using saved saju analysis data");
          return savedData as unknown as SajuAnalysisObject;
        }
      } catch (error) {
        console.error("Failed to fetch saved saju data:", error);
      }
    }

    // 2. 저장된 데이터가 없으면 새로 계산
    if (
      !userInfo.birth_date ||
      !userInfo.birth_time ||
      !userInfo.gender ||
      !userInfo.user_name
    ) {
      return null;
    }

    const input: SajuInputObject = {
      name: userInfo.user_name,
      gender: userInfo.gender as "M" | "F",
      birth_date: userInfo.birth_date,
      birth_time: userInfo.birth_time,
      is_lunar: false, // 기본값, 필요시 사용자 입력 받기
    };

    try {
      const result = await calculateSajuAnalysis(input);

      // 계산한 데이터를 DB에 저장 (있으면)
      if (userInfo.id) {
        try {
          const { sessionRepository } = await import(
            "@/repositories/sessionRepository"
          );
          await sessionRepository.saveSajuAnalysis(
            userInfo.id,
            result as unknown as Record<string, unknown>
          );
          console.log("Newly calculated saju data saved");
        } catch (error) {
          console.error("Failed to save saju data:", error);
        }
      }

      return result;
    } catch (error) {
      console.error("사주 계산 오류:", error);
      return null;
    }
  }

  /**
   * 분석 프롬프트 생성 (전문 리포트용)
   */
  private buildAnalysisPrompt(
    userInfo: Session,
    sajuData: SajuAnalysisObject | null
  ): string {
    const sajuDataText = sajuData
      ? formatSajuDataForPrompt(sajuData as unknown as Record<string, unknown>)
      : "";
    const genderText =
      userInfo.gender === "M"
        ? "남성"
        : userInfo.gender === "F"
        ? "여성"
        : userInfo.gender;
    const currentDate = new Date().toLocaleDateString("ko-KR");

    return `
${SAJU_ANALYSIS_PROMPT}

## 사용자 정보
- 이름: ${userInfo.user_name}
- 생년월일: ${userInfo.birth_date}
- 태어난 시간: ${userInfo.birth_time}
- 성별: ${genderText}
- 분석 기준일: ${currentDate}

## 입력 데이터 (JSON)
${sajuDataText}

## 요청사항
위의 사주 분석 데이터를 바탕으로 [출력 형식 및 목차]에 따른 완전한 사주 분석 리포트를 작성해주세요.
전문적이면서도 따뜻하고 공감적인 어조로 작성하되, 모든 내용은 이해하기 쉽게 설명해주세요.

특히 다음 사항을 강조해주세요:
- 일간 ${sajuData?.basic_info.ilgan}의 특성을 감성적으로 표현
- 오행 분포와 십성 배치에 따른 성격 분석
- 신살이 나타내는 특별한 재능과 기회
- 현재 대운과 세운에서의 기회와 주의사항`;
  }

  /**
   * 질의응답 처리
   */
  async answerQuestion(
    session: Session,
    conversationHistory: string,
    question: string
  ): Promise<string | null> {
    try {
      // 사주 데이터 계산 (세션에 저장된 데이터 활용 가능)
      const sajuData = await this.calculateSajuData(session);

      const prompt = this.buildQAPrompt(
        session,
        conversationHistory,
        question,
        sajuData
      );

      const response = await openAIClient.createCompletion(
        [
          { role: "system", content: HOKIDONGZA_SAJU_EXPERT_PROMPT },
          { role: "user", content: prompt },
        ],
        {
          model: OPENAI_CONFIG.models.default,
          temperature: OPENAI_CONFIG.temperature.qa,
          maxTokens: OPENAI_CONFIG.maxTokens.qa,
        }
      );

      return response;
    } catch (error) {
      console.error("질의응답 처리 중 오류:", error);
      return null;
    }
  }

  /**
   * 질의응답 프롬프트 생성
   */
  private buildQAPrompt(
    session: Session,
    conversationHistory: string,
    question: string,
    sajuData?: SajuAnalysisObject | null
  ): string {
    // 질문 유형 판별
    const questionType = detectQuestionType(question);
    const questionPrompt = QUESTION_TYPE_PROMPTS[questionType];

    // 사주 데이터 포맷팅
    const sajuDataText = sajuData
      ? formatSajuDataForPrompt(sajuData as unknown as Record<string, unknown>)
      : "";
    const genderText =
      session.gender === "M"
        ? "남성"
        : session.gender === "F"
        ? "여성"
        : session.gender;

    // 현재 나이 계산
    const currentAge = session.birth_date
      ? new Date().getFullYear() -
        parseInt(session.birth_date.split("-")[0]) +
        1
      : 0;

    return `
## 사용자 정보
- 이름: ${session.user_name}
- 생년월일: ${session.birth_date}
- 태어난 시간: ${session.birth_time}
- 성별: ${genderText}
- 현재 나이: ${currentAge}세
- 현재 대운: ${
      sajuData ? this.getCurrentDaeun(sajuData, session) : "알 수 없음"
    }

${sajuDataText}

## 이전 대화 요약
${conversationHistory ? conversationHistory.slice(-500) : "없음"}

## 현재 질문
${question}

## 답변 지침
${questionPrompt}

### 답변 스타일:
- 제공된 사주 데이터를 정확히 인용하여 설명
- 호키동자 캐릭터의 친근한 말투 유지
- 전문 용어는 쉽게 풀어서 설명
- **답변은 반드시 2문단 이내로 작성 (각 문단 3-4문장)**
- **마크다운 사용 금지, 일반 텍스트로만 작성**
- **이모티콘은 문장 끝에 1-2개만 사용**
- 구체적이고 실용적인 조언 제공
- 긍정적 관점과 개선 방법 제시`;
  }

  /**
   * 현재 대운 찾기
   */
  private getCurrentDaeun(
    sajuData: SajuAnalysisObject,
    session: Session
  ): string {
    if (!session.birth_date) return "알 수 없음";

    const birthYear = parseInt(session.birth_date.split("-")[0]);
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear + 1; // 한국 나이

    for (const daeun of sajuData.basic_info.daeun) {
      if (age >= daeun.age && age < daeun.age + 10) {
        return `${daeun.age}세 ${daeun.ganji}`;
      }
    }

    return "알 수 없음";
  }
}

export const sajuAnalyzerService = new SajuAnalyzerService()