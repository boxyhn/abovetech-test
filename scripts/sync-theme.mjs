#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// theme.ts 파일 읽기 (간단한 파싱)
const themePath = path.join(__dirname, "../src/config/theme.ts");
const themeContent = fs.readFileSync(themePath, "utf-8");

// colors 객체 추출
const colorsMatch = themeContent.match(/colors:\s*{([^}]+)}/);
if (!colorsMatch) {
  console.error("Could not find colors in theme.ts");
  process.exit(1);
}

// 색상 파싱
const colorsString = colorsMatch[1];
const colorEntries = colorsString.matchAll(/(\w+):\s*"([^"]+)"/g);
const colors = {};

for (const match of colorEntries) {
  colors[match[1]] = match[2];
}

// kebab-case 변환 함수
const toKebabCase = (str) => str.replace(/([A-Z])/g, "-$1").toLowerCase();

// CSS 변수 생성
const cssVars = Object.entries(colors)
  .map(([key, value]) => `  --color-${toKebabCase(key)}: ${value};`)
  .join("\n");

// globals.css 읽기
const globalsPath = path.join(__dirname, "../src/app/globals.css");
let globalsContent = fs.readFileSync(globalsPath, "utf-8");

// @theme inline 섹션 찾아서 교체
const themeRegex = /@theme inline\s*{[^}]*}/;
const newThemeSection = `@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-pretendard);
${cssVars}
}`;

if (themeRegex.test(globalsContent)) {
  globalsContent = globalsContent.replace(themeRegex, newThemeSection);
  fs.writeFileSync(globalsPath, globalsContent);
  console.log("✅ Theme synchronized to globals.css");
} else {
  console.error("Could not find @theme inline section in globals.css");
}
