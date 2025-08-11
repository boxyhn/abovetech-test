# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
호키동자 AI 사주 상담 서비스 - AI 기반 친근한 사주팔자 상담 챗봇 서비스입니다. Next.js 15 App Router, TypeScript, TailwindCSS v4를 사용하며, OpenAI GPT API와 Supabase를 통해 사주 분석 및 상담 기능을 제공합니다.

## Essential Commands

### Development
```bash
npm run dev        # Start development server with Turbopack on http://localhost:3000
npm run build      # Build production bundle (includes theme sync)
npm run start      # Start production server
npm run lint       # Run ESLint checks
npm run sync-theme # Manually sync theme from TypeScript to CSS
```

### Type Checking
Type checking is integrated into the build process. Run `npm run build` to check types.

## Architecture

### Tech Stack
- **Framework**: Next.js 15.4.6 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: TailwindCSS v4 with PostCSS
- **React**: Version 19.1.0
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT API (GPT-4o-mini)
- **State Management**: React Hooks (useState, useEffect)

### Directory Structure
- `src/app/` - Next.js App Router pages and layouts
  - `api/chat/` - Chat API routes (message handling, session management)
  - `layout.tsx` - Root layout wrapping all pages
  - `page.tsx` - Homepage component
  - `globals.css` - Global styles with TailwindCSS directives
- `src/components/` - React components
  - `ChatContainer.tsx` - Main chat container with state management
  - `ChatList.tsx` - Message list display
  - `chat/` - Chat UI components
- `src/services/` - Business logic layer
  - `saju/` - Saju analysis services (analyzer, infoExtractor)
  - `session/` - Session management service
  - `openai/` - OpenAI API client
- `src/repositories/` - Data access layer (Supabase)
- `src/lib/` - External library configurations
- `public/` - Static assets (images, icons, fonts)

### Key Configuration
- **TypeScript**: Strict mode enabled, path alias `@/*` maps to `src/*`
- **TailwindCSS**: Version 4 with CSS variables for theming, dark mode support via `prefers-color-scheme`
- **ESLint**: Next.js recommended rules with Core Web Vitals

## Development Guidelines

### Adding New Pages
Create files in `src/app/` following Next.js App Router conventions:
- `src/app/about/page.tsx` for `/about` route
- `src/app/products/[id]/page.tsx` for dynamic routes

### Component Organization
Place shared components in `src/components/` (create if needed). Use the `@/` import alias for clean imports.

### Styling Approach
Use TailwindCSS utility classes. The project includes Pretendard font and a centralized color theme system managed through `src/config/theme.ts`.

### Theme Management System
The project uses a TypeScript-first approach for theme management:

1. **Define colors in TypeScript** (`src/config/theme.ts`)
2. **Run sync-theme** to generate CSS variables
3. **Use in components**:
   - TypeScript: `import { colors } from "@/config/theme"`
   - CSS Classes: `bg-zendi-blue`, `text-zendi-black`, etc.

**Important**: After modifying `theme.ts`, always run `npm run sync-theme` or it will be automatically synced during build.

### API Routes
API routes are implemented in `src/app/api/` directory:
- `POST /api/chat/session` - Create new chat session
- `POST /api/chat` - Send message and get response
- `GET /api/chat/session/[id]` - Get session status

## Key Features Implemented

### Hokidongja Character System
- **Character Persona**: 10-12 year old friendly young practitioner
- **Speaking Style**: Uses "~해요", "~예요" endings, addresses users as "선생님"
- **Emotion Expression**: Uses appropriate emojis and exclamations
- **System Prompts**: Defined in `src/constants/hokidongza.ts`

### Chat Flow Management
- **3-Phase Process**:
  1. `GATHERING_INFO`: Collect user information through conversation
  2. `ANALYZING`: Perform saju analysis in background
  3. `READY`: Answer questions based on analysis
- **Session State Management**: UUID-based sessions with status tracking
- **Message Phase Tracking**: Each message tagged with current phase

### Information Extraction
- **Smart Parsing**: Automatically extracts name, birth date, time, gender from conversation
- **Progressive Collection**: Only asks for missing information
- **Validation**: Checks completeness before proceeding to analysis

### Chat UI Components
- **ChatContainer**: Main container with session and state management
- **ChatList**: Message list with typing indicator support
- **ChatInput**: Auto-resizing textarea with 4-line max height
- **ChatHeader**: Header with coin display and navigation
- **TypingIndicator**: Shows when AI is thinking/analyzing

### Backend Services
- **ChatService**: Orchestrates message processing and state transitions
- **InfoExtractorService**: Extracts user information from conversation
- **SajuAnalyzerService**: Performs saju analysis and generates responses
- **OpenAI Integration**: Structured API calls with proper error handling

### Database Layer
- **Session Repository**: Manages chat sessions
- **Message Repository**: Stores conversation history with phase tracking
- **Supabase Client**: Configured connection to PostgreSQL

### Icon System
- Dynamic color and size support
- Components: SendIcon, PlusIcon, ChevronLeftIcon, Report/Coin icons
- Usage: `<SendIcon color={colors.zendiBlue} size={20} />`

### Keyboard Shortcuts
- **Enter**: Send message
- **Shift + Enter**: New line

## Important Implementation Details

### Session Lifecycle
1. User opens chat → Create new session with UUID
2. Initial greeting from Hokidongja
3. Collect user information through natural conversation
4. Trigger background analysis when all info collected
5. Allow Q&A once analysis complete

### Error Handling
- API routes wrapped with `apiHandler` for consistent error responses
- Friendly error messages from Hokidongja character
- Automatic retry suggestions on failures

### Performance Optimizations
- Turbopack for faster development builds
- Message pagination/limiting in repositories
- Background analysis to avoid blocking chat
- Phase-based message filtering for context

### Security Considerations
- Environment variables for sensitive keys
- Supabase Row Level Security ready
- Input validation and sanitization
- Session-based access control

## Notes
- OpenAI API key required for saju analysis features
- Supabase project required for data persistence
- Theme synchronization automated in build process
- All colors managed through `theme.ts` for consistency
- Character personality defined in `constants/hokidongza.ts`