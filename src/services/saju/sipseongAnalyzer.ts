// 십성 분석 서비스
import { 
  SipseongMap,
  SajuPalja,
  TenGods,
  FiveElements
} from './types';

export class SipseongAnalyzer {
  // 천간의 오행 매핑
  private readonly STEM_ELEMENTS: Record<string, FiveElements> = {
    '甲': FiveElements.WOOD,  '乙': FiveElements.WOOD,
    '丙': FiveElements.FIRE,  '丁': FiveElements.FIRE,
    '戊': FiveElements.EARTH, '己': FiveElements.EARTH,
    '庚': FiveElements.METAL, '辛': FiveElements.METAL,
    '壬': FiveElements.WATER, '癸': FiveElements.WATER
  };

  // 지지의 주요 천간 (지장간 중 가장 강한 것)
  private readonly BRANCH_MAIN_STEM: Record<string, string> = {
    '子': '癸', '丑': '己', '寅': '甲', '卯': '乙',
    '辰': '戊', '巳': '丙', '午': '丁', '未': '己',
    '申': '庚', '酉': '辛', '戌': '戊', '亥': '壬'
  };

  // 천간의 음양
  private readonly STEM_YINYANG: Record<string, 'yang' | 'yin'> = {
    '甲': 'yang', '乙': 'yin',  '丙': 'yang', '丁': 'yin',
    '戊': 'yang', '己': 'yin',  '庚': 'yang', '辛': 'yin',
    '壬': 'yang', '癸': 'yin'
  };

  /**
   * 십성 매핑 계산
   * @param sajuPalja 사주팔자
   * @param ilgan 일간
   */
  calculateSipseongMap(sajuPalja: SajuPalja, ilgan: string): SipseongMap {
    return {
      year_gan: this.calculateSipseong(ilgan, sajuPalja.year_pillar[0]),
      year_ji: this.calculateSipseongFromBranch(ilgan, sajuPalja.year_pillar[1]),
      month_gan: this.calculateSipseong(ilgan, sajuPalja.month_pillar[0]),
      month_ji: this.calculateSipseongFromBranch(ilgan, sajuPalja.month_pillar[1]),
      day_ji: this.calculateSipseongFromBranch(ilgan, sajuPalja.day_pillar[1]),
      hour_gan: this.calculateSipseong(ilgan, sajuPalja.hour_pillar[0]),
      hour_ji: this.calculateSipseongFromBranch(ilgan, sajuPalja.hour_pillar[1])
    };
  }

  /**
   * 천간 간의 십성 관계 계산
   */
  private calculateSipseong(ilgan: string, target: string): string {
    const ilganElement = this.STEM_ELEMENTS[ilgan];
    const targetElement = this.STEM_ELEMENTS[target];
    const ilganYinyang = this.STEM_YINYANG[ilgan];
    const targetYinyang = this.STEM_YINYANG[target];
    const isSameYinyang = ilganYinyang === targetYinyang;

    // 오행 생극 관계에 따른 십성 판별
    const relationship = this.getElementRelationship(ilganElement, targetElement);

    switch (relationship) {
      case 'same': // 같은 오행
        return isSameYinyang ? TenGods.BI_GYEON : TenGods.GYEOB_JAE;
      
      case 'generate': // 일간이 생하는 오행 (아끼는 관계)
        return isSameYinyang ? TenGods.SIG_SIN : TenGods.SANG_GWAN;
      
      case 'control': // 일간이 극하는 오행 (재물)
        return isSameYinyang ? TenGods.PYEON_JAE : TenGods.JEONG_JAE;
      
      case 'controlled': // 일간을 극하는 오행 (관성)
        return isSameYinyang ? TenGods.PYEON_GWAN : TenGods.JEONG_GWAN;
      
      case 'generated': // 일간을 생하는 오행 (인성)
        return isSameYinyang ? TenGods.PYEON_IN : TenGods.JEONG_IN;
      
      default:
        return TenGods.BI_GYEON;
    }
  }

