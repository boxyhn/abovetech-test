// 만세력 계산 서비스
import KoreanLunarCalendar from "korean-lunar-calendar";
import {
  SajuPalja,
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES,
  HeavenlyStem,
} from "./types";
import { SolarTermsAPIService } from "./solarTermsAPI";
import { 
  adjustTimeComponents,
  mod 
} from "./utils/timeUtils";

export class LunarCalendarService {
  private calendar: KoreanLunarCalendar;

  constructor() {
    this.calendar = new KoreanLunarCalendar();
  }


  /**
   * 양력을 음력으로 변환
   */
  solarToLunar(
    year: number,
    month: number,
    day: number
  ): {
    year: number;
    month: number;
    day: number;
    isLeapMonth: boolean;
  } {
    this.calendar.setSolarDate(year, month, day);
    const lunar = this.calendar.getLunarCalendar();
    return {
      year: lunar.year,
      month: lunar.month,
      day: lunar.day,
      isLeapMonth: lunar.intercalation || false,
    };
  }

  /**
   * 음력을 양력으로 변환
   */
  lunarToSolar(
    year: number,
    month: number,
    day: number,
    isLeapMonth: boolean = false
  ): {
    year: number;
    month: number;
    day: number;
  } {
    this.calendar.setLunarDate(year, month, day, isLeapMonth);
    const solar = this.calendar.getSolarCalendar();
    return {
      year: solar.year,
      month: solar.month,
      day: solar.day,
    };
  }

  /**
   * 사주팔자 계산
   */
  async calculateSajuPalja(
    year: number,
    month: number,
    day: number,
    hour: number,
    minute: number,
    isLunar: boolean = false
  ): Promise<SajuPalja> {
    // 음력인 경우 양력으로 변환
    let solarDate = { year, month, day };
    if (isLunar) {
      solarDate = this.lunarToSolar(year, month, day);
    }

    // 서머타임 및 진태양시 보정 (서울 기준)
    const adjustedTime = adjustTimeComponents(
      solarDate.year,
      solarDate.month,
      solarDate.day,
      hour,
      minute
    );

    // 보정된 시간으로 계산
    const adjustedYear = adjustedTime.year;
    const adjustedMonth = adjustedTime.month;
    const adjustedDay = adjustedTime.day;
    const adjustedHour = adjustedTime.hour;
    const adjustedMinute = adjustedTime.minute;

    // 년주 계산 (입춘 시각 고려)
    const yearPillar = await this.calculateYearPillar(
      adjustedYear,
      adjustedMonth,
      adjustedDay,
      adjustedHour,
      adjustedMinute
    );

    // 월주 계산 (절기 기준, 시간 고려)
    const monthPillar = await this.calculateMonthPillar(
      adjustedYear,
      adjustedMonth,
      adjustedDay,
      yearPillar,
      adjustedHour,
      adjustedMinute
    );

    // 일주 계산
    const dayPillar = this.calculateDayPillar(
      adjustedYear,
      adjustedMonth,
      adjustedDay
    );

    // 시주 계산
    const hourPillar = this.calculateHourPillar(adjustedHour, dayPillar);

    return {
      year_pillar: yearPillar,
      month_pillar: monthPillar,
      day_pillar: dayPillar,
      hour_pillar: hourPillar,
    };
  }

  /**
   * 년주 계산 (입춘 시각 고려)
   */
  private async calculateYearPillar(
    year: number,
    month: number,
    day: number,
    hour: number = 12,
    minute: number = 0
  ): Promise<string> {
    // 2004년 이후면 입춘 시각 확인
    if (year > 2004) {
      const solarTermsAPI = new SolarTermsAPIService();
      const currentDate = new Date(year, month - 1, day, hour, minute);

      // 해당 연도 입춘 찾기
      const yearTerms = await solarTermsAPI.getYearlySolarTerms(year);
      const ipchun = yearTerms.find((t) => t.dateName === "입춘");

      if (ipchun) {
        const { convertSolarTermToDate } = await import('./solarTermsAPI');
        const ipchunDate = convertSolarTermToDate(ipchun);

        // 입춘 이전이면 전년도 사용
        if (currentDate < ipchunDate) {
          year = year - 1;
        }
      }
    } else if (month === 1 || (month === 2 && day < 4)) {
      // 2004년 이전: 대략적인 입춘 날짜(2월 4일)로 판단
      year = year - 1;
    }

    // 간지 계산 (1984년 甲子년 기준)
    const baseYear = 1984;
    const diff = year - baseYear;

    const stemIndex = mod(diff, 10);
    const branchIndex = mod(diff, 12);

    return HEAVENLY_STEMS[stemIndex] + EARTHLY_BRANCHES[branchIndex];
  }

