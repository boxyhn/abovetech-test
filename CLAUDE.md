# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a Next.js 15 application using the App Router, TypeScript, and TailwindCSS v4. The project uses Turbopack for fast development builds.

## Essential Commands

### Development
```bash
npm run dev        # Start development server with Turbopack on http://localhost:3000
npm run build      # Build production bundle
npm run start      # Start production server
npm run lint       # Run ESLint checks
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
Use TailwindCSS utility classes. The project includes Geist fonts (sans and mono) and a predefined color scheme with CSS variables supporting light/dark modes.

### API Routes
Create API routes in `src/app/api/` directory following App Router conventions.

## Notes
- This is a fresh Next.js project created with create-next-app
- No testing framework is currently configured
- Turbopack is used for faster development builds (`--turbopack` flag in dev script)