# Chat UI Demo

Next.js 기반의 모던한 채팅 UI 데모 애플리케이션입니다.

## 🚀 빠른 시작

### 필수 요구사항

- Node.js 18.17 이상
- npm 또는 yarn

### 설치 및 실행

1. **의존성 설치**
```bash
npm install
```

2. **개발 서버 실행**
```bash
npm run dev
```

3. **브라우저에서 확인**
```
http://localhost:3000
```

애플리케이션이 성공적으로 실행되면 채팅 UI 데모를 확인할 수 있습니다.

## 🎨 테마 동기화 시스템

이 프로젝트는 TypeScript 기반의 중앙화된 색상 관리 시스템을 사용합니다.

### 작동 방식

1. **색상 정의**: `src/config/theme.ts`에서 모든 색상을 TypeScript 상수로 관리
2. **자동 동기화**: `sync-theme` 스크립트가 TypeScript 색상을 CSS 변수로 자동 변환
3. **빌드 통합**: 프로덕션 빌드 시 자동으로 테마 동기화 실행

### 테마 수정 방법

1. **색상 추가/수정**
```typescript
// src/config/theme.ts
export const theme = {
  colors: {
    zendiBlue: "#5791FF",
    zendiBlack: "#161741",
    // 새 색상 추가
    yourNewColor: "#FF5733",
  }
}
```

2. **동기화 실행**
```bash
# 수동 동기화
npm run sync-theme

# 빌드 시 자동 동기화
npm run build
```

3. **사용**
```tsx
// TypeScript에서
import { colors } from "@/config/theme";
<Icon color={colors.yourNewColor} />

// CSS 클래스로
<div className="bg-your-new-color text-your-new-color" />
```

### sync-theme 스크립트 세부사항

- **위치**: `scripts/sync-theme.mjs`
- **기능**: 
  - theme.ts 파일 파싱
  - camelCase를 kebab-case로 변환
  - globals.css의 @theme 섹션 자동 업데이트
- **실행 시점**:
  - `npm run sync-theme` 수동 실행
  - `npm run build` 시 자동 실행

## 🛠 기술 스택

- **Framework**: Next.js 15.4.6 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: TailwindCSS v4
- **Font**: Pretendard Variable

## 📂 프로젝트 구조

```
src/
├── app/                # Next.js App Router
│   ├── globals.css    # 전역 스타일 및 테마 변수
│   ├── layout.tsx     # 루트 레이아웃
│   └── page.tsx       # 메인 페이지
├── components/        
│   ├── chat/          # 채팅 UI 컴포넌트
│   │   ├── ChatInput.tsx
│   │   ├── ChatHeader.tsx
│   │   └── ChatInputButton.tsx
│   └── icons/         # SVG 아이콘 컴포넌트
└── config/
    └── theme.ts       # 중앙화된 색상 테마 설정
```

## 🔧 사용 가능한 스크립트

```bash
npm run dev        # 개발 서버 실행 (Turbopack 사용)
npm run build      # 프로덕션 빌드 (테마 동기화 포함)
npm run start      # 프로덕션 서버 실행
npm run lint       # ESLint 실행
npm run sync-theme # 테마 수동 동기화
```

## 📝 주요 기능

- **자동 높이 조절 입력창**: 최대 4줄까지 자동으로 확장
- **키보드 단축키**: Enter로 전송, Shift+Enter로 줄바꿈
- **동적 아이콘 시스템**: 색상과 크기 동적 변경 가능
- **반응형 디자인**: 모바일 최적화된 UI

## 🤝 개발 가이드

더 자세한 개발 가이드는 [CLAUDE.md](./CLAUDE.md) 파일을 참고하세요.
