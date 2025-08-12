/**
 * 시간 관련 유틸리티 함수들
 */

// 한국 서머타임 적용 기간 (1948-1988년 일부 기간)
export const KOREA_SUMMER_TIME_RANGES = [
  { start: new Date(1948, 4, 1), end: new Date(1948, 8, 12) },
  { start: new Date(1949, 3, 3), end: new Date(1949, 8, 10) },
  { start: new Date(1950, 3, 1), end: new Date(1950, 8, 9) },
  { start: new Date(1951, 4, 6), end: new Date(1951, 8, 8) },
  // 1960-1961년
  { start: new Date(1960, 4, 1), end: new Date(1960, 8, 12) },
  { start: new Date(1961, 4, 10), end: new Date(1961, 8, 30) },
  // 1987-1988년
  { start: new Date(1987, 4, 10), end: new Date(1987, 9, 11) },
  { start: new Date(1988, 4, 8), end: new Date(1988, 9, 9) },
];

// 한국 표준시 기준 경도
export const KOREA_STANDARD_MERIDIAN = 135; // GMT+9

// 서울 경도
export const SEOUL_LONGITUDE = 126.9778;

/**
 * 음수에도 대응하는 모듈로 연산
 * @param n 나눠지는 수
 * @param m 나누는 수
 * @returns 올바른 모듈로 값
 */
export function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

/**
 * 연중 일수 계산
 * @param date 날짜
 * @returns 1월 1일부터의 일수
 */
export function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * 서머타임 적용 여부 확인
 * @param date 확인할 날짜
 * @returns 서머타임 적용 여부
 */
export function isInSummerTime(date: Date): boolean {
  for (const range of KOREA_SUMMER_TIME_RANGES) {
    if (date >= range.start && date <= range.end) {
      return true;
    }
  }
  return false;
}

/**
 * 균시차(Equation of Time) 계산
 * @param date 날짜
 * @returns 균시차 (분 단위)
 */
export function calculateEquationOfTime(date: Date): number {
  const dayOfYear = getDayOfYear(date);
  const B = 2 * Math.PI * (dayOfYear - 81) / 365;
  const E = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
  return E;
}

/**
 * 통합된 시간 보정 함수 (서머타임 + 진태양시)
 * @param date 원본 날짜
 * @param longitude 경도 (기본값: 서울)
 * @param options 추가 옵션
 * @returns 보정된 날짜
 */
export function adjustTimeForLocation(
  date: Date,
  longitude: number = SEOUL_LONGITUDE,
  options: {
    applySummerTime?: boolean;
    useEquationOfTime?: boolean;
  } = {}
): Date {
  const { applySummerTime = true, useEquationOfTime = true } = options;
  
  const adjustedDate = new Date(date);
  
  // 1. 서머타임 보정
  if (applySummerTime && isInSummerTime(date)) {
    // 서머타임 기간이면 1시간 빼기 (실제 태양시로 복원)
    adjustedDate.setHours(adjustedDate.getHours() - 1);
  }
  
  // 2. 진태양시 보정
  // 표준 경도와의 차이에 따른 시간 보정
  const longitudeDiff = longitude - KOREA_STANDARD_MERIDIAN;
  const minuteCorrection = longitudeDiff * 4; // 경도 1도당 4분 차이
  
  let totalCorrection = minuteCorrection;
  
  // 3. 균시차 적용
  if (useEquationOfTime) {
    totalCorrection += calculateEquationOfTime(adjustedDate);
  }
  
  // 보정 적용
  adjustedDate.setMinutes(adjustedDate.getMinutes() + Math.round(totalCorrection));
  
  return adjustedDate;
}

/**
 * 날짜 컴포넌트 형식으로 시간 보정
 * @param year 년
 * @param month 월 (1-12)
 * @param day 일
 * @param hour 시 (0-23)
 * @param minute 분
 * @param longitude 경도
 * @param options 추가 옵션
 * @returns 보정된 날짜 컴포넌트
 */
export function adjustTimeComponents(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  longitude: number = SEOUL_LONGITUDE,
  options: {
    applySummerTime?: boolean;
    useEquationOfTime?: boolean;
  } = {}
): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
} {
  const date = new Date(year, month - 1, day, hour, minute);
  const adjustedDate = adjustTimeForLocation(date, longitude, options);
  
  return {
    year: adjustedDate.getFullYear(),
    month: adjustedDate.getMonth() + 1,
    day: adjustedDate.getDate(),
    hour: adjustedDate.getHours(),
    minute: adjustedDate.getMinutes(),
  };
}

/**
 * 정밀한 대운수 계산
 * @param days 절기로부터의 일수
 * @param method 계산 방식
 * @returns 대운수 (나이)
 */
export function calculatePreciseDaeunAge(
  days: number,
  method: 'traditional' | 'precise' | 'modern' = 'traditional'
): number {
  switch (method) {
    case 'precise':
      // 정밀 계산: 120일 = 1대운(10년), 12일 = 1년
      return Math.round(days / 12);
      
    case 'modern':
      // 현대식: 365.25일/100 = 3.6525일 = 1년
      return Math.round(days / 3.6525);
      
    case 'traditional':
    default:
      // 전통 방식: 3일 = 1세
      const quotient = Math.floor(days / 3);
      const remainder = days % 3;
      
      // 정밀한 반올림
      if (remainder === 0) {
        return quotient;
      } else if (remainder < 1.5) {
        return quotient;  // 버림
      } else {
        return quotient + 1;  // 올림
      }
  }
}

/**
 * 나이 체계 변환
 * @param age 나이
 * @param ageSystem 나이 체계
 * @returns 변환된 나이
 */
export function convertAge(
  age: number,
  ageSystem: 'korean' | 'western' = 'korean'
): number {
  if (ageSystem === 'western') {
    // 만 나이로 변환
    return Math.max(0, age - 1);
  }
  
  return age;  // 기본: 한국 나이
}