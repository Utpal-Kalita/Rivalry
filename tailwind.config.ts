import type { Config } from "tailwindcss";
// Tokens dealt by the taste skill: palette lunar-grey-bronze, pairing archivo (see .taste-skill/).
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { bg: "#111111", surface: "#1c1c1c", line: "#2a2a2a", ink: "#f2f2f2", muted: "#b3b3b3", accent: "#a08672", "accent-hi": "#bfa38d", danger: "#e0705a", ok: "#8fbf7a" },
      fontFamily: { display: ['"Archivo"', "system-ui", "sans-serif"], mono: ['"Martian Mono"', "ui-monospace", "monospace"] },
      borderRadius: { card: "14px" },
      maxWidth: { wrap: "1240px" },
    },
  },
} satisfies Config;
