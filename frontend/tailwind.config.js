/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#060F1F",
          900: "#0A192F",
          800: "#122544",
          700: "#1E3A8A",
          600: "#2748A0",
        },
        saffron: {
          600: "#D97706",
          500: "#EA9316",
          100: "#FDECD1",
        },
        alert: {
          600: "#DC2626",
          500: "#E11D48",
        },
        success: {
          600: "#15803D",
          500: "#16A34A",
        },
        paper: "#F7F8FA",
      },
      fontFamily: {
        display: ["'Merriweather'", "Georgia", "serif"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(10, 25, 47, 0.06), 0 1px 3px rgba(10, 25, 47, 0.08)",
      },
      keyframes: {
        chakraDrop: {
          "0%":   { transform: "translateY(-160%) scale(0.7)", opacity: "0" },
          "55%":  { transform: "translateY(6%) scale(1.03)",   opacity: "1" },
          "72%":  { transform: "translateY(-3%) scale(0.99)" },
          "86%":  { transform: "translateY(1.5%) scale(1.005)" },
          "100%": { transform: "translateY(0) scale(1)" },
        },
        zipFlap: {
          "0%":   { clipPath: "inset(0 0 0 0%)" },
          "100%": { clipPath: "inset(0 0 0 100%)" },
        },
        zipTab: {
          "0%":   { left: "0%" },
          "100%": { left: "96%" },
        },
      },
      animation: {
        "chakra-drop": "chakraDrop 1.1s cubic-bezier(.32,1.6,.5,1) both",
        "zip-flap": "zipFlap linear both",
        "zip-tab": "zipTab linear both",
      },
    },
  },
  plugins: [],
};