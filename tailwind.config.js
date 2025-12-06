/** @type {import('tailwindcss').Config} */
export default {
  content: ["./client/index.html", "./client/src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#0ea5e9", foreground: "#ffffff" },
        secondary: { DEFAULT: "#64748b", foreground: "#ffffff" },
        destructive: { DEFAULT: "#ef4444", foreground: "#ffffff" },
        muted: { DEFAULT: "#1e293b", foreground: "#94a3b8" },
        accent: { DEFAULT: "#0f172a", foreground: "#e2e8f0" },
        card: { DEFAULT: "#0f172a", foreground: "#e2e8f0" },
        border: "#334155",
        input: "#334155",
        ring: "#0ea5e9",
        background: "#020617",
        foreground: "#e2e8f0",
      },
    },
  },
  plugins: [],
};
