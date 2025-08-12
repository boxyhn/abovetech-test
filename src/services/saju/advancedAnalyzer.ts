// 심층 분석 서비스 (격국, 용신 판별)
import { 
  InDepthAnalysis,
  SajuPalja,
  SipseongMap,
  OhaengDistribution,
  FiveElements,
  TenGods
} from './types';
import { OhaengAnalyzer } from './ohaengAnalyzer';
import { SipseongAnalyzer } from './sipseongAnalyzer';

export class AdvancedAnalyzer {
  private ohaengAnalyzer: OhaengAnalyzer;
  private sipseongAnalyzer: SipseongAnalyzer;

  constructor() {
    this.ohaengAnalyzer = new OhaengAnalyzer();
    this.sipseongAnalyzer = new SipseongAnalyzer();
  }

  /**
   * 심층 분석 수행
   */
  performInDepthAnalysis(
    sajuPalja: SajuPalja,
    ilgan: string,
    sipseongMap: SipseongMap,
    ohaengDistribution: OhaengDistribution
  ): InDepthAnalysis {
    // 격국 판별
    const gyeokguk = this.determineGyeokguk(sajuPalja, ilgan, sipseongMap);
    
    // 용신, 희신, 기신 판별
    const { yongsin, huisin, gisin } = this.determineYongsinSystem(
      ilgan,
      ohaengDistribution,
      sajuPalja
    );

    return {
      gyeokguk,
      yongsin,
      huisin,
      gisin
    };
  }

  /**
   * 격국 판별
   */
  private determineGyeokguk(
    sajuPalja: SajuPalja,
    ilgan: string,
    sipseongMap: SipseongMap
  ): string {
    // 월지를 기준으로 격국 판별
    const monthSipseong = sipseongMap.month_ji;
    
    // 특수 격국 먼저 확인
    const specialGyeokguk = this.checkSpecialGyeokguk(sajuPalja, ilgan, sipseongMap);
    if (specialGyeokguk) {
      return specialGyeokguk;
    }

    // 일반 격국 판별 (월지 십성 기준)
    switch (monthSipseong) {
      case TenGods.JEONG_IN:
      case TenGods.PYEON_IN:
        return '인수격';
        
      case TenGods.JEONG_GWAN:
        return '정관격';
        
      case TenGods.PYEON_GWAN:
        return '편관격';
        
      case TenGods.JEONG_JAE:
        return '정재격';
        
      case TenGods.PYEON_JAE:
        return '편재격';
        
      case TenGods.SIG_SIN:
        return '식신격';
        
      case TenGods.SANG_GWAN:
        return '상관격';
        
      case TenGods.BI_GYEON:
        return '건록격';
        
      case TenGods.GYEOB_JAE:
        return '양인격';
        
      default:
        return '정격';
    }
  }

  /**
   * 특수 격국 확인
   */
  private checkSpecialGyeokguk(
    _sajuPalja: SajuPalja,
    _ilgan: string,
    sipseongMap: SipseongMap
  ): string | null {
    // 종격 확인 (일간이 극도로 약하고 한 오행이 압도적)
    const distribution = Object.values(sipseongMap);
    const dominantCount = Math.max(
      distribution.filter(s => s === TenGods.JEONG_JAE || s === TenGods.PYEON_JAE).length,
      distribution.filter(s => s === TenGods.JEONG_GWAN || s === TenGods.PYEON_GWAN).length,
      distribution.filter(s => s === TenGods.SIG_SIN || s === TenGods.SANG_GWAN).length,
      distribution.filter(s => s === TenGods.JEONG_IN || s === TenGods.PYEON_IN).length,
      distribution.filter(s => s === TenGods.BI_GYEON || s === TenGods.GYEOB_JAE).length
    );

    if (dominantCount >= 5) {
      if (distribution.filter(s => s === TenGods.JEONG_JAE || s === TenGods.PYEON_JAE).length >= 5) {
        return '종재격';
      }
      if (distribution.filter(s => s === TenGods.JEONG_GWAN || s === TenGods.PYEON_GWAN).length >= 5) {
        return '종관격';
      }
      if (distribution.filter(s => s === TenGods.SIG_SIN || s === TenGods.SANG_GWAN).length >= 5) {
        return '종아격';
      }
    }

    // 전왕격 확인 (비겁이 극도로 강함)
    if (distribution.filter(s => s === TenGods.BI_GYEON || s === TenGods.GYEOB_JAE).length >= 5) {
      return '전왕격';
    }

    // 일행득기격 확인 (한 오행이 압도적)
    // 이는 오행 분포를 봐야 하므로 생략

    return null;
  }

