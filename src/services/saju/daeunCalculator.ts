// 대운 계산 서비스 (고정밀 만세력 수준)
import { 
  Daeun, 
  SajuPalja, 
  HEAVENLY_STEMS, 
  EARTHLY_BRANCHES,
  CalculationOptions 
} from "./types";
import { MONTH_START_TERMS, SOLAR_TERM_DATES } from "@/constants/solarTerms";
import { calculatePreciseDaeunAge, convertAge } from "./utils/timeUtils";

export class DaeunCalculator {
  /**
   * 대운 계산 (고정밀 버전)
   * @param sajuPalja 사주팔자
   * @param gender 성별 (M: 남, F: 여)
   * @param birthYear 생년
   * @param birthMonth 생월
   * @param birthDay 생일
   * @param birthHour 생시 (24시간 형식)
   * @param birthMinute 생분
   * @param options 계산 옵션
   */
  async calculateDaeun(
    sajuPalja: SajuPalja,
    gender: "M" | "F",
    birthYear: number,
    birthMonth: number,
    birthDay: number,
    birthHour: number = 12,
    birthMinute: number = 0,
    options: CalculationOptions = {}
  ): Promise<Daeun[]> {
    // 년간의 음양 판별
    const yearStem = sajuPalja
      .year_pillar[0] as (typeof HEAVENLY_STEMS)[number];
    const yearStemIndex = HEAVENLY_STEMS.indexOf(yearStem);
    const isYangYear = yearStemIndex % 2 === 0; // 짝수 인덱스가 양간

    // 순행/역행 결정
    // 양년생 남자, 음년생 여자: 순행
    // 음년생 남자, 양년생 여자: 역행
    const isForward =
      (isYangYear && gender === "M") || (!isYangYear && gender === "F");

    // 대운수 계산 (고정밀 천문 계산)
    const daeunStartAge = await this.calculateDaeunStartAge(
      birthYear,
      birthMonth,
      birthDay,
      birthHour,
      birthMinute,
      isForward,
      options
    );

    // 월주 기준으로 대운 생성
    const monthPillar = sajuPalja.month_pillar;
    const monthStemIndex = HEAVENLY_STEMS.indexOf(
      monthPillar[0] as (typeof HEAVENLY_STEMS)[number]
    );
    const monthBranchIndex = EARTHLY_BRANCHES.indexOf(
      monthPillar[1] as (typeof EARTHLY_BRANCHES)[number]
    );

    const daeunList: Daeun[] = [];

    // 10개의 대운 생성 (100세까지)
    for (let i = 0; i < 10; i++) {
      const age = daeunStartAge + i * 10;

      let stemIndex: number;
      let branchIndex: number;

      if (isForward) {
        // 순행
        stemIndex = (monthStemIndex + i + 1) % 10;
        branchIndex = (monthBranchIndex + i + 1) % 12;
      } else {
        // 역행
        stemIndex = (monthStemIndex - i - 1 + 10) % 10;
        branchIndex = (monthBranchIndex - i - 1 + 12) % 12;
      }

      const ganji = HEAVENLY_STEMS[stemIndex] + EARTHLY_BRANCHES[branchIndex];

      daeunList.push({
        age,
        ganji,
        startYear: birthYear + age,
        endYear: birthYear + age + 9,
      });
    }

    return daeunList;
  }