  /**
   * 지지의 십성 계산 (지장간 주요 천간 기준)
   */
  private calculateSipseongFromBranch(ilgan: string, branch: string): string {
    const mainStem = this.BRANCH_MAIN_STEM[branch];
    return this.calculateSipseong(ilgan, mainStem);
  }

  /**
   * 오행 간의 관계 판별
   */
  private getElementRelationship(
    source: FiveElements,
    target: FiveElements
  ): 'same' | 'generate' | 'control' | 'controlled' | 'generated' {
    if (source === target) return 'same';

    // 오행 상생 관계
    const generationMap: Record<FiveElements, FiveElements> = {
      [FiveElements.WOOD]: FiveElements.FIRE,   // 목생화
      [FiveElements.FIRE]: FiveElements.EARTH,  // 화생토
      [FiveElements.EARTH]: FiveElements.METAL, // 토생금
      [FiveElements.METAL]: FiveElements.WATER, // 금생수
      [FiveElements.WATER]: FiveElements.WOOD   // 수생목
    };

    // 오행 상극 관계
    const controlMap: Record<FiveElements, FiveElements> = {
      [FiveElements.WOOD]: FiveElements.EARTH,  // 목극토
      [FiveElements.EARTH]: FiveElements.WATER, // 토극수
      [FiveElements.WATER]: FiveElements.FIRE,  // 수극화
      [FiveElements.FIRE]: FiveElements.METAL,  // 화극금
      [FiveElements.METAL]: FiveElements.WOOD   // 금극목
    };

    if (generationMap[source] === target) return 'generate';
    if (controlMap[source] === target) return 'control';
    
    // 역관계 확인
    if (generationMap[target] === source) return 'generated';
    if (controlMap[target] === source) return 'controlled';

    return 'same'; // 기본값
  }

  /**
   * 십성 통계 분석
   */
  analyzeSipseongDistribution(sipseongMap: SipseongMap): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    // 모든 십성 초기화
    Object.values(TenGods).forEach(god => {
      distribution[god] = 0;
    });

    // 십성 카운트
    Object.values(sipseongMap).forEach(god => {
      if (distribution[god] !== undefined) {
        distribution[god]++;
      }
    });

    return distribution;
  }

  /**
   * 주요 십성 특징 분석
   */
  analyzeSipseongCharacteristics(distribution: Record<string, number>): {
    dominantGod: string;
    missingGods: string[];
    characteristics: string[];
  } {
    // 가장 많은 십성 찾기
    let dominantGod = '';
    let maxCount = 0;
    
    for (const [god, count] of Object.entries(distribution)) {
      if (count > maxCount) {
        maxCount = count;
        dominantGod = god;
      }
    }

    // 없는 십성 찾기
    const missingGods = Object.entries(distribution)
      .filter(([, count]) => count === 0)
      .map(([god]) => god);

    // 특징 분석
    const characteristics: string[] = [];
    
    if (distribution[TenGods.JEONG_JAE] + distribution[TenGods.PYEON_JAE] >= 3) {
      characteristics.push('재물운이 강함');
    }
    if (distribution[TenGods.JEONG_GWAN] + distribution[TenGods.PYEON_GWAN] >= 3) {
      characteristics.push('관운이 강함');
    }
    if (distribution[TenGods.JEONG_IN] + distribution[TenGods.PYEON_IN] >= 3) {
      characteristics.push('학업운이 강함');
    }
    if (distribution[TenGods.SIG_SIN] + distribution[TenGods.SANG_GWAN] >= 3) {
      characteristics.push('예술성이 강함');
    }
    if (distribution[TenGods.BI_GYEON] + distribution[TenGods.GYEOB_JAE] >= 3) {
      characteristics.push('독립성이 강함');
    }

    return {
      dominantGod,
      missingGods,
      characteristics
    };
  }
}