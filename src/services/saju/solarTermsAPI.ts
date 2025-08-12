import { XMLParser } from "fast-xml-parser";
import { 
  SOLAR_TERM_TO_MONTH_BRANCH, 
  SOLAR_TERM_DATES,
  type SolarTerm 
} from "@/constants/solarTerms";

// 24절기 정보 타입
export interface SolarTermInfo {
  dateKind: string; // 절기 종류 코드
  dateName: string; // 절기명 (예: 경칩, 춘분)
  isHoliday: string; // 공휴일 여부 (Y/N)
  kst: string; // 절기 시각 (HHMM 형식)
  locdate: string; // 날짜 (YYYYMMDD)
  seq: number; // 순번
  sunLongitude: number; // 태양 황경
}


/**
 * SolarTermInfo를 Date 객체로 변환하는 유틸리티 함수
 */
export function convertSolarTermToDate(term: SolarTermInfo): Date {
  const locdateStr = String(term.locdate);
  const kstStr = String(term.kst).padStart(4, '0');
  const year = parseInt(locdateStr.substring(0, 4));
  const month = parseInt(locdateStr.substring(4, 6));
  const day = parseInt(locdateStr.substring(6, 8));
  const hour = parseInt(kstStr.substring(0, 2));
  const minute = parseInt(kstStr.substring(2, 4));
  return new Date(year, month - 1, day, hour, minute);
}

/**
 * 천문연구원 API를 통한 24절기 정보 서비스
 */
export class SolarTermsAPIService {
  private apiKey: string;
  private baseUrl =
    "https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/get24DivisionsInfo";
  private cache: Map<string, SolarTermInfo[]> = new Map();
  private yearCache: Map<number, SolarTermInfo[]> = new Map(); // 연도별 전체 절기 캐싱

  constructor(apiKey?: string) {
    // 환경변수 또는 직접 전달된 API 키 사용
    // URL searchParams가 자동으로 인코딩하므로 디코딩된 키 사용
    this.apiKey =
      apiKey ||
      process.env.KASI_API_KEY ||
      "cC2DM1pjfym2MVnv89OftHJXvBUPTzRMLpvgLxH2S4MG10b7Z//H5nmtuYVPnI+TO78Or1pM5sy2TjSktmBkUg==";

    // API 키가 없거나 테스트 키인 경우 경고
    if (!this.apiKey) {
      console.log("천문연구원 API: 폴백 계산 모드로 동작합니다.");
    }
  }

  /**
   * 특정 년월의 절기 정보 조회
   */
  async getSolarTerms(year: number, month: number): Promise<SolarTermInfo[]> {
    const cacheKey = `${year}-${month}`;

    // 캐시 확인
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // API 키가 없으면 빈 배열 반환 (폴백 사용)
    if (!this.apiKey) {
      return [];
    }

    try {
      const url = new URL(this.baseUrl);
      url.searchParams.append("ServiceKey", this.apiKey); // 대문자 S 주의
      url.searchParams.append("solYear", year.toString());
      url.searchParams.append("solMonth", month.toString().padStart(2, "0")); // 9 -> 09
      url.searchParams.append("numOfRows", "10");

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const xmlText = await response.text();

      // XML 파싱
      const parser = new XMLParser({
        ignoreAttributes: false,
        parseAttributeValue: true,
      });
      const result = parser.parse(xmlText);

      // 응답 처리 - OpenAPI_ServiceResponse 오류 체크
      if (result.OpenAPI_ServiceResponse?.cmmMsgHeader) {
        // API 키 오류 - 자동으로 폴백 사용
        // API 키 오류시 폴백 사용
        return [];
      }

      // 정상 응답 처리 (resultCode는 숫자 0 또는 문자열 "00")
      if (
        result.response?.header?.resultCode === "00" ||
        result.response?.header?.resultCode === 0
      ) {
        const items = result.response.body?.items?.item;

        // items가 빈 문자열이거나 없는 경우 - 폴백 사용
        if (!items || items === "") {
          return [];
        }

        const solarTerms = Array.isArray(items) ? items : items ? [items] : [];

        // 캐시 저장
        this.cache.set(cacheKey, solarTerms);
        return solarTerms;
      } else if (
        result.response?.header?.resultCode === "03" ||
        result.response?.header?.resultCode === 3
      ) {
        // 데이터 없음
        console.log(`${year}년 ${month}월 절기 데이터 없음`);
        return [];
      } else {
        console.error("API Error Response:", result);
        // 오류시 폴백 사용
        return [];
      }
    } catch (error) {
      console.error("절기 정보 조회 실패:", error);
      // API 실패 시 빈 배열 반환 (기본 계산으로 폴백)
      return [];
    }
  }

