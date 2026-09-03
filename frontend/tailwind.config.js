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
        chakraJourney: {
          "0%":   { transform: "translate(var(--p1x), calc(var(--p1y) - 220px)) scale(0.65)", opacity: "0" },
          "14%":  { opacity: "1" },
          "22%":  { transform: "translate(var(--p1x), calc(var(--p1y) + 8px)) scale(1.05)" },
          "26%":  { transform: "translate(var(--p1x), var(--p1y)) scale(1)" },
          "78%":  { transform: "translate(var(--p2x), var(--p2y)) scale(1)" },
          "90%":  { transform: "translate(6px, -4px) scale(1.04)" },
          "100%": { transform: "translate(0, 0) scale(1)" },
        },
        zipFlap: {
          "0%":   { clipPath: "inset(0 0 0 0%)" },
          "100%": { clipPath: "inset(0 0 0 100%)" },
        },
      },
      animation: {
        "chakra-journey": "chakraJourney both",
        "zip-flap": "zipFlap linear both",
      },
    },
  },
  plugins: [],
};