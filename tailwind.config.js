/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        border: "hsl(var(--border))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        piece: {
          i: "var(--color-piece-i)",
          j: "var(--color-piece-j)",
          l: "var(--color-piece-l)",
          o: "var(--color-piece-o)",
          s: "var(--color-piece-s)",
          t: "var(--color-piece-t)",
          z: "var(--color-piece-z)",
        },
        board: {
          bg: "var(--color-board-bg)",
          border: "var(--color-board-border)",
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["Geist Mono", "monospace"],
      }
    },
  },
  plugins: [],
}