  /**
   * 특정 날짜가 속한 절기 계산 (절입 시각 고려) 24절기 기준
   */
  async getCurrentSolarTerm(
    date: Date,
    hour: number = 12,
    minute: number = 0
  ): Promise<{ term: string; branch: string; termDate: Date } | null> {
    const year = date.getFullYear();

    // 2004년 이전은 API 사용 불가
    if (year <= 2004) {
      return null;
    }

    try {
      // 연도 전체 절기 데이터 가져오기 (캐싱)
      const yearTerms = await this.getYearlySolarTerms(year);
      const prevYearTerms = await this.getYearlySolarTerms(year - 1);
      const nextYearTerms = await this.getYearlySolarTerms(year + 1);

      // 모든 절기 병합
      const allTerms = [...prevYearTerms, ...yearTerms, ...nextYearTerms];

      // 날짜순 정렬
      allTerms.sort((a, b) => parseInt(a.locdate) - parseInt(b.locdate));

      // 현재 날짜시간이 속한 절기 찾기 (시간 고려)
      const currentDateTime = new Date(date);
      currentDateTime.setHours(hour, minute, 0, 0);

      let currentTerm: SolarTermInfo | null = null;
      let currentTermDate: Date | null = null;

      for (let i = 0; i < allTerms.length - 1; i++) {
        const term = allTerms[i];
        const termDateTime = convertSolarTermToDate(term);

        if (i < allTerms.length - 1) {
          const nextTerm = allTerms[i + 1];
          const nextDateTime = convertSolarTermToDate(nextTerm);

          if (
            currentDateTime >= termDateTime &&
            currentDateTime < nextDateTime
          ) {
            currentTerm = term;
            currentTermDate = termDateTime;
            break;
          }
        }
      }

      if (currentTerm && currentTermDate) {
        const branch = SOLAR_TERM_TO_MONTH_BRANCH[currentTerm.dateName as SolarTerm];
        if (branch) {
          return {
            term: currentTerm.dateName,
            branch,
            termDate: currentTermDate,
          };
        }
      }

      return null;
    } catch (error) {
      console.error("절기 계산 실패:", error);
      return null;
    }
  }

  /**
   * 년도의 모든 절기 정보 조회 (캐싱 강화)
   */
  async getYearlySolarTerms(year: number): Promise<SolarTermInfo[]> {
    // 연도별 캐시 확인
    if (this.yearCache.has(year)) {
      return this.yearCache.get(year)!;
    }

    // 2004년 이전은 빈 배열 반환
    if (year <= 2004) {
      return [];
    }

    const allTerms: SolarTermInfo[] = [];

    for (let month = 1; month <= 12; month++) {
      const terms = await this.getSolarTerms(year, month);
      allTerms.push(...terms);
    }

    // 날짜순 정렬
    allTerms.sort((a, b) => parseInt(a.locdate) - parseInt(b.locdate));

    // 연도별 캐시 저장
    this.yearCache.set(year, allTerms);

    return allTerms;
  }

  /**
   * 절기 기반 월지 계산 (API 실패시 폴백용)
   */
  static calculateMonthBranchFallback(date: Date): string {
    const month = date.getMonth() + 1;
    const day = date.getDate();


    // 현재 날짜가 어느 절기 구간에 속하는지 확인
    const currentMonthTerms = SOLAR_TERM_DATES[month];
    const prevMonthTerms = SOLAR_TERM_DATES[month === 1 ? 12 : month - 1];
    
    let termName: SolarTerm;
    
    if (currentMonthTerms && currentMonthTerms.length > 0) {
      // 현재 월의 절(節) 이전인 경우
      if (day < currentMonthTerms[0].day) {
        // 이전 월의 절기 사용
        if (prevMonthTerms && prevMonthTerms.length > 0) {
          // 이전 월의 중기 이후
          termName = prevMonthTerms[prevMonthTerms.length - 1].term;
        } else {
          termName = month === 1 ? "동지" : "대설";
        }
      } 
      // 현재 월의 중기 이후인 경우
      else if (currentMonthTerms.length > 1 && day >= currentMonthTerms[1].day) {
        termName = currentMonthTerms[1].term;
      }
      // 현재 월의 절과 중기 사이
      else {
        termName = currentMonthTerms[0].term;
      }
    } else {
      // 기본값
      termName = "대설";
    }

    return SOLAR_TERM_TO_MONTH_BRANCH[termName] || "子";
  }
}

// 싱글톤 인스턴스
export const solarTermsAPI = new SolarTermsAPIService();
