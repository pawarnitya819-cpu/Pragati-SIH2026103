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
    },
  },
  plugins: [],
};