  /**
   * 용신, 희신, 기신 시스템 판별
   */
  private determineYongsinSystem(
    ilgan: string,
    ohaengDistribution: OhaengDistribution,
    sajuPalja: SajuPalja
  ): { yongsin: string; huisin: string; gisin: string } {
    // 일간의 오행 확인
    const ilganElement = this.ohaengAnalyzer.getIlganElement(ilgan);
    
    // 일간의 강약 판별
    const ilganStrength = this.calculateIlganStrength(
      ilgan,
      ohaengDistribution,
      sajuPalja
    );

    // 계절(월지)의 영향 확인
    const season = this.determineSeason(sajuPalja.month_pillar[1]);
    
    // 용신 결정 로직
    let yongsin: string;
    let huisin: string;
    let gisin: string;

    if (ilganStrength === 'strong') {
      // 일간이 강한 경우: 설기(洩氣), 극(剋), 재(財)를 용신으로
      yongsin = this.getWeakeningElement(ilganElement);
      huisin = this.getSupportingElement(yongsin);
      gisin = this.getStrengtheningElement(ilganElement);
    } else if (ilganStrength === 'weak') {
      // 일간이 약한 경우: 생(生), 비겁(比劫)을 용신으로
      yongsin = this.getStrengtheningElement(ilganElement);
      huisin = this.getSupportingElement(yongsin);
      gisin = this.getWeakeningElement(ilganElement);
    } else {
      // 중화인 경우: 조후(調候)를 우선
      yongsin = this.getSeasonalBalance(ilganElement, season);
      huisin = this.getSupportingElement(yongsin);
      gisin = this.getOpposingElement(yongsin);
    }

    return { yongsin, huisin, gisin };
  }

  /**
   * 일간 강약 판별
   */
  private calculateIlganStrength(
    ilgan: string,
    ohaengDistribution: OhaengDistribution,
    sajuPalja: SajuPalja
  ): 'strong' | 'weak' | 'balanced' {
    const ilganElement = this.ohaengAnalyzer.getIlganElement(ilgan);
    
    // 일간을 돕는 오행들의 합
    let supportingPower = 0;
    let opposingPower = 0;

    // 오행별 점수 계산
    switch (ilganElement) {
      case FiveElements.WOOD:
        supportingPower = ohaengDistribution.wood + ohaengDistribution.water;
        opposingPower = ohaengDistribution.metal + ohaengDistribution.fire + ohaengDistribution.earth;
        break;
      case FiveElements.FIRE:
        supportingPower = ohaengDistribution.fire + ohaengDistribution.wood;
        opposingPower = ohaengDistribution.water + ohaengDistribution.earth + ohaengDistribution.metal;
        break;
      case FiveElements.EARTH:
        supportingPower = ohaengDistribution.earth + ohaengDistribution.fire;
        opposingPower = ohaengDistribution.wood + ohaengDistribution.metal + ohaengDistribution.water;
        break;
      case FiveElements.METAL:
        supportingPower = ohaengDistribution.metal + ohaengDistribution.earth;
        opposingPower = ohaengDistribution.fire + ohaengDistribution.water + ohaengDistribution.wood;
        break;
      case FiveElements.WATER:
        supportingPower = ohaengDistribution.water + ohaengDistribution.metal;
        opposingPower = ohaengDistribution.earth + ohaengDistribution.wood + ohaengDistribution.fire;
        break;
    }

    // 월령의 영향 추가 (월지가 일간을 돕는지)
    const monthBranch = sajuPalja.month_pillar[1];
    const monthElement = this.getBranchElement(monthBranch);
    if (this.isSupporting(monthElement, ilganElement)) {
      supportingPower += 2; // 월령 가중치
    } else {
      opposingPower += 2;
    }

    // 강약 판별
    const ratio = supportingPower / (supportingPower + opposingPower);
    if (ratio > 0.6) {
      return 'strong';
    } else if (ratio < 0.4) {
      return 'weak';
    } else {
      return 'balanced';
    }
  }

  /**
   * 계절 판별
   */
  private determineSeason(monthBranch: string): 'spring' | 'summer' | 'autumn' | 'winter' {
    const seasonMap: Record<string, 'spring' | 'summer' | 'autumn' | 'winter'> = {
      '寅': 'spring', '卯': 'spring', '辰': 'spring',
      '巳': 'summer', '午': 'summer', '未': 'summer',
      '申': 'autumn', '酉': 'autumn', '戌': 'autumn',
      '亥': 'winter', '子': 'winter', '丑': 'winter'
    };
    
    return seasonMap[monthBranch] || 'spring';
  }

