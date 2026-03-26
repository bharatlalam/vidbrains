export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Syne", "sans-serif"],
        mono: ["DM Mono", "monospace"],
      },
      colors: {
        accent: "#e05a2b",
        "accent-light": "#f07040",
        bg: { 1: "#0d0d0f", 2: "#131316", 3: "#1a1a1f", 4: "#222228" },
      },
    },
  },
  plugins: [],
};