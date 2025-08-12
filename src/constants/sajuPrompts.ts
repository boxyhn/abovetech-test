/**
 * 사주 분석 관련 구조화된 프롬프트
 */

/**
 * 사주 분석 시스템 프롬프트
 */
export const SAJU_ANALYSIS_SYSTEM_PROMPT = `
당신은 전문 사주 명리학자입니다. 제공된 사주 데이터를 기반으로 정확하고 통찰력 있는 분석을 제공합니다.

## 분석 원칙
1. 모든 해석은 제공된 사주 데이터(사주팔자, 오행, 십성, 운성, 신살 등)에 기반해야 합니다
2. 격국과 용신을 중심으로 전체적인 흐름을 파악합니다
3. 대운과 세운을 고려하여 시기별 운세를 설명합니다
4. 전문 용어는 쉽게 풀어서 설명합니다
5. 긍정적인 면과 개선점을 균형있게 제시합니다

## 분석 구조
1. 전체적인 사주 개요 (격국과 일간 특성)
2. 오행 균형과 성격 특성
3. 십성 분포에 따른 재능과 적성
4. 신살과 특별한 기운
5. 대운별 인생 흐름
6. 현재와 미래 조언
`;

/**
 * 사주 데이터 포맷팅 함수
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatSajuDataForPrompt(sajuData: Record<string, any>): string {
  if (!sajuData) return '';

  const { basic_info, primary_analysis, in_depth_analysis } = sajuData;
  
  return `
## 사주 분석 데이터

### 사주팔자
- 년주: ${basic_info.saju_palja.year_pillar}
- 월주: ${basic_info.saju_palja.month_pillar}
- 일주: ${basic_info.saju_palja.day_pillar}
- 시주: ${basic_info.saju_palja.hour_pillar}
- 일간: ${basic_info.ilgan}

### 오행 분포
- 목(木): ${primary_analysis.ohaeng_distribution.wood}
- 화(火): ${primary_analysis.ohaeng_distribution.fire}
- 토(土): ${primary_analysis.ohaeng_distribution.earth}
- 금(金): ${primary_analysis.ohaeng_distribution.metal}
- 수(水): ${primary_analysis.ohaeng_distribution.water}

### 십성 분포
- 년간: ${primary_analysis.sipseong_map.year_gan}
- 월간: ${primary_analysis.sipseong_map.month_gan}
- 시간: ${primary_analysis.sipseong_map.hour_gan}
- 년지: ${primary_analysis.sipseong_map.year_ji}
- 월지: ${primary_analysis.sipseong_map.month_ji}
- 일지: ${primary_analysis.sipseong_map.day_ji}
- 시지: ${primary_analysis.sipseong_map.hour_ji}

### 12운성
- 년주: ${primary_analysis.unseong_12_map.year_pillar}
- 월주: ${primary_analysis.unseong_12_map.month_pillar}
- 일주: ${primary_analysis.unseong_12_map.day_pillar}
- 시주: ${primary_analysis.unseong_12_map.hour_pillar}

### 신살
${primary_analysis.shinsal.length > 0 ? primary_analysis.shinsal.join(', ') : '없음'}

### 간지 관계
${formatInteractions(primary_analysis.interactions)}

### 심층 분석
- 격국: ${in_depth_analysis.gyeokguk}
- 용신: ${in_depth_analysis.yongsin}
- 희신: ${in_depth_analysis.huisin}
- 기신: ${in_depth_analysis.gisin}

### 대운
${formatDaeun(basic_info.daeun)}

### 현재 세운
${basic_info.seun.year}년: ${basic_info.seun.ganji}
`;
}

/**
 * 간지 관계 포맷팅
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatInteractions(interactions: Record<string, any>): string {
  const parts = [];
  
  if (interactions.hap?.length > 0) {
    parts.push(`- 합: ${interactions.hap.join(', ')}`);
  }
  if (interactions.chung?.length > 0) {
    parts.push(`- 충: ${interactions.chung.join(', ')}`);
  }
  if (interactions.hyeong?.length > 0) {
    parts.push(`- 형: ${interactions.hyeong.join(', ')}`);
  }
  if (interactions.pa?.length > 0) {
    parts.push(`- 파: ${interactions.pa.join(', ')}`);
  }
  if (interactions.hae?.length > 0) {
    parts.push(`- 해: ${interactions.hae.join(', ')}`);
  }
  
  return parts.length > 0 ? parts.join('\n') : '- 특별한 관계 없음';
}

/**
 * 대운 포맷팅
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatDaeun(daeun: Array<Record<string, any>>): string {
  if (!daeun || daeun.length === 0) return '대운 정보 없음';
  
  return daeun.map(d => `- ${d.age}세: ${d.ganji}`).join('\n');
}

/**
 * 질문 유형별 프롬프트 템플릿
 */
export const QUESTION_TYPE_PROMPTS = {
  // 연애/결혼
  LOVE: `
위 사주 데이터를 기반으로 연애와 결혼운을 분석해주세요:
1. 이성운과 인연의 시기
2. 이상적인 배우자상
3. 연애와 결혼에서 주의할 점
4. 좋은 인연을 만나는 방법
`,

  // 직업/사업
  CAREER: `
위 사주 데이터를 기반으로 직업운과 사업운을 분석해주세요:
1. 적성에 맞는 직업 분야
2. 사업 성공 가능성
3. 재물운과 금전운
4. 경력 발전 시기
`,

  // 건강
  HEALTH: `
위 사주 데이터를 기반으로 건강운을 분석해주세요:
1. 타고난 체질과 건강 상태
2. 주의해야 할 건강 문제
3. 건강 관리 방법
4. 나이대별 건강 주의사항
`,

  // 대인관계
  RELATIONSHIP: `
위 사주 데이터를 기반으로 대인관계를 분석해주세요:
1. 대인관계 성향과 특징
2. 인복과 귀인운
3. 주의해야 할 인간관계
4. 관계 개선 방법
`,

  // 일반 질문
  GENERAL: `
위 사주 데이터를 기반으로 질문에 대해 상세히 답변해주세요.
사주의 각 요소(오행, 십성, 격국, 용신 등)를 종합적으로 고려하여 설명해주세요.
`
};

/**
 * 질문 유형 판별 함수
 */
export function detectQuestionType(question: string): keyof typeof QUESTION_TYPE_PROMPTS {
  const loveKeywords = ['연애', '결혼', '이성', '배우자', '인연', '사랑'];
  const careerKeywords = ['직업', '사업', '일', '돈', '재물', '금전', '취업', '이직'];
  const healthKeywords = ['건강', '병', '몸', '체력', '질병', '아프'];
  const relationshipKeywords = ['인간관계', '대인관계', '친구', '상사', '동료', '가족'];

  if (loveKeywords.some(keyword => question.includes(keyword))) {
    return 'LOVE';
  } else if (careerKeywords.some(keyword => question.includes(keyword))) {
    return 'CAREER';
  } else if (healthKeywords.some(keyword => question.includes(keyword))) {
    return 'HEALTH';
  } else if (relationshipKeywords.some(keyword => question.includes(keyword))) {
    return 'RELATIONSHIP';
  }
  
  return 'GENERAL';
}