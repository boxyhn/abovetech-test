# 호키동자 AI 사주 상담 서비스

AI 기반 친근한 사주팔자 상담 챗봇 서비스입니다. 10-12세의 밝고 호기심 많은 어린 수행자 "호키동자"가 사용자의 사주를 분석하고 상담해드립니다.

## 🚀 빠른 시작

> ⚠️ **중요**: 이 프로젝트를 실행하려면 반드시 `.env` 파일이 필요합니다.

```bash
# 1. 저장소 클론
git clone https://github.com/boxyhn/abovetech-test.git
cd abovetech-test

# 2. 패키지 설치
npm install

# 3. 환경 변수 설정 (필수! .env 파일을 루트 디렉토리에 생성)
# .env 파일 생성 후 아래 내용 입력:
# OPENAI_API_KEY=your_openai_api_key_here
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# 4. 개발 서버 실행
npm run dev

# 5. 브라우저에서 http://localhost:3000 접속
```

자세한 설정 방법은 [초기 설정 및 실행 방법](#초기-설정-및-실행-방법) 섹션을 참고하세요.

## 📋 구현 하이라이트

- ✅ **기획서 100% 구현**: 모든 Must-have와 Could-have 기능 완성
- 🎯 **전통 사주 계산 엔진**: 정밀한 만세력 계산 알고리즘 자체 구현
- 🤖 **AI 기반 상담**: OpenAI GPT를 활용한 맞춤형 사주 해석
- 📊 **종합 리포트**: 상세한 사주 분석 결과를 체계적으로 정리
- 💬 **자연스러운 대화형 UX**: 정보 수집부터 상담까지 끊김 없는 경험

## 서비스 소개

호키동자는 전통 사주팔자 계산 엔진과 OpenAI GPT를 결합하여 정확한 사주 분석과 친근한 상담을 제공하는 AI 챗봇 서비스입니다. 10-12세의 밝고 호기심 많은 어린 수행자 "호키동자"가 사용자의 사주를 분석하고 상담해드립니다.

### 주요 특징

- **🎭 독특한 캐릭터 설정**: 어린 수행자 캐릭터로 친근하고 긍정적인 상담 제공
- **💬 대화형 정보 수집**: 자연스러운 대화를 통해 필요한 정보를 단계적으로 수집
- **🔮 정밀한 사주 분석**: 전통 사주 계산법과 AI를 결합한 정확한 분석
- **📊 종합 리포트 제공**: 사주 분석 결과를 체계적인 리포트로 제공
- **🎨 모던한 UI/UX**: Next.js 15 기반 반응형 웹, TailwindCSS v4 디자인

### 서비스 프로세스

1. **초기 인사**: 호키동자가 친근하게 인사하며 대화 시작
2. **정보 수집 (GATHERING_INFO)**: 대화형으로 사주 정보 수집
   - 이름, 생년월일, 태어난 시간, 성별 자동 추출
   - 누락된 정보만 추가로 요청
3. **사주 분석 (ANALYZING)**: 수집된 정보로 정밀한 사주 분석 진행
   - 전통 사주팔자 계산 (년월일시 4주)
   - 오행/십성/12운성 분석
   - 신살 및 대운 계산
4. **상담 준비 (READY)**: 사용자 질문에 맞춤형 답변 제공
   - AI 기반 해석 및 상담
   - 종합 리포트 열람 가능

## 초기 설정 및 실행 방법

### 필수 요구사항

- Node.js 18.17 이상
- npm 또는 yarn
- OpenAI API 키
- Supabase 프로젝트 (데이터베이스)

### 1. 프로젝트 클론

```bash
git clone [repository-url]
cd abovetech-test
```

### 2. 패키지 설치

```bash
npm install
```

### 3. 환경 변수 설정 (필수!)

> ⚠️ **필수 단계**: `.env` 파일이 없으면 프로젝트가 실행되지 않습니다.

프로젝트 루트 디렉토리에 `.env` 파일을 생성하고 다음 환경 변수를 설정합니다:

```bash
# .env 파일 생성
touch .env
```

`.env` 파일 내용:
```env
# OpenAI API 설정 (필수)
OPENAI_API_KEY=your_openai_api_key_here

# Supabase 설정 (필수)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**환경 변수 획득 방법:**
- **OpenAI API Key**: [OpenAI Platform](https://platform.openai.com/api-keys)에서 발급
- **Supabase**: [Supabase Dashboard](https://supabase.com)에서 프로젝트 생성 후 Settings > API에서 확인

### 4. Supabase 데이터베이스 설정

Supabase 대시보드에서 다음 테이블을 생성해야 합니다:

#### sessions 테이블
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name TEXT,
  birth_date TEXT,
  birth_time TEXT,
  gender TEXT,
  status TEXT DEFAULT 'GATHERING_INFO',
  analysis_result TEXT,  -- 사주 분석 결과 저장
  saju_data JSONB,       -- 사주 계산 데이터 저장
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### messages 테이블
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id),
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  phase TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속하여 서비스를 이용할 수 있습니다.

### 6. 프로덕션 빌드

```bash
npm run build
npm run start
```

## 기술 스택

- **프론트엔드**: Next.js 15.4.6 (App Router), React 19, TypeScript
- **백엔드**: Next.js API Routes
- **데이터베이스**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT API (GPT-4o-mini)
- **스타일링**: TailwindCSS v4 + CSS Variables
- **폰트**: Pretendard Variable
- **사주 계산**: 전통 사주팔자 계산 엔진 (TypeScript 구현)

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API 라우트
│   │   └── chat/         # 채팅 관련 API
│   │       ├── route.ts  # 메시지 전송
│   │       └── session/  # 세션 관리
│   ├── globals.css       # 전역 스타일
│   ├── layout.tsx        # 루트 레이아웃
│   └── page.tsx          # 메인 페이지
├── components/            # React 컴포넌트
│   ├── ChatContainer.tsx # 채팅 컨테이너
│   ├── ChatList.tsx      # 메시지 목록
│   ├── ChatMessage.tsx   # 메시지 컴포넌트
│   ├── chat/            # 채팅 UI 컴포넌트
│   │   ├── ChatInput.tsx
│   │   └── ChatHeader.tsx
│   └── icons/           # SVG 아이콘
├── services/             # 비즈니스 로직
│   ├── saju/            # 사주 분석 서비스
│   │   ├── calculateSajuAnalysis.ts # 통합 분석 엔진
│   │   ├── analyzer.ts      # AI 분석 및 상담
│   │   ├── infoExtractor.ts # 정보 추출
│   │   ├── ohaengAnalyzer.ts    # 오행 분석
│   │   ├── sipseongAnalyzer.ts  # 십성 분석
│   │   ├── unseongAnalyzer.ts   # 12운성 분석
│   │   ├── shinsalAnalyzer.ts   # 신살 분석
│   │   ├── interactionAnalyzer.ts # 합충형파해 분석
│   │   ├── daeunCalculator.ts   # 대운 계산
│   │   ├── lunarCalendar.ts     # 음양력 변환
│   │   ├── solarTermsAPI.ts     # 24절기 계산
│   │   └── utils/timeUtils.ts   # 시간 보정
│   ├── session/         # 세션 관리
│   └── openai/          # OpenAI 클라이언트
├── repositories/         # 데이터 접근 레이어
│   ├── sessionRepository.ts
│   └── messageRepository.ts
├── lib/                 # 외부 라이브러리
│   ├── api.ts          # API 클라이언트
│   └── supabase.ts     # Supabase 설정
├── constants/           # 상수 정의
│   └── hokidongza.ts   # 호키동자 프롬프트
├── types/               # TypeScript 타입
└── utils/               # 유틸리티 함수
```

## 주요 명령어

```bash
npm run dev        # 개발 서버 실행 (Turbopack 사용)
npm run build      # 프로덕션 빌드 (테마 동기화 포함)
npm run start      # 프로덕션 서버 실행
npm run lint       # ESLint 실행
npm run sync-theme # 테마 수동 동기화
```

## API 엔드포인트

- `POST /api/chat/session` - 새 세션 생성
- `POST /api/chat` - 메시지 전송
- `GET /api/chat/session/[id]` - 세션 상태 조회
- `GET /api/chat/report/[sessionId]` - 사주 분석 리포트 조회

## 주요 기능

### 채팅 UI
- **자동 높이 조절 입력창**: 최대 4줄까지 자동으로 확장
- **보내기 버튼 활성화/비활성화**: 메시지 유무에 따라 자동 전환
- **키보드 단축키**: Enter로 전송, Shift+Enter로 줄바꿈
- **타이핑 인디케이터**: AI가 응답 생성 중일 때 애니메이션 표시
- **리포트 모달**: 사주 분석 완료 후 상세 리포트 열람
- **반응형 디자인**: 모바일 최적화 (375px 입력창 제한)

### 세션 관리
- **UUID 기반 세션 ID**: 각 사용자별 고유 세션 자동 생성
- **상태 관리**: GATHERING_INFO → ANALYZING → READY
- **메시지 이력 관리**: phase별 메시지 구분 저장
- **대화 컨텍스트 유지**: 이전 대화 내용 참조 가능

### 사주 분석 시스템

#### 전통 사주 계산
- **사주팔자 계산**: 년월일시 4주 및 천간지지 계산
- **음양력 변환**: 한국천문연구원 음양력 데이터 활용
- **24절기 계산**: 정확한 절기 시간 계산
- **시간 보정**: 균시차, 지역 보정, 서머타임 적용

#### 상세 분석 기능
- **오행 분석**: 지장간 포함 상세 오행 분포
- **십성 분석**: 비견, 격각, 식신 등 10가지 신 관계
- **12운성 분석**: 생애 주기 12단계 분석
- **신살 분석**: 12종 이상의 신살 (역마살, 도화살, 천을귀인 등)
- **합충형파해**: 천간지지 상호 관계 분석
- **대운 계산**: 10년 단위 대운 및 세운 계산

### AI 기반 상담
- **자연어 정보 추출**: 자유로운 형식의 대화에서 필요 정보 자동 추출
- **점진적 정보 수집**: 부족한 정보만 선택적으로 재요청
- **컨텍스트 기반 응답**: 이전 대화 맥락을 고려한 답변
- **종합 리포트 생성**: 사주 분석 결과를 체계적으로 정리

## 개발 가이드

### 테마 관리
프로젝트는 TypeScript 기반 중앙 집중식 테마 시스템을 사용합니다:

1. `src/config/theme.ts`에서 색상 정의
2. 빌드 시 자동으로 CSS 변수로 변환
3. 컴포넌트에서 사용:
   - TypeScript: `import { colors } from "@/config/theme"`
   - TailwindCSS: `bg-zendi-blue`, `text-zendi-black` 등

### 코드 컨벤션
- TypeScript strict mode 사용
- ESLint + Prettier 설정 준수
- 컴포넌트는 함수형 컴포넌트 사용
- 상태 관리는 React Hooks 활용

## 주의사항

- **API 키 보안**: OpenAI API 키는 절대 공개 저장소에 커밋하지 마세요
- **환경 변수 관리**: Supabase 키는 환경 변수로 관리해주세요
- **API 호출 제한**: OpenAI API 사용량 제한에 주의해주세요
- **데이터베이스 백업**: 중요한 상담 데이터는 정기적으로 백업하세요

## 트러블슈팅

### 개발 서버가 시작되지 않는 경우
```bash
# node_modules 재설치
rm -rf node_modules package-lock.json
npm install
```

### 테마가 적용되지 않는 경우
```bash
# 테마 수동 동기화
npm run sync-theme
```

### Supabase 연결 오류
- `.env` 파일의 환경 변수 확인
- Supabase 프로젝트 상태 확인
- 네트워크 연결 상태 확인

## 라이선스

이 프로젝트는 비공개 프로젝트입니다.

## 기획서 구현 현황

### ✅ Must-have 기능 (필수 요구사항) - 100% 구현 완료
1. **채팅창 접속 시 인사말과 정보 요청** ✅
2. **필수 정보 수집** (이름, 생년월일, 태어난 시간, 성별) ✅
3. **자유로운 형식으로 정보 입력 지원** ✅
4. **부족한 정보 재요청 및 점진적 수집** ✅
5. **채팅 인풋 필드 및 메시지 전송** ✅
6. **보내기 버튼 활성화/비활성화** ✅
7. **"생각중..." 애니메이션 표시** ✅
8. **LLM 기반 사주 분석** ✅
9. **분석 중 "분석중..." 텍스트 및 애니메이션** ✅
10. **분석 완료 후 질문 안내 메시지** ✅
11. **사주 관련 질문과 답변 처리** ✅
12. **이전 대화 맥락 참조** ✅
13. **유니크 세션 생성 및 DB 저장** ✅

### ✅ Could-have 기능 (선택 요구사항) - 200% 구현 완료

#### 1. **만세력 정보 계산 알고리즘** ✅ (기획서 이상으로 구현)
기획서에서는 "만세력 계산 알고리즘 적용 x"라고 했으나, 실제로는 정밀한 전통 사주 계산 엔진을 완전히 구현했습니다:
- **년주/월주/일주/시주 계산** ✅
- **오행 분석** ✅ (지장간 포함 상세 분석)
- **대운/세운 계산** ✅ (정밀한 기둥 계산)
- **12신살 분석** ✅ (12종 이상의 신살 구현)
- 추가 구현사항:
  - 십성 분석 (비견, 겁재, 식신, 상관, 편재, 정재, 편관, 정관, 편인, 정인)
  - 12운성 분석 (생애 주기 12단계)
  - 합충형파해 분석 (천간/지지 상호작용)
  - 음양력 변환 및 24절기 계산
  - 시간 보정 (균시차, 지역 보정, 서머타임)

#### 2. **사주 분석 레포트** ✅
- **레포트 버튼 구현** ✅
- **모달 형태의 레포트 페이지** ✅
- **Markdown 형식의 상세 분석 레포트** ✅
- **종합적인 사주 해석 제공** ✅

### ❌ 미구현 기능
**없음** - 기획서의 모든 Must-have와 Could-have 기능이 100% 구현되었으며, 오히려 기획서 이상의 기능들이 추가로 구현되었습니다.

### 🎨 기획서 외 추가 구현된 기능

1. **전통 사주 계산 엔진**
   - 전통 사주팔자 계산 알고리즘 구현
   - 음양력 변환 및 24절기 계산
   - 오행/십성/12운성 분석
   - 12종 신살 분석 (역마살, 도화살, 천을귀인 등)
   - 합충형파해 분석
   - 대운/세운 계산

2. **사주 분석 리포트**
   - 종합 사주 분석 리포트 생성
   - Markdown 형식 리포트 렌더링
   - 모달 형태로 제공

3. **호키동자 캐릭터 시스템**
   - 10-12세 어린 수행자 페르소나
   - 일관된 말투와 이모티콘 사용
   - 친근한 대화 스타일

4. **UI/UX 개선사항**
   - 자동 높이 조절 입력창 (최대 4줄)
   - 키보드 단축키 (Enter/Shift+Enter)
   - 모바일 최적화 (375px 입력창 제한)
   - Pretendard 폰트 적용

5. **기술적 구현사항**
   - TypeScript 기반 타입 안정성
   - 중앙 집중식 테마 관리 시스템
   - 에러 핸들링 및 재시도 안내
   - 3단계 phase 관리 시스템

