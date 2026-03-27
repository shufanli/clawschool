import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--bg-primary)",
        surface: "var(--bg-surface)",
        elevated: "var(--bg-elevated)",
        "accent-start": "var(--accent-start)",
        "accent-end": "var(--accent-end)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        border: "var(--border-color)",
        success: "var(--success)",
        warning: "var(--warning)",
        error: "var(--error)",
        info: "var(--info)",
        unlocked: "var(--unlocked)",
      },
      fontSize: {
        "hero-score": ["48px", { fontWeight: "800", letterSpacing: "-0.02em" }],
        h1: ["28px", { fontWeight: "700" }],
        h2: ["20px", { fontWeight: "600" }],
        body: ["15px", { fontWeight: "400" }],
        caption: ["13px", { fontWeight: "400" }],
        mini: ["11px", { fontWeight: "500" }],
      },
      spacing: {
        "2xs": "2px",
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        "2xl": "48px",
        "3xl": "64px",
      },
      borderRadius: {
        sm: "8px",
        md: "14px",
        lg: "24px",
        xl: "40px",
        full: "9999px",
      },
      maxWidth: {
        app: "480px",
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "PingFang SC", "Helvetica Neue", "Microsoft YaHei", "sans-serif"],
        mono: ["SF Mono", "Menlo", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
