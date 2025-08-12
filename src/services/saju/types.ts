// 사주 분석 관련 타입 정의

// 입력 데이터 타입
export interface SajuInputObject {
  name: string;
  gender: "M" | "F";
  birth_date: string; // YYYY-MM-DD
  birth_time: string; // HH:MM
  is_lunar: boolean;
  longitude?: number; // 경도 (진태양시 계산용)
  latitude?: number; // 위도
}

// 계산 옵션 타입
export interface CalculationOptions {
  // 시간 정보
  birthHour?: number;
  birthMinute?: number;
  
  // 위치 정보
  longitude?: number;  // 경도 (기본: 서울 126.9778)
  latitude?: number;   // 위도 (기본: 서울 37.5665)
  
  // 계산 방식
  calculationMethod?: 'traditional' | 'modern' | 'precise';
  termType?: 'solar' | 'middle' | 'both';  // 절기/중기/둘다
  ageSystem?: 'korean' | 'western';  // 세는나이/만나이
  
  // 정밀도
  precision?: 'day' | 'hour' | 'minute';  // 계산 정밀도
  useEquationOfTime?: boolean;  // 균시차 사용 여부
}

// 사주팔자 타입
export interface SajuPalja {
  year_pillar: string; // 년주 (예: 乙亥)
  month_pillar: string; // 월주 (예: 甲申)
  day_pillar: string; // 일주 (예: 丙子)
  hour_pillar: string; // 시주 (예: 乙未)
}

// 대운 타입
export interface Daeun {
  age: number;
  ganji: string; // 간지 (예: 乙酉)
  startYear?: number;
  endYear?: number;
}

// 세운 타입
export interface Seun {
  year: number;
  ganji: string; // 간지 (예: 乙巳)
}

// 기본 정보 타입
export interface BasicInfo {
  saju_palja: SajuPalja;
  ilgan: string; // 일간 (예: 丙)
  daeun: Daeun[];
  seun: Seun;
}

// 오행 분포 타입
export interface OhaengDistribution {
  wood: number; // 목
  fire: number; // 화
  earth: number; // 토
  metal: number; // 금
  water: number; // 수
}

// 십성 매핑 타입
export interface SipseongMap {
  year_gan: string; // 년간 십성
  year_ji: string; // 년지 십성
  month_gan: string; // 월간 십성
  month_ji: string; // 월지 십성
  day_ji: string; // 일지 십성
  hour_gan: string; // 시간 십성
  hour_ji: string; // 시지 십성
}

// 12운성 매핑 타입
export interface Unseong12Map {
  year_pillar: string; // 년주 운성
  month_pillar: string; // 월주 운성
  day_pillar: string; // 일주 운성
  hour_pillar: string; // 시주 운성
}

// 간지 상호작용 타입
export interface Interactions {
  hap: string[]; // 합
  chung: string[]; // 충
  hyeong: string[]; // 형
  pa: string[]; // 파
  hae: string[]; // 해
}

// 1차 분석 타입
export interface PrimaryAnalysis {
  ohaeng_distribution: OhaengDistribution;
  sipseong_map: SipseongMap;
  unseong_12_map: Unseong12Map;
  shinsal: string[]; // 신살 목록
  interactions: Interactions;
}

// 최종 사주 분석 객체 타입
export interface SajuAnalysisObject {
  basic_info: BasicInfo;
  primary_analysis: PrimaryAnalysis;
}

// 천간 (天干) - Heavenly Stems
export const HEAVENLY_STEMS = [
  "甲",
  "乙",
  "丙",
  "丁",
  "戊",
  "己",
  "庚",
  "辛",
  "壬",
  "癸",
] as const;
export type HeavenlyStem = (typeof HEAVENLY_STEMS)[number];

// 지지 (地支) - Earthly Branches
export const EARTHLY_BRANCHES = [
  "子",
  "丑",
  "寅",
  "卯",
  "辰",
  "巳",
  "午",
  "未",
  "申",
  "酉",
  "戌",
  "亥",
] as const;
export type EarthlyBranch = (typeof EARTHLY_BRANCHES)[number];

// 오행 (五行) - Five Elements
export enum FiveElements {
  WOOD = "木",
  FIRE = "火",
  EARTH = "土",
  METAL = "金",
  WATER = "水",
}

// 십성 (十星) - Ten Gods
export enum TenGods {
  BI_GYEON = "비견", // 比肩
  GYEOB_JAE = "겁재", // 劫財
  SIG_SIN = "식신", // 食神
  SANG_GWAN = "상관", // 傷官
  PYEON_JAE = "편재", // 偏財
  JEONG_JAE = "정재", // 正財
  PYEON_GWAN = "편관", // 偏官
  JEONG_GWAN = "정관", // 正官
  PYEON_IN = "편인", // 偏印
  JEONG_IN = "정인", // 正印
}

// 12운성 (十二運星) - Twelve Life Stages
export enum TwelveLifeStages {
  JAE = "장생", // 長生
  MOG_YOG = "목욕", // 沐浴
  GWAN_DAE = "관대", // 冠帶
  GIN_ROK = "건록", // 建祿
  JE_WANG = "제왕", // 帝旺
  SOE = "쇠", // 衰
  BYEONG = "병", // 病
  SA = "사", // 死
  MYO = "묘", // 墓
  JEOL = "절", // 絶
  TAE = "태", // 胎
  YANG = "양", // 養
}
