import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: { DEFAULT: "#F59E0B", dark: "#D97706", light: "#FBB035" },
        surface: { DEFAULT: "#111118", dark: "#090910", darker: "#07070A" },
        border: { DEFAULT: "#1E1E2A", subtle: "#141420", muted: "#1A1A22" },
        accent: {
          green: "#22C55E",
          purple: "#818CF8",
          pink: "#EC4899",
          red: "#EF4444",
          blue: "#1DA1F2",
        },
      },
      fontFamily: {
        sans: ["Geist", "system-ui", "sans-serif"],
        mono: ["Geist Mono", "monospace"],
      },
      animation: {
        "fade-up": "fadeUp .2s ease both",
        "slide-in": "slideIn .18s ease both",
        ticker: "ticker 80s linear infinite",
        blink: "blink .9s step-end infinite",
      },
      keyframes: {
        fadeUp: { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        slideIn: { from: { opacity: "0", transform: "translateX(-12px)" }, to: { opacity: "1", transform: "translateX(0)" } },
        ticker: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
        blink: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0" } },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
