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

    // 백호살 (白虎殺) - 일주 기준
    if (this.hasBaekho(sajuPalja)) {
      shinsalList.push('백호살');
    }

    // 현침살 (懸針殺) - 사주 전체 확인
    if (this.hasHyeonChim(sajuPalja)) {
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
   * 일주가 속한 60갑자 순중에 따라 결정
   */
  private hasGongMang(dayPillar: string, branches: string[]): boolean {
    // 60갑자를 10개씩 나눈 순중별 공망
    const gongMangMap: Record<string, string[]> = {
      // 갑자순 (甲子~癸酉): 공망은 戌, 亥
      '甲子': ['戌', '亥'], '乙丑': ['戌', '亥'], '丙寅': ['戌', '亥'], '丁卯': ['戌', '亥'], '戊辰': ['戌', '亥'],
      '己巳': ['戌', '亥'], '庚午': ['戌', '亥'], '辛未': ['戌', '亥'], '壬申': ['戌', '亥'], '癸酉': ['戌', '亥'],
      
      // 갑술순 (甲戌~癸未): 공망은 申, 酉
      '甲戌': ['申', '酉'], '乙亥': ['申', '酉'], '丙子': ['申', '酉'], '丁丑': ['申', '酉'], '戊寅': ['申', '酉'],
      '己卯': ['申', '酉'], '庚辰': ['申', '酉'], '辛巳': ['申', '酉'], '壬午': ['申', '酉'], '癸未': ['申', '酉'],
      
      // 갑신순 (甲申~癸巳): 공망은 午, 未
      '甲申': ['午', '未'], '乙酉': ['午', '未'], '丙戌': ['午', '未'], '丁亥': ['午', '未'], '戊子': ['午', '未'],
      '己丑': ['午', '未'], '庚寅': ['午', '未'], '辛卯': ['午', '未'], '壬辰': ['午', '未'], '癸巳': ['午', '未'],
      
      // 갑오순 (甲午~癸卯): 공망은 辰, 巳
      '甲午': ['辰', '巳'], '乙未': ['辰', '巳'], '丙申': ['辰', '巳'], '丁酉': ['辰', '巳'], '戊戌': ['辰', '巳'],
      '己亥': ['辰', '巳'], '庚子': ['辰', '巳'], '辛丑': ['辰', '巳'], '壬寅': ['辰', '巳'], '癸卯': ['辰', '巳'],
      
      // 갑진순 (甲辰~癸丑): 공망은 寅, 卯
      '甲辰': ['寅', '卯'], '乙巳': ['寅', '卯'], '丙午': ['寅', '卯'], '丁未': ['寅', '卯'], '戊申': ['寅', '卯'],
      '己酉': ['寅', '卯'], '庚戌': ['寅', '卯'], '辛亥': ['寅', '卯'], '壬子': ['寅', '卯'], '癸丑': ['寅', '卯'],
      
      // 갑인순 (甲寅~癸亥): 공망은 子, 丑
      '甲寅': ['子', '丑'], '乙卯': ['子', '丑'], '丙辰': ['子', '丑'], '丁巳': ['子', '丑'], '戊午': ['子', '丑'],
      '己未': ['子', '丑'], '庚申': ['子', '丑'], '辛酉': ['子', '丑'], '壬戌': ['子', '丑'], '癸亥': ['子', '丑']
    };
    
    const gongMangBranches = gongMangMap[dayPillar];
    if (!gongMangBranches) return false;
    
    // 사주의 지지 중에 공망에 해당하는 지지가 있는지 확인
    return gongMangBranches.some(gm => branches.includes(gm));
  }

  /**
   * 백호살 판별
   * 특정 일주에서 성립하는 신살
   */
  private hasBaekho(sajuPalja: SajuPalja): boolean {
    // 백호살이 성립하는 특정 일주
    const baekhoJiju = ['甲辰', '乙未', '丙戌', '丁丑', '戊辰', '己未', '庚戌', '辛丑', '壬戌', '癸丑'];
    
    // 일주가 백호살에 해당하는지 확인
    return baekhoJiju.includes(sajuPalja.day_pillar);
  }

  /**
   * 현침살 판별
   * 뾰족한 모양의 글자가 사주에 있을 때 성립
   */
  private hasHyeonChim(sajuPalja: SajuPalja): boolean {
    // 현침살에 해당하는 글자들 (뾰족한 모양)
    // 천간: 甲, 辛
    // 지지: 申, 卯, 午, 未
    const hyeonChimGan = ['甲', '辛'];
    const hyeonChimJi = ['申', '卯', '午', '未'];
    
    // 사주팔자의 모든 글자 추출
    const allChars = [
      sajuPalja.year_pillar[0], sajuPalja.year_pillar[1],
      sajuPalja.month_pillar[0], sajuPalja.month_pillar[1],
      sajuPalja.day_pillar[0], sajuPalja.day_pillar[1],
      sajuPalja.hour_pillar[0], sajuPalja.hour_pillar[1]
    ];
    
    // 천간이나 지지에 현침살 글자가 있는지 확인
    return allChars.some(char => hyeonChimGan.includes(char) || hyeonChimJi.includes(char));
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

}