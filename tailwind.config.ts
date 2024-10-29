import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class", // Enables class-based dark mode
  theme: {
    extend: {
      colors: {
        // Custom colors for light/dark modes if needed
        darkBg: "#1a1a1a",
        darkText: "#e5e5e5",
        lightBg: "#ffffff",
        lightText: "#333333",
      },
    },
  },
  plugins: [],
} satisfies Config;
