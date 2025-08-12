// 12운성 분석 서비스
import { 
  Unseong12Map,
  SajuPalja,
  TwelveLifeStages,
  EARTHLY_BRANCHES
} from './types';

export class UnseongAnalyzer {
  // 천간별 12운성 배치 (지지 순서대로)
  // 자, 축, 인, 묘, 진, 사, 오, 미, 신, 유, 술, 해
  private readonly UNSEONG_MAP: Record<string, TwelveLifeStages[]> = {
    // 양간 (甲, 丙, 戊, 庚, 壬)
    '甲': [ // 갑목
      TwelveLifeStages.MOG_YOG,  // 자
      TwelveLifeStages.SOE,       // 축
      TwelveLifeStages.GIN_ROK,   // 인
      TwelveLifeStages.JE_WANG,   // 묘
      TwelveLifeStages.SOE,       // 진
      TwelveLifeStages.BYEONG,    // 사
      TwelveLifeStages.SA,        // 오
      TwelveLifeStages.MYO,       // 미
      TwelveLifeStages.JEOL,      // 신
      TwelveLifeStages.TAE,       // 유
      TwelveLifeStages.YANG,      // 술
      TwelveLifeStages.JAE        // 해
    ],
    '丙': [ // 병화
      TwelveLifeStages.TAE,       // 자
      TwelveLifeStages.YANG,      // 축
      TwelveLifeStages.JAE,       // 인
      TwelveLifeStages.MOG_YOG,   // 묘
      TwelveLifeStages.GWAN_DAE,  // 진
      TwelveLifeStages.GIN_ROK,   // 사
      TwelveLifeStages.JE_WANG,   // 오
      TwelveLifeStages.SOE,       // 미
      TwelveLifeStages.BYEONG,    // 신
      TwelveLifeStages.SA,        // 유
      TwelveLifeStages.MYO,       // 술
      TwelveLifeStages.JEOL       // 해
    ],
    '戊': [ // 무토
      TwelveLifeStages.TAE,       // 자
      TwelveLifeStages.YANG,      // 축
      TwelveLifeStages.JAE,       // 인
      TwelveLifeStages.MOG_YOG,   // 묘
      TwelveLifeStages.GWAN_DAE,  // 진
      TwelveLifeStages.GIN_ROK,   // 사
      TwelveLifeStages.JE_WANG,   // 오
      TwelveLifeStages.SOE,       // 미
      TwelveLifeStages.BYEONG,    // 신
      TwelveLifeStages.SA,        // 유
      TwelveLifeStages.MYO,       // 술
      TwelveLifeStages.JEOL       // 해
    ],
    '庚': [ // 경금
      TwelveLifeStages.SA,        // 자
      TwelveLifeStages.MYO,       // 축
      TwelveLifeStages.JEOL,      // 인
      TwelveLifeStages.TAE,       // 묘
      TwelveLifeStages.YANG,      // 진
      TwelveLifeStages.JAE,       // 사
      TwelveLifeStages.MOG_YOG,   // 오
      TwelveLifeStages.GWAN_DAE,  // 미
      TwelveLifeStages.GIN_ROK,   // 신
      TwelveLifeStages.JE_WANG,   // 유
      TwelveLifeStages.SOE,       // 술
      TwelveLifeStages.BYEONG     // 해
    ],
    '壬': [ // 임수
      TwelveLifeStages.JE_WANG,   // 자
      TwelveLifeStages.SOE,       // 축
      TwelveLifeStages.BYEONG,    // 인
      TwelveLifeStages.SA,        // 묘
      TwelveLifeStages.MYO,       // 진
      TwelveLifeStages.JEOL,      // 사
      TwelveLifeStages.TAE,       // 오
      TwelveLifeStages.YANG,      // 미
      TwelveLifeStages.JAE,       // 신
      TwelveLifeStages.MOG_YOG,   // 유
      TwelveLifeStages.GWAN_DAE,  // 술
      TwelveLifeStages.GIN_ROK    // 해
    ],
    // 음간 (乙, 丁, 己, 辛, 癸) - 역순
    '乙': [ // 을목
      TwelveLifeStages.BYEONG,    // 자
      TwelveLifeStages.SOE,       // 축
      TwelveLifeStages.JE_WANG,   // 인
      TwelveLifeStages.GIN_ROK,   // 묘
      TwelveLifeStages.GWAN_DAE,  // 진
      TwelveLifeStages.MOG_YOG,   // 사
      TwelveLifeStages.JAE,       // 오
      TwelveLifeStages.YANG,      // 미
      TwelveLifeStages.TAE,       // 신
      TwelveLifeStages.JEOL,      // 유
      TwelveLifeStages.MYO,       // 술
      TwelveLifeStages.SA         // 해
    ],
    '丁': [ // 정화
      TwelveLifeStages.JEOL,      // 자
      TwelveLifeStages.MYO,       // 축
      TwelveLifeStages.SA,        // 인
      TwelveLifeStages.BYEONG,    // 묘
      TwelveLifeStages.SOE,       // 진
      TwelveLifeStages.JE_WANG,   // 사
      TwelveLifeStages.GIN_ROK,   // 오
      TwelveLifeStages.GWAN_DAE,  // 미
      TwelveLifeStages.MOG_YOG,   // 신
      TwelveLifeStages.JAE,       // 유
      TwelveLifeStages.YANG,      // 술
      TwelveLifeStages.TAE        // 해
    ],
    '己': [ // 기토
      TwelveLifeStages.JEOL,      // 자
      TwelveLifeStages.MYO,       // 축
      TwelveLifeStages.SA,        // 인
      TwelveLifeStages.BYEONG,    // 묘
      TwelveLifeStages.SOE,       // 진
      TwelveLifeStages.JE_WANG,   // 사
      TwelveLifeStages.GIN_ROK,   // 오
      TwelveLifeStages.GWAN_DAE,  // 미
      TwelveLifeStages.MOG_YOG,   // 신
      TwelveLifeStages.JAE,       // 유
      TwelveLifeStages.YANG,      // 술
      TwelveLifeStages.TAE        // 해
    ],
    '辛': [ // 신금
      TwelveLifeStages.JAE,       // 자
      TwelveLifeStages.YANG,      // 축
      TwelveLifeStages.TAE,       // 인
      TwelveLifeStages.JEOL,      // 묘
      TwelveLifeStages.MYO,       // 진
      TwelveLifeStages.SA,        // 사
      TwelveLifeStages.BYEONG,    // 오
      TwelveLifeStages.SOE,       // 미
      TwelveLifeStages.JE_WANG,   // 신
      TwelveLifeStages.GIN_ROK,   // 유
      TwelveLifeStages.GWAN_DAE,  // 술
      TwelveLifeStages.MOG_YOG    // 해
    ],
    '癸': [ // 계수
      TwelveLifeStages.GIN_ROK,   // 자
      TwelveLifeStages.GWAN_DAE,  // 축
      TwelveLifeStages.MOG_YOG,   // 인
      TwelveLifeStages.JAE,       // 묘
      TwelveLifeStages.YANG,      // 진
      TwelveLifeStages.TAE,       // 사
      TwelveLifeStages.JEOL,      // 오
      TwelveLifeStages.MYO,       // 미
      TwelveLifeStages.SA,        // 신
      TwelveLifeStages.BYEONG,    // 유
      TwelveLifeStages.SOE,       // 술
      TwelveLifeStages.JE_WANG    // 해
    ]
  };

  /**
   * 12운성 매핑 계산
   * @param sajuPalja 사주팔자
   * @param ilgan 일간
   */
  calculateUnseong12Map(sajuPalja: SajuPalja, ilgan: string): Unseong12Map {
    const unseongList = this.UNSEONG_MAP[ilgan];
    
    if (!unseongList) {
      throw new Error(`Invalid ilgan: ${ilgan}`);
    }

    return {
      year_pillar: this.getUnseong(ilgan, sajuPalja.year_pillar[1]),
      month_pillar: this.getUnseong(ilgan, sajuPalja.month_pillar[1]),
      day_pillar: this.getUnseong(ilgan, sajuPalja.day_pillar[1]),
      hour_pillar: this.getUnseong(ilgan, sajuPalja.hour_pillar[1])
    };
  }

  /**
   * 특정 지지의 운성 계산
   */
  private getUnseong(ilgan: string, branch: string): string {
    const unseongList = this.UNSEONG_MAP[ilgan];
    const branchIndex = EARTHLY_BRANCHES.indexOf(branch as typeof EARTHLY_BRANCHES[number]);
    
    if (branchIndex === -1) {
      throw new Error(`Invalid branch: ${branch}`);
    }

    return unseongList[branchIndex];
  }

}