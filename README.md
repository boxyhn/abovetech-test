# 호키동자 AI 사주 상담 서비스

AI 기반 친근한 사주팔자 상담 챗봇 서비스입니다. 10-12세의 밝고 호기심 많은 어린 수행자 "호키동자"가 사용자의 사주를 분석하고 상담해드립니다.

## 서비스 소개

호키동자는 OpenAI GPT를 활용하여 사용자의 생년월일, 태어난 시간, 성별 정보를 바탕으로 사주팔자를 분석하고 개인 맞춤형 운세 상담을 제공하는 AI 챗봇 서비스입니다.

### 주요 특징

- **🎭 독특한 캐릭터 설정**: 어린 수행자 캐릭터로 친근하고 긍정적인 상담 제공
- **💬 대화형 정보 수집**: 자연스러운 대화를 통해 필요한 정보를 단계적으로 수집
- **🔮 AI 기반 사주 분석**: OpenAI GPT를 활용한 깊이 있는 사주 분석
- **🎨 모던한 UI/UX**: Next.js 15 기반 반응형 웹, TailwindCSS v4 디자인

### 서비스 프로세스

1. **초기 인사**: 호키동자가 친근하게 인사하며 대화 시작
2. **정보 수집 (GATHERING_INFO)**: 대화형으로 사주 정보 수집
   - 이름, 생년월일, 태어난 시간, 성별 자동 추출
   - 누락된 정보만 추가로 요청
3. **사주 분석 (ANALYZING)**: 수집된 정보로 AI가 사주 분석 진행
4. **상담 준비 (READY)**: 사용자 질문에 맞춤형 답변 제공

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

### 3. 환경 변수 설정

`.env` 파일을 프로젝트 루트에 생성하고 다음 환경 변수를 설정합니다:

```env
# OpenAI API 설정
OPENAI_API_KEY=your_openai_api_key_here

# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

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
│   │   ├── analyzer.ts  # 사주 분석 로직
│   │   └── infoExtractor.ts # 정보 추출
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

## 주요 기능

### 채팅 UI
- **자동 높이 조절 입력창**: 최대 4줄까지 자동으로 확장
- **보내기 버튼 활성화/비활성화**: 메시지 유무에 따라 자동 전환
- **키보드 단축키**: Enter로 전송, Shift+Enter로 줄바꿈
- **타이핑 인디케이터**: AI가 응답 생성 중일 때 애니메이션 표시
  - "생각하고 있어요" (일반 응답 대기)
  - "열심히 분석하고 있어요" (사주 분석 중)
- **실시간 상태 표시**: 정보 수집, 분석 중, 준비 완료 상태 구분

### 세션 관리
- **UUID 기반 세션 ID**: 각 사용자별 고유 세션 자동 생성
- **상태 관리**: GATHERING_INFO → ANALYZING → READY
- **메시지 이력 관리**: phase별 메시지 구분 저장
- **대화 컨텍스트 유지**: 이전 대화 내용 참조 가능

### AI 분석
- **자연어 정보 추출**: 자유로운 형식의 대화에서 필요 정보 자동 추출
  - 이름, 생년월일, 태어난 시간, 성별
- **점진적 정보 수집**: 부족한 정보만 선택적으로 재요청
- **백그라운드 분석**: 정보 수집 완료 후 비동기 사주 분석
- **컨텍스트 기반 응답**: 이전 대화 맥락을 고려한 답변

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

### ✅ 완전히 구현된 기능 (기획서 요구사항)
1. **채팅창 접속 시 인사말과 정보 요청**
2. **자유로운 형식으로 정보 입력 지원**
3. **부족한 정보 재요청 및 점진적 수집**
4. **분석 중 "분석중..." 텍스트 및 애니메이션**
5. **분석 완료 후 질문 안내 메시지**
6. **사주 관련 질문과 답변 처리**
7. **이전 대화 맥락 참조**
8. **필수 정보 수집** (이름, 생년월일, 태어난 시간, 성별)
9. **채팅 인풋 필드 및 메시지 전송**
10. **보내기 버튼 활성화/비활성화**
11. **"생각중..." 애니메이션 표시**
12. **유니크 세션 생성 (UUID)**
13. **대화내역 DB 저장**

### 🎨 기획서 외 추가 구현된 기능
1. **호키동자 캐릭터 시스템**
   - 10-12세 어린 수행자 페르소나
   - 일관된 말투와 이모티콘 사용
   - 친근한 대화 스타일

2. **UI/UX 개선사항**
   - 자동 높이 조절 입력창 (최대 4줄)
   - 키보드 단축키 (Enter/Shift+Enter)
   - 모바일 최적화 반응형 디자인
   - 다크모드 지원 (시스템 설정 연동)
   - Pretendard 폰트 적용

3. **기술적 구현사항**
   - TypeScript 기반 타입 안정성
   - 중앙 집중식 테마 관리 시스템
   - 에러 핸들링 및 재시도 안내
   - 3단계 phase 관리 시스템

4. **추가 UI 요소** (기능 미완성)
   - 코인 표시 (24,500 고정값)
   - 신고 버튼 (처리 로직 미구현)
   - 뒤로가기 버튼 (핸들러 미구현)

