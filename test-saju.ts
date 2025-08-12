import { SajuAnalyzerService } from "./src/services/saju/analyzer";
import { InfoExtractorService } from "./src/services/saju/infoExtractor";
import type { Session } from "./src/types/database";

async function testSajuAnalyzer() {
  console.log("=== 사주 분석 테스트 시작 ===\n");

  // 테스트 케이스들 - Session 타입에 맞게 수정
  const testCases: Partial<Session>[] = [
    {
      id: "test-1",
      user_name: "홍길동",
      birth_date: "1990-03-15",
      birth_time: "14:30",
      gender: "M",
    },
    {
      id: "test-2",
      user_name: "김영희",
      birth_date: "1985-07-22",
      birth_time: "08:45",
      gender: "F",
    },
  ];

  const analyzer = new SajuAnalyzerService();

  for (const testCase of testCases) {
    console.log(`\n테스트: ${testCase.user_name}`);
    console.log("입력 정보:", testCase);
    console.log("-".repeat(50));

    try {
      // performInitialAnalysis 메서드 사용
      const result = await analyzer.performInitialAnalysis(testCase as Session);
      console.log("분석 결과:");
      console.log(result);
    } catch (error) {
      console.error("분석 실패:", error);
    }

    console.log("=".repeat(50));
  }
}

async function testInfoExtractor() {
  console.log("\n=== 정보 추출 테스트 시작 ===\n");

  const extractor = new InfoExtractorService();

  // 테스트 대화들
  const testConversations = [
    {
      history: "",
      newMessage: "안녕하세요! 제 이름은 박지민이고 1992년 8월 15일 오후 3시 30분에 태어났어요. 남자입니다.",
    },
    {
      history: "",
      newMessage: "저는 김서연이라고 해요. 1988년 음력 2월 10일생이고 새벽 2시에 태어났어요. 여자예요.",
    },
    {
      history: "",
      newMessage: "이준호입니다. 95년 11월 3일생이고 오전 10시 정도에 태어났다고 들었어요.",
    },
    {
      history: "",
      newMessage: "최민지, 여자, 1990년 4월 생일은 20일이고 태어난 시간은 잘 모르겠어요",
    },
  ];

  for (const conversation of testConversations) {
    console.log("\n테스트 대화:", conversation.newMessage);
    console.log("-".repeat(50));

    try {
      const extracted = await extractor.extractInfo(
        conversation.history,
        conversation.newMessage
      );
      console.log("추출된 정보:");
      console.log(JSON.stringify(extracted, null, 2));
    } catch (error) {
      console.error("추출 실패:", error);
    }

    console.log("=".repeat(50));
  }
}

async function main() {
  console.log("환경 변수 체크:");
  console.log(
    "OPENAI_API_KEY:",
    process.env.OPENAI_API_KEY ? "설정됨" : "없음"
  );
  console.log(
    "NEXT_PUBLIC_SUPABASE_URL:",
    process.env.NEXT_PUBLIC_SUPABASE_URL ? "설정됨" : "없음"
  );
  console.log(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY:",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "설정됨" : "없음"
  );
  console.log("\n");

  // 각 테스트 실행
  await testSajuAnalyzer();
  await testInfoExtractor();
}

// 실행
main().catch(console.error);

