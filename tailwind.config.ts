import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        byd: {
          blue: {
            DEFAULT: "#2563EB",
            light: "#60A5FA",
            dark: "#1D4ED8",
            subtle: "#EFF6FF",
          },
          gold: {
            DEFAULT: "#F59E0B",
            light: "#FCD34D",
            dark: "#D97706",
            subtle: "#FEF3C7",
          },
          faith: "#3B82F6",
          sharing: "#10B981",
          hope: "#F59E0B",
          love: "#EC4899",
        },
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
    },
  },
  plugins: [],
};
export default config;
