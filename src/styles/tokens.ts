/**
 * 2026 부산교구 젊은이의 날 (BYD) 디자인 시스템 토큰 (TSD)
 * 피그마 및 목업 기반의 색상, 타이포그래피, 간격, 컴포넌트 스타일 상수
 */

export const colors = {
  // Brand Primary & Secondary
  primary: {
    DEFAULT: "#2563EB", // Vibrant Catholic Blue
    light: "#60A5FA",
    dark: "#1D4ED8",
    subtle: "#EFF6FF",
  },
  secondary: {
    DEFAULT: "#F59E0B", // Warm Warmth Gold/Amber
    light: "#FCD34D",
    dark: "#D97706",
    subtle: "#FEF3C7",
  },
  accent: {
    green: "#10B981", // Hope / Green
    red: "#EF4444",   // Love / Martyr Red
    purple: "#8B5CF6",// Dignity / Advent Purple
  },
  // 4대 테마존 컬러 (행사장 존)
  zones: {
    faith: {
      name: "믿음 (Faith)",
      color: "#3B82F6", // Blue
      bg: "#EFF6FF",
      border: "#BFDBFE",
    },
    sharing: {
      name: "나눔 (Sharing)",
      color: "#10B981", // Emerald
      bg: "#ECFDF5",
      border: "#A7F3D0",
    },
    hope: {
      name: "희망 (Hope)",
      color: "#F59E0B", // Amber
      bg: "#FFFBEB",
      border: "#FDE68A",
    },
    love: {
      name: "사랑 (Love)",
      color: "#EC4899", // Pink / Rose
      bg: "#FDF2F8",
      border: "#FBCFE8",
    },
  },
  // 배경 및 텍스트
  surface: {
    background: "#F8FAFC",
    card: "#FFFFFF",
    modal: "#FFFFFF",
    glass: "rgba(255, 255, 255, 0.85)",
  },
  text: {
    primary: "#0F172A",
    secondary: "#475569",
    muted: "#94A3B8",
    inverted: "#FFFFFF",
  },
} as const;

export const typography = {
  fontFamily: "Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif",
  heading1: "text-2xl font-bold tracking-tight",
  heading2: "text-xl font-bold tracking-tight",
  heading3: "text-lg font-semibold",
  body: "text-base font-normal leading-relaxed",
  bodySmall: "text-sm font-normal text-slate-600",
  caption: "text-xs font-normal text-slate-400",
} as const;

export const borderRadius = {
  sm: "0.375rem",  // 6px
  md: "0.5rem",    // 8px
  lg: "0.75rem",   // 12px
  xl: "1rem",      // 16px
  "2xl": "1.5rem", // 24px
  full: "9999px",
} as const;

export const shadows = {
  card: "0 2px 8px -2px rgba(0, 0, 0, 0.05), 0 1px 4px -1px rgba(0, 0, 0, 0.03)",
  elevated: "0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
  glass: "0 8px 32px 0 rgba(31, 38, 135, 0.07)",
} as const;
