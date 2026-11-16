import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        creme: "#FBF6EE",
        papel: "#FFFDF9",
        mel: { 50: "#FDF5E6", 100: "#F9E6C2", 200: "#F2CF8B", 300: "#E8B45A", 400: "#DF9D36", 500: "#C9821F", 600: "#A66518", 700: "#7F4C16" },
        cacau: { 400: "#8C7466", 500: "#6B5446", 700: "#3E2E24", 900: "#24190F" },
        salvia: { 100: "#E3EFE5", 500: "#4F8A5F", 700: "#2F6140" },
        coral: { 100: "#FBE3DC", 500: "#D2573A", 700: "#9C3A22" },
        linha: "#EDE3D4",
      },
      fontFamily: {
        display: ["ui-serif", "Georgia", "Cambria", "Times New Roman", "serif"],
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: { card: "0 1px 0 rgba(62,46,36,.04), 0 8px 24px -12px rgba(62,46,36,.18)" },
    },
  },
  plugins: [],
} satisfies Config;
