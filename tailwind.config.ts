import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#07070b",
          900: "#0b0b12",
          800: "#121220",
          700: "#1b1b2b",
          600: "#282840",
        },
        gold: {
          200: "#f6e2ae",
          300: "#f0d38a",
          400: "#e8c168",
          500: "#d9a94e",
          600: "#b98a36",
        },
        mist: {
          300: "#aab1c4",
          400: "#8b93a7",
          500: "#6b7385",
        },
        whatsapp: {
          DEFAULT: "#25D366",
          dark: "#1EBE5D",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-display)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        drift: {
          "0%": { transform: "translate3d(0,0,0)" },
          "100%": { transform: "translate3d(-40px,-24px,0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.9s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in": "fade-in 1.1s ease-out both",
        "drift-slow": "drift 24s ease-in-out infinite alternate",
      },
    },
  },
  plugins: [],
};

export default config;
