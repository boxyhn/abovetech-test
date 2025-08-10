# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a Next.js 15 application using the App Router, TypeScript, and TailwindCSS v4. The project implements a modern chat UI with a centralized theme management system.

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

### Directory Structure
- `src/app/` - Next.js App Router pages and layouts
  - `layout.tsx` - Root layout wrapping all pages
  - `page.tsx` - Homepage component
  - `globals.css` - Global styles with TailwindCSS directives
- `public/` - Static assets served directly

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
Create API routes in `src/app/api/` directory following App Router conventions.

## Key Features Implemented

### Chat UI Components
- **ChatInput**: Auto-resizing textarea with 4-line max height
- **ChatHeader**: Header component with navigation
- **ChatInputButton**: Reusable button component

### Icon System
- Dynamic color and size support
- Components: SendIcon, PlusIcon, ChevronLeftIcon
- Usage: `<SendIcon color={colors.zendiBlue} size={20} />`

### Keyboard Shortcuts
- **Enter**: Send message
- **Shift + Enter**: New line

## Notes
- This is a chat UI demo project
- Theme synchronization is automated in the build process
- Turbopack is used for faster development builds (`--turbopack` flag in dev script)
- All colors should be managed through `theme.ts` for consistency