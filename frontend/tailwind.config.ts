import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./content/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Layered backgrounds (step up via background color)
        bg: "#161b2e",
        surface: "#1b2035",
        card: "#252b40",
        elevated: "#2d354f",
        // Brand
        teal: {
          DEFAULT: "#00c4b4",
          glow: "rgba(0, 196, 180, 0.4)",
        },
        gold: {
          DEFAULT: "#f59e0b",
          glow: "rgba(245, 158, 11, 0.4)",
        },
        accent: {
          DEFAULT: "#00c4b4",
          alt: "#f59e0b",
        },
        // Text
        ink: {
          DEFAULT: "#f8fafc",
          dim: "#94a3b8",
        },
        muted: "#64748b",
        // Admin semantic
        success: "#10b981",
        warn: "#f59e0b",
        danger: "#ef4444",
        info: "#3b82f6",
      },
      fontFamily: {
        display: ["var(--font-bebas-neue)", "Impact", "sans-serif"],
        body: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 4px 24px rgba(0,0,0,0.12)",
        glow: "0 0 32px rgba(0, 196, 180, 0.15)",
        "glow-gold": "0 0 32px rgba(245, 158, 11, 0.15)",
        elevated: "0 8px 32px rgba(0,0,0,0.32)",
      },
      animation: {
        "fade-up": "fadeSlideUp 0.6s ease-out both",
        "complete-pulse": "completePulse 0.3s ease-out",
        "subtle-pulse": "subtlePulse 3s ease-in-out infinite",
      },
      keyframes: {
        fadeSlideUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        completePulse: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.03)" },
          "100%": { transform: "scale(1)" },
        },
        subtlePulse: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
