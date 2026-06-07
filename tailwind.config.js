/** @type {import('tailwindcss').Config} */
// ============================================================
//  Design System — Coursera 구조 기반 + 커스텀 브랜드 컬러
//  원본에서 가져온 것: 여백 스케일, 타이포 스케일, 패딩 규칙,
//                      elevation 철학 (그림자 없음, 보더로 깊이 표현)
//  완전 교체한 것:     컬러 팔레트 (→ #3A4BFF 브랜드 시스템),
//                      폰트 패밀리 (→ Pretendard)
// ============================================================

module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx,mdx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx,mdx}",
  ],

  theme: {
    extend: {

      // ──────────────────────────────────────────
      // 🎨 COLOR PALETTE
      // Source: 완전 교체 — #3A4BFF 브랜드 기반 생성
      // Coursera 원본 컬러(#0056d2, #0f1114 등)는 사용하지 않음
      // ──────────────────────────────────────────
      colors: {
        // Primary — 브랜드 메인
        primary: {
          50:  "#eceeff",
          100: "#d0d4ff",
          200: "#a8afff",
          300: "#7a85ff",
          400: "#5562ff",
          500: "#3A4BFF", // ★ 브랜드 메인
          600: "#2535e0",
          700: "#1a28c2",
          800: "#111da0",
          900: "#0b1480",
          950: "#060b5a",
        },

        // Secondary — 보조 (따뜻한 대비)
        secondary: {
          50:  "#fff4ed",
          100: "#ffe5d0",
          200: "#ffc8a0",
          300: "#ffa36a",
          400: "#ff7a38",
          500: "#FF5C10", // 보조 메인
          600: "#e84600",
          700: "#c03600",
          800: "#962b00",
          900: "#702200",
          950: "#3d1100",
        },

        // Neutral — 텍스트, 보더, 배경
        neutral: {
          0:   "#ffffff",
          50:  "#f5f7ff", // 앱 배경
          100: "#eaedfa",
          200: "#d4d9f5",
          300: "#b0b8e8",
          400: "#8891d4",
          500: "#6470bf",
          600: "#4a55a8",
          700: "#363f8a",
          800: "#252d6e",
          900: "#161d55",
          950: "#0c1140",
          1000: "#06091f", // 최고 어두운 텍스트
        },

        // Semantic
        success: {
          light: "#e6f9f0",
          DEFAULT: "#18b96a",
          dark: "#0d7a46",
        },
        warning: {
          light: "#fff8e1",
          DEFAULT: "#f5b800",
          dark: "#a37a00",
        },
        error: {
          light: "#ffeaea",
          DEFAULT: "#f03e3e",
          dark: "#b91c1c",
        },
        info: {
          light: "#eceeff",
          DEFAULT: "#3A4BFF",
          dark: "#1a28c2",
        },
      },

      // ──────────────────────────────────────────
      // 🔤 TYPOGRAPHY
      // Source: 완전 교체 — Pretendard (한국어 최적화)
      // Coursera 원본 Source Sans Pro 제거
      // 스케일 범위(14px–16px)는 원본 구조 참고하되 확장
      // ──────────────────────────────────────────
      fontFamily: {
        sans: [
          "Pretendard",
          "Pretendard Variable",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "Fira Code",
          "ui-monospace",
          "monospace",
        ],
      },

      fontSize: {
        // Coursera 원본 14–16px 범위를 뼈대로, 실용적 스케일로 확장
        "2xs": ["11px", { lineHeight: "16px", letterSpacing: "0.02em" }],
        "xs":  ["12px", { lineHeight: "18px", letterSpacing: "0.01em" }],
        "sm":  ["14px", { lineHeight: "20px", letterSpacing: "0"      }], // 원본 하한
        "base":["15px", { lineHeight: "22px", letterSpacing: "0"      }],
        "md":  ["16px", { lineHeight: "24px", letterSpacing: "0"      }], // 원본 상한
        "lg":  ["18px", { lineHeight: "28px", letterSpacing: "-0.01em"}],
        "xl":  ["20px", { lineHeight: "30px", letterSpacing: "-0.01em"}],
        "2xl": ["24px", { lineHeight: "34px", letterSpacing: "-0.02em"}],
        "3xl": ["30px", { lineHeight: "40px", letterSpacing: "-0.02em"}],
        "4xl": ["36px", { lineHeight: "46px", letterSpacing: "-0.03em"}],
        "5xl": ["48px", { lineHeight: "58px", letterSpacing: "-0.03em"}],
        "6xl": ["60px", { lineHeight: "70px", letterSpacing: "-0.04em"}],
      },

      fontWeight: {
        // Coursera 원본: regular(400) ~ semi-bold(600)만 사용
        // 동일 범위 유지, 명시적 레이블 추가
        normal:    "400", // 원본 regular
        medium:    "500",
        semibold:  "600", // 원본 semi-bold (상한)
        bold:      "700", // 확장 (헤딩용)
        extrabold: "800",
      },

      // ──────────────────────────────────────────
      // 📐 SPACING & PADDING
      // Source: Coursera 4px 베이스 그리드 구조 참고
      // "Do maintain consistent spacing using the base grid"
      // ──────────────────────────────────────────
      spacing: {
        // 4px 베이스 그리드 — 모든 값이 4의 배수
        "0":    "0px",
        "px":   "1px",
        "0.5":  "2px",
        "1":    "4px",   // 1 unit
        "1.5":  "6px",
        "2":    "8px",   // 2 units
        "2.5":  "10px",
        "3":    "12px",  // 3 units
        "3.5":  "14px",
        "4":    "16px",  // 4 units — 기본 패딩
        "5":    "20px",
        "6":    "24px",  // 컴포넌트 내부 패딩 기준
        "7":    "28px",
        "8":    "32px",  // 섹션 간격 기준
        "9":    "36px",
        "10":   "40px",
        "11":   "44px",
        "12":   "48px",
        "14":   "56px",
        "16":   "64px",
        "18":   "72px",
        "20":   "80px",
        "24":   "96px",
        "28":   "112px",
        "32":   "128px",
        "36":   "144px",
        "40":   "160px",
        "48":   "192px",
        "56":   "224px",
        "64":   "256px",
        "72":   "288px",
        "80":   "320px",
        "96":   "384px",
      },

      // ──────────────────────────────────────────
      // 🔲 BORDER RADIUS
      // Source: Coursera "Don't mix rounded and sharp corners"
      // → 일관된 라운드 시스템 적용
      // ──────────────────────────────────────────
      borderRadius: {
        "none": "0px",
        "xs":   "2px",
        "sm":   "4px",
        "DEFAULT": "6px",
        "md":   "8px",
        "lg":   "12px",
        "xl":   "16px",
        "2xl":  "20px",
        "3xl":  "24px",
        "full": "9999px",
      },

      // ──────────────────────────────────────────
      // 🪞 BOX SHADOW (ELEVATION)
      // Source: Coursera "This design uses no shadows.
      //         Depth is conveyed through border contrast
      //         and surface color variation."
      // → 그림자 최소화, 보더로 깊이 표현
      // ──────────────────────────────────────────
      boxShadow: {
        "none":    "none",
        // 보더 기반 elevation (그림자 대신)
        "border":  "0 0 0 1px rgb(52 63 255 / 0.12)",
        "border-md": "0 0 0 1.5px rgb(52 63 255 / 0.20)",
        "border-strong": "0 0 0 2px rgb(52 63 255 / 0.35)",
        // 필요 최소 그림자 (모달, 드롭다운 등 부상 요소에만)
        "float":   "0 4px 16px -2px rgb(10 16 60 / 0.10), 0 2px 6px -1px rgb(10 16 60 / 0.06)",
        "overlay": "0 12px 40px -4px rgb(10 16 60 / 0.16), 0 4px 16px -2px rgb(10 16 60 / 0.10)",
      },

      // ──────────────────────────────────────────
      // 🖼️ BORDER
      // Source: Coursera "Depth is conveyed through border contrast"
      // ──────────────────────────────────────────
      borderColor: {
        DEFAULT:  "#d4d9f5", // neutral-200
        subtle:   "#eaedfa", // neutral-100
        strong:   "#b0b8e8", // neutral-300
        brand:    "#3A4BFF", // primary-500
        "brand-subtle": "#a8afff", // primary-200
      },

      borderWidth: {
        DEFAULT: "1px",
        "0": "0px",
        "2": "2px",
        "4": "4px",
      },

      // ──────────────────────────────────────────
      // 📏 LINE HEIGHT
      // ──────────────────────────────────────────
      lineHeight: {
        tight:   "1.2",
        snug:    "1.375",
        normal:  "1.5",
        relaxed: "1.625",
        loose:   "1.75",
      },

      // ──────────────────────────────────────────
      // 🔢 Z-INDEX
      // ──────────────────────────────────────────
      zIndex: {
        "base":    "0",
        "raised":  "10",
        "dropdown":"100",
        "sticky":  "200",
        "overlay": "300",
        "modal":   "400",
        "toast":   "500",
        "tooltip": "600",
      },

      // ──────────────────────────────────────────
      // 🖥️ BREAKPOINTS
      // ──────────────────────────────────────────
      screens: {
        "xs":  "375px",
        "sm":  "640px",
        "md":  "768px",
        "lg":  "1024px",
        "xl":  "1280px",
        "2xl": "1440px",
        "3xl": "1920px",
      },
    },
  },

  plugins: [],
};
