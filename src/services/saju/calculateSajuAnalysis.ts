// 통합 사주 분석 함수
import { 
  SajuInputObject,
  SajuAnalysisObject,
  BasicInfo,
  PrimaryAnalysis,
  InDepthAnalysis
} from './types';
import { LunarCalendarService } from './lunarCalendar';
import { DaeunCalculator } from './daeunCalculator';
import { OhaengAnalyzer } from './ohaengAnalyzer';
import { SipseongAnalyzer } from './sipseongAnalyzer';
import { UnseongAnalyzer } from './unseongAnalyzer';
import { ShinsalAnalyzer } from './shinsalAnalyzer';
import { InteractionAnalyzer } from './interactionAnalyzer';
import { AdvancedAnalyzer } from './advancedAnalyzer';
import { adjustTimeForLocation } from './utils/timeUtils';

/**
 * 사주 분석 통합 함수
 * 생년월일시와 성별 정보를 받아 완전한 사주 분석 데이터를 반환
 */
export async function calculateSajuAnalysis(input: SajuInputObject): Promise<SajuAnalysisObject> {
  try {
    // 1. 입력 데이터 검증
    validateInput(input);

    // 2. 날짜 파싱
    const { year, month, day, hour, minute } = parseDateTime(input.birth_date, input.birth_time);

    // 3. 시간 보정 (서머타임 + 진태양시) - 서울 기준 또는 입력된 경도
    const adjustedDate = adjustTimeForLocation(
      new Date(year, month - 1, day, hour, minute),
      input.longitude || 126.9778,  // 서울 기본값
      {
        applySummerTime: true,
        useEquationOfTime: true
      }
    );

    // 보정된 시간 추출
    const adjustedYear = adjustedDate.getFullYear();
    const adjustedMonth = adjustedDate.getMonth() + 1;
    const adjustedDay = adjustedDate.getDate();
    const adjustedHour = adjustedDate.getHours();
    const adjustedMinute = adjustedDate.getMinutes();

    // 4. 서비스 인스턴스 생성
    const lunarCalendar = new LunarCalendarService();
    const daeunCalculator = new DaeunCalculator();
    const ohaengAnalyzer = new OhaengAnalyzer();
    const sipseongAnalyzer = new SipseongAnalyzer();
    const unseongAnalyzer = new UnseongAnalyzer();
    const shinsalAnalyzer = new ShinsalAnalyzer();
    const interactionAnalyzer = new InteractionAnalyzer();
    const advancedAnalyzer = new AdvancedAnalyzer();

    // 5. 사주팔자 계산 (보정된 시간 사용)
    const sajuPalja = await lunarCalendar.calculateSajuPalja(
      adjustedYear,
      adjustedMonth,
      adjustedDay,
      adjustedHour,
      adjustedMinute,
      input.is_lunar,
      true  // 이미 보정됨
    );

    // 6. 일간 추출
    const ilgan = sajuPalja.day_pillar[0];

    // 7. 대운 계산 (고정밀 옵션 포함, 보정된 시간 사용)
    const calculationOptions = {
      longitude: input.longitude || 126.9778,  // 서울 기본값
      latitude: input.latitude || 37.5665,
      calculationMethod: 'traditional' as const,
      termType: 'both' as const,  // 절기와 중기 모두 사용
      ageSystem: 'korean' as const,
      precision: 'hour' as const,  // 시간 단위 정밀도
      useEquationOfTime: false  // 이미 보정됨
    };
    
    const daeun = await daeunCalculator.calculateDaeun(
      sajuPalja,
      input.gender,
      adjustedYear,
      adjustedMonth,
      adjustedDay,
      adjustedHour,
      adjustedMinute,
      calculationOptions
    );

    // 8. 현재 세운 계산 (보정된 경도 사용)
    const seun = await lunarCalendar.calculateCurrentSeun(input.longitude || 126.9778);

    // 9. 기본 정보 구성
    const basicInfo: BasicInfo = {
      saju_palja: sajuPalja,
      ilgan,
      daeun: daeun.slice(0, 10), // 최대 10개 대운
      seun
    };

    // 10. 1차 분석 수행
    // 오행 분포 계산
    const ohaengDistribution = ohaengAnalyzer.calculateOhaengDistribution(sajuPalja, true);
    
    // 십성 매핑
    const sipseongMap = sipseongAnalyzer.calculateSipseongMap(sajuPalja, ilgan);
    
    // 12운성 매핑
    const unseong12Map = unseongAnalyzer.calculateUnseong12Map(sajuPalja, ilgan);
    
    // 신살 추출
    const shinsal = shinsalAnalyzer.extractShinsal(sajuPalja);
    
    // 간지 상호작용 분석
    const interactions = interactionAnalyzer.analyzeInteractions(sajuPalja);

    const primaryAnalysis: PrimaryAnalysis = {
      ohaeng_distribution: ohaengDistribution,
      sipseong_map: sipseongMap,
      unseong_12_map: unseong12Map,
      shinsal,
      interactions
    };

    // 11. 심층 분석 수행
    const inDepthAnalysis: InDepthAnalysis = advancedAnalyzer.performInDepthAnalysis(
      sajuPalja,
      ilgan,
      sipseongMap,
      ohaengDistribution
    );

    // 12. 최종 결과 조립
    const result: SajuAnalysisObject = {
      basic_info: basicInfo,
      primary_analysis: primaryAnalysis,
      in_depth_analysis: inDepthAnalysis
    };

    return result;

  } catch (error) {
    console.error('사주 분석 중 오류 발생:', error);
    throw new Error(`사주 분석 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
}

/**
 * 입력 데이터 검증
 */
function validateInput(input: SajuInputObject): void {
  if (!input.name || input.name.trim() === '') {
    throw new Error('이름이 필요합니다');
  }

  if (input.gender !== 'M' && input.gender !== 'F') {
    throw new Error('성별은 M 또는 F여야 합니다');
  }

  if (!input.birth_date || !isValidDate(input.birth_date)) {
    throw new Error('유효한 생년월일이 필요합니다 (YYYY-MM-DD)');
  }

  if (!input.birth_time) {
    throw new Error('출생 시간이 입력되지 않았습니다');
  }
  
  if (!isValidTime(input.birth_time)) {
    throw new Error(`유효한 출생 시간이 필요합니다 (HH:MM 또는 H:MM 형식). 입력된 값: ${input.birth_time}`);
  }
}

/**
 * 날짜 유효성 검사
 */
function isValidDate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * 시간 유효성 검사
 */
function isValidTime(timeString: string): boolean {
  // 널 체크
  if (!timeString || typeof timeString !== 'string') {
    console.error('Invalid time input:', timeString);
    return false;
  }
  
  // HH:MM 또는 H:MM 형식 모두 허용
  const regex = /^([01]?\d|2[0-3]):([0-5]\d)$/;
  if (!regex.test(timeString)) {
    console.error('Time format does not match regex:', timeString);
    return false;
  }
  
  // 추가 검증: 시간이 0-23 범위인지 확인
  const [hour, minute] = timeString.split(':').map(Number);
  const isValid = hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
  
  if (!isValid) {
    console.error('Time out of valid range:', { hour, minute });
  }
  
  return isValid;
}

/**
 * 날짜/시간 파싱
 */
function parseDateTime(dateString: string, timeString: string): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
} {
  const [year, month, day] = dateString.split('-').map(Number);
  const timeParts = timeString.split(':');
  
  // 시간 형식 정규화 (한 자리 숫자를 두 자리로)
  const hour = parseInt(timeParts[0], 10);
  const minute = parseInt(timeParts[1], 10);

  return { year, month, day, hour, minute };
}

/**
 * 사주 분석 결과를 읽기 쉬운 텍스트로 변환
 */
export function formatSajuAnalysisForDisplay(analysis: SajuAnalysisObject): string {
  const { basic_info, primary_analysis, in_depth_analysis } = analysis;
  
  let result = '=== 사주 분석 결과 ===\n\n';
  
  // 사주팔자
  result += '【사주팔자】\n';
  result += `년주: ${basic_info.saju_palja.year_pillar}\n`;
  result += `월주: ${basic_info.saju_palja.month_pillar}\n`;
  result += `일주: ${basic_info.saju_palja.day_pillar}\n`;
  result += `시주: ${basic_info.saju_palja.hour_pillar}\n\n`;
  
  // 일간
  result += `【일간】 ${basic_info.ilgan}\n\n`;
  
  // 대운
  result += '【대운】\n';
  basic_info.daeun.forEach(d => {
    result += `${d.age}세: ${d.ganji}\n`;
  });
  result += '\n';
  
  // 현재 세운
  result += `【${basic_info.seun.year}년 세운】 ${basic_info.seun.ganji}\n\n`;
  
  // 오행 분포
  result += '【오행 분포】\n';
  result += `목(木): ${primary_analysis.ohaeng_distribution.wood}\n`;
  result += `화(火): ${primary_analysis.ohaeng_distribution.fire}\n`;
  result += `토(土): ${primary_analysis.ohaeng_distribution.earth}\n`;
  result += `금(金): ${primary_analysis.ohaeng_distribution.metal}\n`;
  result += `수(水): ${primary_analysis.ohaeng_distribution.water}\n\n`;
  
  // 십성
  result += '【십성 분포】\n';
  result += `년간: ${primary_analysis.sipseong_map.year_gan}\n`;
  result += `월간: ${primary_analysis.sipseong_map.month_gan}\n`;
  result += `시간: ${primary_analysis.sipseong_map.hour_gan}\n`;
  result += `년지: ${primary_analysis.sipseong_map.year_ji}\n`;
  result += `월지: ${primary_analysis.sipseong_map.month_ji}\n`;
  result += `일지: ${primary_analysis.sipseong_map.day_ji}\n`;
  result += `시지: ${primary_analysis.sipseong_map.hour_ji}\n\n`;
  
  // 12운성
  result += '【12운성】\n';
  result += `년주: ${primary_analysis.unseong_12_map.year_pillar}\n`;
  result += `월주: ${primary_analysis.unseong_12_map.month_pillar}\n`;
  result += `일주: ${primary_analysis.unseong_12_map.day_pillar}\n`;
  result += `시주: ${primary_analysis.unseong_12_map.hour_pillar}\n\n`;
  
  // 신살
  if (primary_analysis.shinsal.length > 0) {
    result += '【신살】\n';
    result += primary_analysis.shinsal.join(', ') + '\n\n';
  }
  
  // 간지 관계
  result += '【간지 관계】\n';
  if (primary_analysis.interactions.hap.length > 0) {
    result += `합: ${primary_analysis.interactions.hap.join(', ')}\n`;
  }
  if (primary_analysis.interactions.chung.length > 0) {
    result += `충: ${primary_analysis.interactions.chung.join(', ')}\n`;
  }
  if (primary_analysis.interactions.hyeong.length > 0) {
    result += `형: ${primary_analysis.interactions.hyeong.join(', ')}\n`;
  }
  if (primary_analysis.interactions.pa.length > 0) {
    result += `파: ${primary_analysis.interactions.pa.join(', ')}\n`;
  }
  if (primary_analysis.interactions.hae.length > 0) {
    result += `해: ${primary_analysis.interactions.hae.join(', ')}\n`;
  }
  result += '\n';
  
  // 심층 분석
  result += '【심층 분석】\n';
  result += `격국: ${in_depth_analysis.gyeokguk}\n`;
  result += `용신: ${in_depth_analysis.yongsin}\n`;
  result += `희신: ${in_depth_analysis.huisin}\n`;
  result += `기신: ${in_depth_analysis.gisin}\n`;
  
  return result;
}