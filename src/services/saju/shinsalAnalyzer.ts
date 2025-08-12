// 신살 분석 서비스
import { 
  SajuPalja
} from './types';

export class ShinsalAnalyzer {
  /**
   * 12신살 추출
   * @param sajuPalja 사주팔자
   */
  extractShinsal(sajuPalja: SajuPalja): string[] {
    const shinsalList: string[] = [];
    
    // 지지들 추출
    const branches = [
      sajuPalja.year_pillar[1],
      sajuPalja.month_pillar[1],
      sajuPalja.day_pillar[1],
      sajuPalja.hour_pillar[1]
    ];

    // 일지 기준 신살들
    const dayBranch = sajuPalja.day_pillar[1];
    
    // 역마살 (驛馬殺) - 일지 기준
    if (this.hasYeokma(dayBranch, branches)) {
      shinsalList.push('역마살');
    }

    // 도화살 (桃花殺) - 일지 또는 년지 기준
    if (this.hasDohwa(dayBranch, branches) || this.hasDohwa(sajuPalja.year_pillar[1], branches)) {
      shinsalList.push('도화살');
    }

    // 화개살 (華蓋殺) - 일지 또는 년지 기준
    if (this.hasHwagae(dayBranch, branches) || this.hasHwagae(sajuPalja.year_pillar[1], branches)) {
      shinsalList.push('화개살');
    }

    // 천을귀인 (天乙貴人) - 일간 기준
    const ilgan = sajuPalja.day_pillar[0];
    if (this.hasCheonEul(ilgan, branches)) {
      shinsalList.push('천을귀인');
    }

    // 천의성 (天醫星) - 월지 기준
    if (this.hasCheonUi(sajuPalja.month_pillar[1], branches)) {
      shinsalList.push('천의성');
    }

    // 문창귀인 (文昌貴人) - 일간 기준
    if (this.hasMoonChang(ilgan, branches)) {
      shinsalList.push('문창귀인');
    }

    // 양인살 (羊刃殺) - 일간 기준
    if (this.hasYangIn(ilgan, branches)) {
      shinsalList.push('양인살');
    }

    // 괴강살 (魁罡殺) - 일주 기준
    if (this.hasGoeGang(sajuPalja.day_pillar)) {
      shinsalList.push('괴강살');
    }

    // 공망 (空亡) - 일주 기준
    if (this.hasGongMang(sajuPalja.day_pillar, branches)) {
      shinsalList.push('공망');
    }

    // 백호살 (白虎殺) - 년지 기준
    if (this.hasBaekho(sajuPalja.year_pillar[1], branches)) {
      shinsalList.push('백호살');
    }

    // 현침살 (懸針殺) - 일지 기준
    if (this.hasHyeonChim(dayBranch, branches)) {
      shinsalList.push('현침살');
    }

    // 홍염살 (紅艶殺) - 일간 기준
    if (this.hasHongYeom(ilgan, branches)) {
      shinsalList.push('홍염살');
    }

    return shinsalList;
  }

  /**
   * 역마살 판별
   */
  private hasYeokma(baseBranch: string, branches: string[]): boolean {
    const yeokmaMap: Record<string, string[]> = {
      '申': ['寅'], '子': ['寅'], '辰': ['寅'],  // 신자진 -> 인
      '寅': ['申'], '午': ['申'], '戌': ['申'],  // 인오술 -> 신
      '巳': ['亥'], '酉': ['亥'], '丑': ['亥'],  // 사유축 -> 해
      '亥': ['巳'], '卯': ['巳'], '未': ['巳']   // 해묘미 -> 사
    };
    
    const targets = yeokmaMap[baseBranch] || [];
    return targets.some(target => branches.includes(target));
  }

  /**
   * 도화살 판별
   */
  private hasDohwa(baseBranch: string, branches: string[]): boolean {
    const dohwaMap: Record<string, string> = {
      '申': '酉', '子': '酉', '辰': '酉',  // 신자진 -> 유
      '寅': '卯', '午': '卯', '戌': '卯',  // 인오술 -> 묘
      '巳': '午', '酉': '午', '丑': '午',  // 사유축 -> 오
      '亥': '子', '卯': '子', '未': '子'   // 해묘미 -> 자
    };
    
    const target = dohwaMap[baseBranch];
    return target ? branches.includes(target) : false;
  }

  /**
   * 화개살 판별
   */
  private hasHwagae(baseBranch: string, branches: string[]): boolean {
    const hwagaeMap: Record<string, string> = {
      '申': '辰', '子': '辰', '辰': '辰',  // 신자진 -> 진
      '寅': '戌', '午': '戌', '戌': '戌',  // 인오술 -> 술
      '巳': '丑', '酉': '丑', '丑': '丑',  // 사유축 -> 축
      '亥': '未', '卯': '未', '未': '未'   // 해묘미 -> 미
    };
    
    const target = hwagaeMap[baseBranch];
    return target ? branches.includes(target) : false;
  }

