// 간지 상호작용 분석 서비스
import { 
  Interactions,
  SajuPalja
} from './types';

export class InteractionAnalyzer {
  /**
   * 간지 상호작용 분석
   * @param sajuPalja 사주팔자
   */
  analyzeInteractions(sajuPalja: SajuPalja): Interactions {
    const interactions: Interactions = {
      hap: [],
      chung: [],
      hyeong: [],
      pa: [],
      hae: []
    };

    // 천간들과 지지들 추출
    const stems = [
      sajuPalja.year_pillar[0],
      sajuPalja.month_pillar[0],
      sajuPalja.day_pillar[0],
      sajuPalja.hour_pillar[0]
    ];

    const branches = [
      sajuPalja.year_pillar[1],
      sajuPalja.month_pillar[1],
      sajuPalja.day_pillar[1],
      sajuPalja.hour_pillar[1]
    ];

    // 천간 합 분석
    this.analyzeStemHap(stems, interactions);

    // 지지 합 분석
    this.analyzeBranchHap(branches, interactions);

    // 지지 충 분석
    this.analyzeBranchChung(branches, interactions);

    // 지지 형 분석
    this.analyzeBranchHyeong(branches, interactions);

    // 지지 파 분석
    this.analyzeBranchPa(branches, interactions);

    // 지지 해 분석
    this.analyzeBranchHae(branches, interactions);

    return interactions;
  }

  /**
   * 천간 합 분석
   */
  private analyzeStemHap(stems: string[], interactions: Interactions): void {
    // 천간 오합
    const stemHapPairs: Record<string, string> = {
      '甲': '己', '己': '甲',  // 갑기 합토
      '乙': '庚', '庚': '乙',  // 을경 합금
      '丙': '辛', '辛': '丙',  // 병신 합수
      '丁': '壬', '壬': '丁',  // 정임 합목
      '戊': '癸', '癸': '戊'   // 무계 합화
    };

    // 위치별 이름
    const positions = ['년', '월', '일', '시'];

    for (let i = 0; i < stems.length; i++) {
      for (let j = i + 1; j < stems.length; j++) {
        if (stemHapPairs[stems[i]] === stems[j]) {
          const hapName = this.getStemHapName(stems[i], stems[j]);
          interactions.hap.push(`${positions[i]}간-${positions[j]}간 (${hapName})`);
        }
      }
    }
  }

  /**
   * 천간 합의 이름
   */
  private getStemHapName(stem1: string, stem2: string): string {
    const hapNames: Record<string, string> = {
      '甲己': '갑기합토',
      '己甲': '갑기합토',
      '乙庚': '을경합금',
      '庚乙': '을경합금',
      '丙辛': '병신합수',
      '辛丙': '병신합수',
      '丁壬': '정임합목',
      '壬丁': '정임합목',
      '戊癸': '무계합화',
      '癸戊': '무계합화'
    };
    
    return hapNames[stem1 + stem2] || '천간합';
  }

  /**
   * 지지 합 분석
   */
  private analyzeBranchHap(branches: string[], interactions: Interactions): void {
    const positions = ['년', '월', '일', '시'];

    // 육합 (六合)
    const yukHapPairs: Record<string, string> = {
      '子': '丑', '丑': '子',  // 자축 합토
      '寅': '亥', '亥': '寅',  // 인해 합목
      '卯': '戌', '戌': '卯',  // 묘술 합화
      '辰': '酉', '酉': '辰',  // 진유 합금
      '巳': '申', '申': '巳',  // 사신 합수
      '午': '未', '未': '午'   // 오미 합화/토
    };

    // 삼합 (三合)
    const samHapGroups = [
      ['申', '子', '辰'],  // 신자진 수국
      ['寅', '午', '戌'],  // 인오술 화국
      ['巳', '酉', '丑'],  // 사유축 금국
      ['亥', '卯', '未']   // 해묘미 목국
    ];

    // 육합 검사
    for (let i = 0; i < branches.length; i++) {
      for (let j = i + 1; j < branches.length; j++) {
        if (yukHapPairs[branches[i]] === branches[j]) {
          const hapName = this.getYukHapName(branches[i], branches[j]);
          interactions.hap.push(`${positions[i]}지-${positions[j]}지 (${hapName})`);
        }
      }
    }

    // 삼합 검사
    for (const group of samHapGroups) {
      const found = group.filter(b => branches.includes(b));
      if (found.length >= 2) {
        const groupName = this.getSamHapName(group);
        if (found.length === 3) {
          interactions.hap.push(`삼합 완성 (${groupName})`);
        } else {
          interactions.hap.push(`${found.join('-')} (${groupName} 반합)`);
        }
      }
    }

    // 방합 (方合) - 삼회
    const bangHapGroups = [
      ['寅', '卯', '辰'],  // 인묘진 목국
      ['巳', '午', '未'],  // 사오미 화국
      ['申', '酉', '戌'],  // 신유술 금국
      ['亥', '子', '丑']   // 해자축 수국
    ];

    for (const group of bangHapGroups) {
      const found = group.filter(b => branches.includes(b));
      if (found.length === 3) {
        const groupName = this.getBangHapName(group);
        interactions.hap.push(`방합 (${groupName})`);
      }
    }
  }

