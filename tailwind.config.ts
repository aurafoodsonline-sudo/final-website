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
