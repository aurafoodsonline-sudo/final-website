import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        chili: "#C1440E",
        turmeric: "#E8A33D",
        cardamom: "#6B8E4E",
        cinnamon: "#4A2C1D",
        cream: "#FBF3E7",
      },
      zIndex: { 1: "1" },
      animation: {
        // React Bits StarBorder
        "star-movement-bottom": "star-movement-bottom linear infinite alternate",
        "star-movement-top": "star-movement-top linear infinite alternate",
      },
      keyframes: {
        "star-movement-bottom": {
          "0%": { transform: "translate(0%, 0%)", opacity: "1" },
          "100%": { transform: "translate(-100%, 0%)", opacity: "0" },
        },
        "star-movement-top": {
          "0%": { transform: "translate(0%, 0%)", opacity: "1" },
          "100%": { transform: "translate(100%, 0%)", opacity: "0" },
        },
      },
      fontFamily: {
        heritage: ["var(--font-heritage)"],
        body: ["var(--font-body)"],
        urheritage: ["var(--font-ur-heritage)"],
        urbody: ["var(--font-ur-body)"],
      },
    },
  },
  plugins: [],
};
export default config;