  /**
   * 대운 시작 나이 계산 (고정밀 천문 계산)
   */
  private async calculateDaeunStartAge(
    birthYear: number,
    birthMonth: number,
    birthDay: number,
    birthHour: number,
    birthMinute: number,
    isForward: boolean,
    options: CalculationOptions
  ): Promise<number> {
    // 생일 날짜 객체 (정확한 시간 포함)
    // 이미 calculateSajuAnalysis에서 보정된 값을 받음
    const birthDate = new Date(
      birthYear,
      birthMonth - 1,
      birthDay,
      birthHour,
      birthMinute
    );

    // 모든 절기 날짜를 수집
    const allTermDates: { name: string; date: Date }[] = [];

    // 2004년 이후면 API 사용, 이전이면 근사값 사용
    if (birthYear > 2004) {
      // API를 통한 절기 정보 조회
      const { SolarTermsAPIService, convertSolarTermToDate } = await import(
        "./solarTermsAPI"
      );
      const solarTermsAPI = new SolarTermsAPIService();

      // 연도별 절기 데이터 가져오기
      const currentYearData = await solarTermsAPI.getYearlySolarTerms(
        birthYear
      );
      const prevYearData = await solarTermsAPI.getYearlySolarTerms(
        birthYear - 1
      );
      const nextYearData = await solarTermsAPI.getYearlySolarTerms(
        birthYear + 1
      );

      // 전년도 12월 절(節) - 대설, 소한만 포함 (대운 계산에 사용)
      prevYearData
        .filter(
          (term) => ["대설", "소한"].includes(term.dateName) // 절만
        )
        .forEach((term) => {
          allTermDates.push({
            name: term.dateName,
            date: convertSolarTermToDate(term),
          });
        });

      // 현재년도 절(節)만 포함 - 월의 시작 절기만 사용
      currentYearData
        .filter((term) =>
          MONTH_START_TERMS.includes(
            term.dateName as (typeof MONTH_START_TERMS)[number]
          )
        )
        .forEach((term) => {
          allTermDates.push({
            name: term.dateName,
            date: convertSolarTermToDate(term),
          });
        });

      // 다음년도 1-2월 절(節) - 소한, 입춘, 경칩만 포함
      nextYearData
        .filter(
          (term) => ["소한", "입춘", "경칩"].includes(term.dateName) // 절만
        )
        .forEach((term) => {
          allTermDates.push({
            name: term.dateName,
            date: convertSolarTermToDate(term),
          });
        });
    } else {
      // 2004년 이전: 근사값 사용
      // 전년도 12월 절(節) - 대설만 포함
      const prevYear = birthYear - 1;
      allTermDates.push({ name: "대설", date: new Date(prevYear, 11, 7) });

      // 현재년도 절(節)만 포함 - 각 월의 첫 번째 절기만
      for (let month = 1; month <= 12; month++) {
        const monthTerms = SOLAR_TERM_DATES[month];
        if (monthTerms && monthTerms.length > 0) {
          // 각 월의 첫 번째 절기만 (절)
          const firstTerm = monthTerms[0];
          if (
            MONTH_START_TERMS.includes(
              firstTerm.term as (typeof MONTH_START_TERMS)[number]
            )
          ) {
            allTermDates.push({
              name: firstTerm.term,
              date: new Date(birthYear, month - 1, firstTerm.day),
            });
          }
        }
      }

      // 다음년도 1-3월 절(節) - 소한, 입춘, 경칩만 포함
      const nextYear = birthYear + 1;
      allTermDates.push(
        { name: "소한", date: new Date(nextYear, 0, 5) },
        { name: "입춘", date: new Date(nextYear, 1, 4) },
        { name: "경칩", date: new Date(nextYear, 2, 6) }
      );
    }

    // 날짜순으로 정렬
    allTermDates.sort((a, b) => a.date.getTime() - b.date.getTime());

    let daysFromTerm: number = 0;
    let foundTerm = false;

    if (isForward) {
      // 순행: 생일 이후 가장 가까운 절기까지의 날짜
      for (const term of allTermDates) {
        if (term.date > birthDate) {
          daysFromTerm = Math.floor(
            (term.date.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          foundTerm = true;
          break;
        }
      }
    } else {
      // 역행: 생일 이전 가장 가까운 절기로부터의 날짜
      for (let i = allTermDates.length - 1; i >= 0; i--) {
        if (allTermDates[i].date <= birthDate) {
          daysFromTerm = Math.floor(
            (birthDate.getTime() - allTermDates[i].date.getTime()) /
              (1000 * 60 * 60 * 24)
          );
          foundTerm = true;
          break;
        }
      }
    }

    // 절기를 찾지 못한 경우 기본값 사용
    if (!foundTerm) {
      daysFromTerm = 15; // 기본값: 15일 (약 5세)
    }

    // 정밀도에 따른 날짜/시간 차이 계산
    let timeDiff: number = 0;

    if (options.precision === "minute" || options.precision === "hour") {
      // 시간 단위 정밀 계산
      if (isForward) {
        const nextTerm = allTermDates.find((t) => t.date > birthDate);
        if (nextTerm) {
          timeDiff = nextTerm.date.getTime() - birthDate.getTime();
        }
      } else {
        const prevTerm = [...allTermDates]
          .reverse()
          .find((t) => t.date <= birthDate);
        if (prevTerm) {
          timeDiff = birthDate.getTime() - prevTerm.date.getTime();
        }
      }

      // 시간을 일수로 변환 (소수점 포함)
      daysFromTerm = timeDiff / (1000 * 60 * 60 * 24);
    }

    // 계산 방식에 따른 대운수 계산
    const daeunStartAge = calculatePreciseDaeunAge(
      daysFromTerm,
      options.calculationMethod || "traditional"
    );

    // 나이 체계 변환
    const finalAge = convertAge(daeunStartAge, options.ageSystem || "korean");

    console.log(finalAge);
    // 최소 1세, 최대 10세로 제한
    return Math.max(1, Math.min(10, finalAge));
  }

  /**
   * 현재 대운 찾기
   */
  getCurrentDaeun(daeunList: Daeun[], currentAge: number): Daeun | null {
    for (const daeun of daeunList) {
      if (currentAge >= daeun.age && currentAge < daeun.age + 10) {
        return daeun;
      }
    }
    return null;
  }
}
