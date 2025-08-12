// 오행 분석 서비스
import { 
  OhaengDistribution, 
  SajuPalja,
  FiveElements
} from './types';

export class OhaengAnalyzer {
  // 천간의 오행 매핑
  private readonly STEM_ELEMENTS: Record<string, FiveElements> = {
    '甲': FiveElements.WOOD,  // 갑목
    '乙': FiveElements.WOOD,  // 을목
    '丙': FiveElements.FIRE,  // 병화
    '丁': FiveElements.FIRE,  // 정화
    '戊': FiveElements.EARTH, // 무토
    '己': FiveElements.EARTH, // 기토
    '庚': FiveElements.METAL, // 경금
    '辛': FiveElements.METAL, // 신금
    '壬': FiveElements.WATER, // 임수
    '癸': FiveElements.WATER  // 계수
  };

  // 지지의 오행 매핑 (본기)
  private readonly BRANCH_ELEMENTS: Record<string, FiveElements> = {
    '子': FiveElements.WATER, // 자수
    '丑': FiveElements.EARTH, // 축토
    '寅': FiveElements.WOOD,  // 인목
    '卯': FiveElements.WOOD,  // 묘목
    '辰': FiveElements.EARTH, // 진토
    '巳': FiveElements.FIRE,  // 사화
    '午': FiveElements.FIRE,  // 오화
    '未': FiveElements.EARTH, // 미토
    '申': FiveElements.METAL, // 신금
    '酉': FiveElements.METAL, // 유금
    '戌': FiveElements.EARTH, // 술토
    '亥': FiveElements.WATER  // 해수
  };

  // 지장간 (地藏干) - 지지에 포함된 천간들
  private readonly BRANCH_HIDDEN_STEMS: Record<string, string[]> = {
    '子': ['癸'],           // 자: 계수
    '丑': ['己', '癸', '辛'], // 축: 기토, 계수, 신금
    '寅': ['甲', '丙', '戊'], // 인: 갑목, 병화, 무토
    '卯': ['乙'],           // 묘: 을목
    '辰': ['戊', '乙', '癸'], // 진: 무토, 을목, 계수
    '巳': ['丙', '戊', '庚'], // 사: 병화, 무토, 경금
    '午': ['丁', '己'],      // 오: 정화, 기토
    '未': ['己', '丁', '乙'], // 미: 기토, 정화, 을목
    '申': ['庚', '壬', '戊'], // 신: 경금, 임수, 무토
    '酉': ['辛'],           // 유: 신금
    '戌': ['戊', '辛', '丁'], // 술: 무토, 신금, 정화
    '亥': ['壬', '甲']       // 해: 임수, 갑목
  };

  /**
   * 오행 분포 계산
   * @param sajuPalja 사주팔자
   * @param includeHiddenStems 지장간 포함 여부
   */
  calculateOhaengDistribution(
    sajuPalja: SajuPalja,
    includeHiddenStems: boolean = true
  ): OhaengDistribution {
    const distribution: OhaengDistribution = {
      wood: 0,
      fire: 0,
      earth: 0,
      metal: 0,
      water: 0
    };

    // 사주팔자를 배열로 변환
    const pillars = [
      sajuPalja.year_pillar,
      sajuPalja.month_pillar,
      sajuPalja.day_pillar,
      sajuPalja.hour_pillar
    ];

    // 각 기둥별로 오행 계산
    for (const pillar of pillars) {
      const stem = pillar[0];  // 천간
      const branch = pillar[1]; // 지지

      // 천간의 오행 추가
      this.addElement(distribution, this.STEM_ELEMENTS[stem]);

      // 지지의 본기 오행 추가
      this.addElement(distribution, this.BRANCH_ELEMENTS[branch]);

      // 지장간 포함 시
      if (includeHiddenStems) {
        const hiddenStems = this.BRANCH_HIDDEN_STEMS[branch] || [];
        for (const hiddenStem of hiddenStems) {
          // 지장간은 0.5의 가중치 적용
          this.addElement(distribution, this.STEM_ELEMENTS[hiddenStem], 0.5);
        }
      }
    }

    return distribution;
  }

  /**
   * 오행 요소 추가
   */
  private addElement(
    distribution: OhaengDistribution,
    element: FiveElements,
    weight: number = 1
  ): void {
    switch (element) {
      case FiveElements.WOOD:
        distribution.wood += weight;
        break;
      case FiveElements.FIRE:
        distribution.fire += weight;
        break;
      case FiveElements.EARTH:
        distribution.earth += weight;
        break;
      case FiveElements.METAL:
        distribution.metal += weight;
        break;
      case FiveElements.WATER:
        distribution.water += weight;
        break;
    }
  }

  /**
   * 오행 균형 분석
   */
  analyzeBalance(distribution: OhaengDistribution): {
    strongest: string;
    weakest: string;
    isBalanced: boolean;
    missingElements: string[];
  } {
    const elements = [
      { name: 'wood', value: distribution.wood },
      { name: 'fire', value: distribution.fire },
      { name: 'earth', value: distribution.earth },
      { name: 'metal', value: distribution.metal },
      { name: 'water', value: distribution.water }
    ];

    // 가장 강한/약한 오행 찾기
    elements.sort((a, b) => b.value - a.value);
    const strongest = elements[0].name;
    const weakest = elements[4].name;

    // 없는 오행 찾기
    const missingElements = elements
      .filter(e => e.value === 0)
      .map(e => e.name);

    // 균형 여부 판단 (모든 오행이 1 이상이고, 차이가 3 이하)
    const maxDiff = elements[0].value - elements[4].value;
    const isBalanced = missingElements.length === 0 && maxDiff <= 3;

    return {
      strongest,
      weakest,
      isBalanced,
      missingElements
    };
  }

  /**
   * 일간의 오행 반환
   */
  getIlganElement(ilgan: string): FiveElements {
    return this.STEM_ELEMENTS[ilgan];
  }
}