  /**
   * 지지의 오행 반환
   */
  private getBranchElement(branch: string): FiveElements {
    const branchElements: Record<string, FiveElements> = {
      '子': FiveElements.WATER, '丑': FiveElements.EARTH,
      '寅': FiveElements.WOOD,  '卯': FiveElements.WOOD,
      '辰': FiveElements.EARTH, '巳': FiveElements.FIRE,
      '午': FiveElements.FIRE,  '未': FiveElements.EARTH,
      '申': FiveElements.METAL, '酉': FiveElements.METAL,
      '戌': FiveElements.EARTH, '亥': FiveElements.WATER
    };
    
    return branchElements[branch] || FiveElements.EARTH;
  }

  /**
   * 오행이 일간을 돕는지 확인
   */
  private isSupporting(element: FiveElements, ilganElement: FiveElements): boolean {
    // 같은 오행이거나 생하는 오행인 경우
    if (element === ilganElement) return true;
    
    const generationMap: Record<FiveElements, FiveElements> = {
      [FiveElements.WOOD]: FiveElements.FIRE,
      [FiveElements.FIRE]: FiveElements.EARTH,
      [FiveElements.EARTH]: FiveElements.METAL,
      [FiveElements.METAL]: FiveElements.WATER,
      [FiveElements.WATER]: FiveElements.WOOD
    };
    
    // element가 ilganElement를 생하는 경우
    return generationMap[element] === ilganElement;
  }

  /**
   * 일간을 강하게 하는 오행
   */
  private getStrengtheningElement(ilganElement: FiveElements): string {
    const strengthenMap: Record<FiveElements, string> = {
      [FiveElements.WOOD]: FiveElements.WATER,  // 목은 수가 생함
      [FiveElements.FIRE]: FiveElements.WOOD,   // 화는 목이 생함
      [FiveElements.EARTH]: FiveElements.FIRE,  // 토는 화가 생함
      [FiveElements.METAL]: FiveElements.EARTH, // 금은 토가 생함
      [FiveElements.WATER]: FiveElements.METAL  // 수는 금이 생함
    };
    
    return strengthenMap[ilganElement];
  }

  /**
   * 일간을 약하게 하는 오행
   */
  private getWeakeningElement(ilganElement: FiveElements): string {
    const weakenMap: Record<FiveElements, string> = {
      [FiveElements.WOOD]: FiveElements.METAL,  // 목은 금이 극함
      [FiveElements.FIRE]: FiveElements.WATER,  // 화는 수가 극함
      [FiveElements.EARTH]: FiveElements.WOOD,  // 토는 목이 극함
      [FiveElements.METAL]: FiveElements.FIRE,  // 금은 화가 극함
      [FiveElements.WATER]: FiveElements.EARTH  // 수는 토가 극함
    };
    
    return weakenMap[ilganElement];
  }

  /**
   * 용신을 돕는 오행 (희신)
   */
  private getSupportingElement(yongsin: string): string {
    const element = yongsin as FiveElements;
    const supportMap: Record<FiveElements, string> = {
      [FiveElements.WOOD]: FiveElements.WATER,
      [FiveElements.FIRE]: FiveElements.WOOD,
      [FiveElements.EARTH]: FiveElements.FIRE,
      [FiveElements.METAL]: FiveElements.EARTH,
      [FiveElements.WATER]: FiveElements.METAL
    };
    
    return supportMap[element] || element;
  }

  /**
   * 용신과 대립하는 오행 (기신)
   */
  private getOpposingElement(yongsin: string): string {
    const element = yongsin as FiveElements;
    const opposeMap: Record<FiveElements, string> = {
      [FiveElements.WOOD]: FiveElements.METAL,
      [FiveElements.FIRE]: FiveElements.WATER,
      [FiveElements.EARTH]: FiveElements.WOOD,
      [FiveElements.METAL]: FiveElements.FIRE,
      [FiveElements.WATER]: FiveElements.EARTH
    };
    
    return opposeMap[element] || element;
  }

  /**
   * 계절별 조후 용신
   */
  private getSeasonalBalance(ilganElement: FiveElements, season: string): string {
    // 계절에 따른 조후 용신 (간단한 버전)
    if (season === 'winter') {
      // 겨울에는 화가 필요
      return FiveElements.FIRE;
    } else if (season === 'summer') {
      // 여름에는 수가 필요
      return FiveElements.WATER;
    } else {
      // 봄가을은 중화 유지
      return ilganElement;
    }
  }
}