  /**
   * 천을귀인 판별
   */
  private hasCheonEul(ilgan: string, branches: string[]): boolean {
    const cheonEulMap: Record<string, string[]> = {
      '甲': ['丑', '未'], '戊': ['丑', '未'],
      '乙': ['子', '申'], '己': ['子', '申'],
      '丙': ['亥', '酉'], '丁': ['亥', '酉'],
      '庚': ['午', '寅'], '辛': ['午', '寅'],
      '壬': ['巳', '卯'], '癸': ['巳', '卯']
    };
    
    const targets = cheonEulMap[ilgan] || [];
    return targets.some(target => branches.includes(target));
  }

  /**
   * 천의성 판별
   */
  private hasCheonUi(monthBranch: string, branches: string[]): boolean {
    const cheonUiMap: Record<string, string> = {
      '寅': '丑', '卯': '寅', '辰': '卯', '巳': '辰',
      '午': '巳', '未': '午', '申': '未', '酉': '申',
      '戌': '酉', '亥': '戌', '子': '亥', '丑': '子'
    };
    
    const target = cheonUiMap[monthBranch];
    return target ? branches.includes(target) : false;
  }

  /**
   * 문창귀인 판별
   */
  private hasMoonChang(ilgan: string, branches: string[]): boolean {
    const moonChangMap: Record<string, string> = {
      '甲': '巳', '乙': '午', '丙': '申', '戊': '申',
      '丁': '酉', '己': '酉', '庚': '亥', '辛': '子',
      '壬': '寅', '癸': '卯'
    };
    
    const target = moonChangMap[ilgan];
    return target ? branches.includes(target) : false;
  }

  /**
   * 양인살 판별
   */
  private hasYangIn(ilgan: string, branches: string[]): boolean {
    const yangInMap: Record<string, string> = {
      '甲': '卯', '乙': '寅', '丙': '午', '丁': '巳',
      '戊': '午', '己': '巳', '庚': '酉', '辛': '申',
      '壬': '子', '癸': '亥'
    };
    
    const target = yangInMap[ilgan];
    return target ? branches.includes(target) : false;
  }

  /**
   * 괴강살 판별
   */
  private hasGoeGang(dayPillar: string): boolean {
    const goeGangPillars = ['戊戌', '庚戌', '庚辰', '壬辰'];
    return goeGangPillars.includes(dayPillar);
  }

  /**
   * 공망 판별
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private hasGongMang(_dayPillar: string, _branches: string[]): boolean {
    // 일주의 순중 공망 계산 (간단한 버전)
    // 갑자순의 공망은 술, 해
    // 갑인순의 공망은 자, 축... 등
    // 실제로는 더 복잡한 계산 필요
    return false; // 간단한 구현을 위해 일단 false 반환
  }

  /**
   * 백호살 판별
   */
  private hasBaekho(yearBranch: string, branches: string[]): boolean {
    const baekhoMap: Record<string, string> = {
      '子': '戌', '丑': '亥', '寅': '子', '卯': '丑',
      '辰': '寅', '巳': '卯', '午': '辰', '未': '巳',
      '申': '午', '酉': '未', '戌': '申', '亥': '酉'
    };
    
    const target = baekhoMap[yearBranch];
    return target ? branches.includes(target) : false;
  }

  /**
   * 현침살 판별
   */
  private hasHyeonChim(dayBranch: string, branches: string[]): boolean {
    const hyeonChimMap: Record<string, string> = {
      '子': '午', '丑': '未', '寅': '申', '卯': '酉',
      '辰': '戌', '巳': '亥', '午': '子', '未': '丑',
      '申': '寅', '酉': '卯', '戌': '辰', '亥': '巳'
    };
    
    const target = hyeonChimMap[dayBranch];
    return target ? branches.includes(target) : false;
  }

  /**
   * 홍염살 판별
   */
  private hasHongYeom(ilgan: string, branches: string[]): boolean {
    const hongYeomMap: Record<string, string> = {
      '甲': '午', '乙': '申', '丙': '寅', '丁': '未',
      '戊': '辰', '己': '辰', '庚': '戌', '辛': '酉',
      '壬': '子', '癸': '申'
    };
    
    const target = hongYeomMap[ilgan];
    return target ? branches.includes(target) : false;
  }

  /**
   * 신살 의미 해석
   */
  getShinsalMeaning(shinsal: string): string {
    const meanings: Record<string, string> = {
      '역마살': '이동수, 변동, 활동적인 기운',
      '도화살': '인기, 매력, 이성운',
      '화개살': '예술성, 종교성, 학문',
      '천을귀인': '귀인의 도움, 행운',
      '천의성': '의료, 치료, 건강 관련 재능',
      '문창귀인': '학업, 문서, 지적 능력',
      '양인살': '강한 의지, 추진력, 극단성',
      '괴강살': '강직함, 리더십, 고집',
      '공망': '허무, 변화, 영적 성향',
      '백호살': '강한 성격, 돌발 상황',
      '현침살': '예리함, 비판력, 갈등',
      '홍염살': '매력, 이성 관계, 정열'
    };
    
    return meanings[shinsal] || '특별한 기운';
  }
}