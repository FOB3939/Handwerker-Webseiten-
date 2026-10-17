import type { Config } from "tailwindcss";

const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        t: {
          bg: v("bg"),
          surface: v("surface"),
          ink: v("ink"),
          muted: v("muted"),
          line: v("line"),
          accent: v("accent"),
          "accent-ink": v("accent-ink"),
          dark: v("dark"),
          "dark-ink": v("dark-ink"),
        },
      },
      fontFamily: {
        display: "var(--font-display)",
        body: "var(--font-body)",
      },
      borderRadius: {
        t: "var(--radius)",
      },
      maxWidth: {
        site: "76rem",
      },
    },
  },
  plugins: [],
};

export default config;
