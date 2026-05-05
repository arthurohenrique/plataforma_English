import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brandBlue: "#1B3A6B",
        brandRed: "#C0392B",
        brandGold: "#F4C430",
        brandLight: "#F5F7FA",
        brandText: "#2C3E50",
        brandFooter: "#0F2447",
      },
      fontFamily: {
        serifTitle: ["var(--font-playfair)"],
        body: ["var(--font-inter)"],
      },
      boxShadow: {
        soft: "0 8px 24px rgba(27, 58, 107, 0.1)",
      },
      backgroundImage: {
        "brush-red":
          "linear-gradient(transparent 58%, rgba(192,57,43,0.24) 58%, rgba(192,57,43,0.24) 100%)",
        "brush-gold":
          "linear-gradient(transparent 58%, rgba(244,196,48,0.3) 58%, rgba(244,196,48,0.3) 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