  /**
   * 육합 이름
   */
  private getYukHapName(branch1: string, branch2: string): string {
    const yukHapNames: Record<string, string> = {
      '子丑': '자축합토', '丑子': '자축합토',
      '寅亥': '인해합목', '亥寅': '인해합목',
      '卯戌': '묘술합화', '戌卯': '묘술합화',
      '辰酉': '진유합금', '酉辰': '진유합금',
      '巳申': '사신합수', '申巳': '사신합수',
      '午未': '오미합', '未午': '오미합'
    };
    
    return yukHapNames[branch1 + branch2] || '육합';
  }

  /**
   * 삼합 이름
   */
  private getSamHapName(group: string[]): string {
    const samHapNames: Record<string, string> = {
      '申子辰': '수국',
      '寅午戌': '화국',
      '巳酉丑': '금국',
      '亥卯未': '목국'
    };
    
    const key = group.join('');
    return samHapNames[key] || '삼합';
  }

  /**
   * 방합 이름
   */
  private getBangHapName(group: string[]): string {
    const bangHapNames: Record<string, string> = {
      '寅卯辰': '목방',
      '巳午未': '화방',
      '申酉戌': '금방',
      '亥子丑': '수방'
    };
    
    const key = group.join('');
    return bangHapNames[key] || '방합';
  }

  /**
   * 지지 충 분석
   */
  private analyzeBranchChung(branches: string[], interactions: Interactions): void {
    const chungPairs: Record<string, string> = {
      '子': '午', '午': '子',  // 자오충
      '丑': '未', '未': '丑',  // 축미충
      '寅': '申', '申': '寅',  // 인신충
      '卯': '酉', '酉': '卯',  // 묘유충
      '辰': '戌', '戌': '辰',  // 진술충
      '巳': '亥', '亥': '巳'   // 사해충
    };

    const positions = ['년', '월', '일', '시'];

    for (let i = 0; i < branches.length; i++) {
      for (let j = i + 1; j < branches.length; j++) {
        if (chungPairs[branches[i]] === branches[j]) {
          interactions.chung.push(`${positions[i]}지-${positions[j]}지 (${branches[i]}${branches[j]}충)`);
        }
      }
    }
  }

  /**
   * 지지 형 분석
   */
  private analyzeBranchHyeong(branches: string[], interactions: Interactions): void {
    // 형의 종류
    const hyeongGroups = [
      ['寅', '巳', '申'],     // 인사신 삼형
      ['丑', '戌', '未'],     // 축술미 삼형
      ['子', '卯'],           // 자묘형
      ['辰', '辰'],           // 진진 자형
      ['午', '午'],           // 오오 자형
      ['酉', '酉'],           // 유유 자형
      ['亥', '亥']            // 해해 자형
    ];

    // 삼형 검사
    for (const group of hyeongGroups.slice(0, 2)) {
      const found = group.filter(b => branches.includes(b));
      if (found.length >= 2) {
        if (found.length === 3) {
          interactions.hyeong.push(`${group.join('')} 삼형 완성`);
        } else {
          interactions.hyeong.push(`${found.join('-')} 형`);
        }
      }
    }

    // 자묘형 검사
    if (branches.includes('子') && branches.includes('卯')) {
      interactions.hyeong.push('자묘형');
    }

    // 자형 검사
    const selfHyeong = ['辰', '午', '酉', '亥'];
    for (const branch of selfHyeong) {
      const count = branches.filter(b => b === branch).length;
      if (count >= 2) {
        interactions.hyeong.push(`${branch}${branch} 자형`);
      }
    }
  }

  /**
   * 지지 파 분석
   */
  private analyzeBranchPa(branches: string[], interactions: Interactions): void {
    const paPairs: Record<string, string> = {
      '子': '酉', '酉': '子',  // 자유파
      '午': '卯', '卯': '午',  // 오묘파
      '申': '巳', '巳': '申',  // 신사파
      '寅': '亥', '亥': '寅',  // 인해파
      '辰': '丑', '丑': '辰',  // 진축파
      '戌': '未', '未': '戌'   // 술미파
    };

    const positions = ['년', '월', '일', '시'];

    for (let i = 0; i < branches.length; i++) {
      for (let j = i + 1; j < branches.length; j++) {
        if (paPairs[branches[i]] === branches[j]) {
          interactions.pa.push(`${positions[i]}지-${positions[j]}지 (${branches[i]}${branches[j]}파)`);
        }
      }
    }
  }

  /**
   * 지지 해 분석
   */
  private analyzeBranchHae(branches: string[], interactions: Interactions): void {
    const haePairs: Record<string, string> = {
      '子': '未', '未': '子',  // 자미해
      '丑': '午', '午': '丑',  // 축오해
      '寅': '巳', '巳': '寅',  // 인사해
      '卯': '辰', '辰': '卯',  // 묘진해
      '申': '亥', '亥': '申',  // 신해해
      '酉': '戌', '戌': '酉'   // 유술해
    };

    const positions = ['년', '월', '일', '시'];

    for (let i = 0; i < branches.length; i++) {
      for (let j = i + 1; j < branches.length; j++) {
        if (haePairs[branches[i]] === branches[j]) {
          interactions.hae.push(`${positions[i]}지-${positions[j]}지 (${branches[i]}${branches[j]}해)`);
        }
      }
    }
  }

}