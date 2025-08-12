import {
  calculateSajuAnalysis,
  type SajuInputObject,
} from "./src/services/saju/index";

async function testPureSaju() {
  console.log("=== 순수 사주팔자 계산 테스트 (LLM 없음) ===\n");

  // 테스트 케이스들
  const testCases: SajuInputObject[] = [
    {
      name: "박시현",
      gender: "M",
      birth_date: "2002-02-13",
      birth_time: "08:10",
      is_lunar: false,
    },
    {
      name: "박근영",
      gender: "M",
      birth_date: "1971-11-07",
      birth_time: "05:00",
      is_lunar: false,
    },
    {
      name: "박시찬",
      gender: "M",
      birth_date: "2005-11-07",
      birth_time: "05:00",
      is_lunar: false,
    },
    // {
    //   name: "박민지",
    //   gender: "M",
    //   birth_date: "1955-08-08",
    //   birth_time: "16:20",
    //   is_lunar: false,
    // },
    // {
    //   name: "김민지",
    //   gender: "M",
    //   birth_date: "1955-08-09",
    //   birth_time: "15:00",
    //   is_lunar: false,
    // },
  ];

  for (const testCase of testCases) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`테스트: ${testCase.name}`);
    console.log(
      `입력: ${testCase.birth_date} ${testCase.birth_time} (${
        testCase.is_lunar ? "음력" : "양력"
      }) ${testCase.gender === "M" ? "남성" : "여성"}`
    );
    console.log("-".repeat(60));

    try {
      const result = await calculateSajuAnalysis(testCase);

      // // 기본 정보 출력
      // console.log("\n[기본 사주 정보]");
      // console.log(`일간: ${result.basic_info.ilgan}`);

      // // 사주팔자 출력
      // console.log("\n[사주팔자]");
      // console.log(`연주: ${result.basic_info.saju_palja.year_pillar}`);
      // console.log(`월주: ${result.basic_info.saju_palja.month_pillar}`);
      // console.log(`일주: ${result.basic_info.saju_palja.day_pillar}`);
      // console.log(`시주: ${result.basic_info.saju_palja.hour_pillar}`);

      // // 오행 분포
      // console.log("\n[오행 분포]");
      // const oheng = result.primary_analysis.ohaeng_distribution;
      // console.log(`목(木): ${oheng.wood}개`);
      // console.log(`화(火): ${oheng.fire}개`);
      // console.log(`토(土): ${oheng.earth}개`);
      // console.log(`금(金): ${oheng.metal}개`);
      // console.log(`수(水): ${oheng.water}개`);

      // // 십성 매핑
      // console.log("\n[십성 매핑]");
      // const sipseong = result.primary_analysis.sipseong_map;
      // console.log(`년간: ${sipseong.year_gan}`);
      // console.log(`년지: ${sipseong.year_ji}`);
      // console.log(`월간: ${sipseong.month_gan}`);
      // console.log(`월지: ${sipseong.month_ji}`);
      // console.log(`일지: ${sipseong.day_ji}`);
      // console.log(`시간: ${sipseong.hour_gan}`);
      // console.log(`시지: ${sipseong.hour_ji}`);

      // // 신살
      // console.log("\n[신살]");
      // if (result.primary_analysis.shinsal.length > 0) {
      //   console.log(result.primary_analysis.shinsal.join(", "));
      // } else {
      //   console.log("없음");
      // }

      // // 용신과 기신
      // console.log("\n[용신/기신 분석]");
      // console.log(`격국: ${result.in_depth_analysis.gyeokguk}`);
      // console.log(`용신: ${result.in_depth_analysis.yongsin}`);
      // console.log(`희신: ${result.in_depth_analysis.huisin}`);
      // console.log(`기신: ${result.in_depth_analysis.gisin}`);

      // 대운 (첫 3개만)
      console.log("\n[대운 정보]");
      result.basic_info.daeun.slice(0, 3).forEach((d) => {
        console.log(`${d.age}세: ${d.ganji}`);
      });
    } catch (error) {
      console.error("계산 실패:", error);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("테스트 완료");
}

// 실행
testPureSaju().catch(console.error);
