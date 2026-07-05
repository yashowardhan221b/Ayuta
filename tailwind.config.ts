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
        bg: "var(--bg)",
        bg2: "var(--bg-2)",
        surface: "var(--surface)",
        "surface-solid": "var(--surface-solid)",
        raised: "var(--surface-raised)",
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
        text: "var(--text)",
        muted: "var(--text-muted)",
        dim: "var(--text-dim)",
        accent: "var(--accent)",
        "accent-2": "var(--accent-2)",
        magenta: "var(--magenta)",
        lime: "var(--lime)",
        correct: "var(--correct)",
        wrong: "var(--wrong)",
        gold: "var(--gold)",
        mini: "var(--mini)",
        major: "var(--major)",
        cta: "var(--cta-1)",
      },
      boxShadow: {
        glow: "0 0 20px -2px rgba(45,212,191,0.55)",
        "glow-lg": "0 0 44px -4px rgba(45,212,191,0.6)",
        cta: "0 6px 0 -1px #12634a, 0 10px 22px -6px rgba(47,211,154,0.5)",
      },
      backgroundImage: {
        "accent-grad": "linear-gradient(100deg, var(--accent), var(--accent-2))",
        "cta-grad": "linear-gradient(100deg, var(--cta-1), var(--cta-2))",
        "flame-grad":
          "linear-gradient(180deg, var(--flame-1), var(--flame-2), var(--flame-3))",
      },
    },
  },
  plugins: [],
};
export default config;
