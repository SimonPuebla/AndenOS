import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#F6F2E6",
        orange: "#F89A2F",
        blue: "#2F3993",
        dark: "#1A1A2E",
        "orange-dark": "#E8891F",
        "blue-dark": "#1F2970",
        cyan: "#00E5FF",
        "agent-dark": "#0D0D1A",
      },
      fontFamily: {
        mono: ["'Space Mono'", "'Courier New'", "ui-monospace", "monospace"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "Arial", "sans-serif"],
      },
      backgroundImage: {
        "grid-pattern":
          "repeating-linear-gradient(0deg, transparent, transparent 31px, #1A1A2E14 31px, #1A1A2E14 32px), repeating-linear-gradient(90deg, transparent, transparent 31px, #1A1A2E14 31px, #1A1A2E14 32px)",
        "agent-grid":
          "repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(0,229,255,0.05) 39px, rgba(0,229,255,0.05) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(0,229,255,0.05) 39px, rgba(0,229,255,0.05) 40px)",
      },
    },
  },
  plugins: [],
};
export default config;