  /**
   * 월주 계산 (절기 기준 - 천문연구원 API 사용)
   */
  private async calculateMonthPillar(
    year: number,
    month: number,
    day: number,
    yearPillar: string,
    hour: number = 12,
    minute: number = 0
  ): Promise<string> {
    // 천문연구원 API로 절기 정보 조회 (시간 포함)
    const solarTermsAPI = new SolarTermsAPIService();
    const currentDate = new Date(year, month - 1, day, hour, minute);
    const termInfo = await solarTermsAPI.getCurrentSolarTerm(
      currentDate,
      hour,
      minute
    );

    // 월지 결정
    let monthBranch: string;
    let adjustedMonth: number;

    if (termInfo) {
      // API 성공시 절기 기반 월지 사용
      monthBranch = termInfo.branch;
      // 월지로부터 월 숫자 역산
      const branchIndex = EARTHLY_BRANCHES.indexOf(
        monthBranch as (typeof EARTHLY_BRANCHES)[number]
      );
      adjustedMonth =
        branchIndex === 0 ? 11 : branchIndex === 1 ? 12 : branchIndex - 1;
    } else {
      // API 실패시 기본 계산 사용
      monthBranch =
        SolarTermsAPIService.calculateMonthBranchFallback(currentDate);
      const branchIndex = EARTHLY_BRANCHES.indexOf(
        monthBranch as (typeof EARTHLY_BRANCHES)[number]
      );
      adjustedMonth =
        branchIndex === 0 ? 11 : branchIndex === 1 ? 12 : branchIndex - 1;
    }

    // 년간에 따른 월간 계산
    const yearStem = yearPillar[0] as HeavenlyStem;
    const yearStemIndex = HEAVENLY_STEMS.indexOf(yearStem);
    const monthStemIndex = this.calculateMonthStem(
      yearStemIndex,
      adjustedMonth
    );

    // 월간 + 월지
    return HEAVENLY_STEMS[monthStemIndex] + monthBranch;
  }

  /**
   * 월간 계산 (년간 기준)
   */
  private calculateMonthStem(yearStemIndex: number, month: number): number {
    // 갑기년: 병인월부터, 을경년: 무인월부터, 병신년: 경인월부터
    // 정임년: 임인월부터, 무계년: 갑인월부터
    const monthStemBase = [2, 4, 6, 8, 0]; // 병, 무, 경, 임, 갑
    const baseIndex = monthStemBase[yearStemIndex % 5];

    return mod(baseIndex + month - 1, 10);
  }

  /**
   * 일주 계산 (여러 기준일로 검증)
   */
  private calculateDayPillar(year: number, month: number, day: number): string {
    // 검증된 기준일들 (실제 만세력 확인된 날짜)
    const referenceDates = [
      { date: new Date(1920, 0, 1), pillar: "戊午" }, // 1920년 1월 1일
      { date: new Date(1950, 0, 1), pillar: "丙申" }, // 1950년 1월 1일
      { date: new Date(1955, 0, 1), pillar: "壬戊" }, // 1955년 1월 1일
      { date: new Date(1975, 0, 1), pillar: "丁未" }, // 1975년 1월 1일
      { date: new Date(2000, 0, 1), pillar: "戊午" }, // 2000년 1월 1일
      { date: new Date(2020, 0, 1), pillar: "癸卯" }, // 2020년 1월 1일
    ];

    // 타겟 날짜
    const targetDate = new Date(year, month - 1, day);

    // 가장 가까운 기준일 찾기
    let closestRef = referenceDates[0];
    let minDiff = Math.abs(targetDate.getTime() - closestRef.date.getTime());

    for (const ref of referenceDates) {
      const diff = Math.abs(targetDate.getTime() - ref.date.getTime());
      if (diff < minDiff) {
        minDiff = diff;
        closestRef = ref;
      }
    }

    // 기준일로부터의 일수 차이 계산
    const dayDiff = Math.floor(
      (targetDate.getTime() - closestRef.date.getTime()) / (1000 * 60 * 60 * 24)
    );

    // 기준일의 천간지지 인덱스 찾기
    const refStem = closestRef.pillar[0];
    const refBranch = closestRef.pillar[1];
    const refStemIndex = HEAVENLY_STEMS.indexOf(refStem as HeavenlyStem);
    const refBranchIndex = EARTHLY_BRANCHES.indexOf(
      refBranch as (typeof EARTHLY_BRANCHES)[number]
    );

    // 목표일의 천간지지 계산
    const stemIndex = mod(refStemIndex + dayDiff, 10);
    const branchIndex = mod(refBranchIndex + dayDiff, 12);

    return HEAVENLY_STEMS[stemIndex] + EARTHLY_BRANCHES[branchIndex];
  }

  /**
   * 시주 계산
   */
  private calculateHourPillar(hour: number, dayPillar: string): string {
    // 시간을 지지로 변환 (23-01시: 자시, 01-03시: 축시...)
    const hourBranchIndex = Math.floor((hour + 1) / 2) % 12;

    // 일간에 따른 시간 계산
    const dayStem = dayPillar[0] as HeavenlyStem;
    const dayStemIndex = HEAVENLY_STEMS.indexOf(dayStem);
    const hourStemIndex = this.calculateHourStem(dayStemIndex, hourBranchIndex);

    return HEAVENLY_STEMS[hourStemIndex] + EARTHLY_BRANCHES[hourBranchIndex];
  }

  /**
   * 시간 계산 (일간 기준)
   */
  private calculateHourStem(
    dayStemIndex: number,
    hourBranchIndex: number
  ): number {
    // 갑기일: 갑자시부터, 을경일: 병자시부터, 병신일: 무자시부터
    // 정임일: 경자시부터, 무계일: 임자시부터
    const hourStemBase = [0, 2, 4, 6, 8]; // 갑, 병, 무, 경, 임
    const baseIndex = hourStemBase[dayStemIndex % 5];

    return mod(baseIndex + hourBranchIndex, 10);
  }

  /**
   * 현재 세운 계산
   */
  async calculateCurrentSeun(): Promise<{ year: number; ganji: string }> {
    const now = new Date();
    const yearPillar = await this.calculateYearPillar(
      now.getFullYear(),
      now.getMonth() + 1,
      now.getDate(),
      now.getHours(),
      now.getMinutes()
    );

    return {
      year: now.getFullYear(),
      ganji: yearPillar,
    };
  }
}
