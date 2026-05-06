import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#FFFFFF",
          100: "#F7F9FC",
          200: "#EDF1F7"
        },
        ink: {
          DEFAULT: "#0F4C81",
          900: "#0A3A5F",
          800: "#0A3A5F",
          700: "#1A5F9E",
          600: "#5A6C7D"
        },
        zinc: {
          250: "#DCDCD8",
          350: "#A8A8A3"
        },
        scarlet: {
          DEFAULT: "#FF6B35",
          50: "#FFF1EA",
          100: "#FFE0D0",
          500: "#FF6B35",
          600: "#E85A26",
          700: "#B8430D"
        },
        navy: {
          DEFAULT: "#0F4C81",
          50: "#F0F7FF",
          100: "#DCEAF8",
          500: "#0F4C81",
          600: "#0A3A5F",
          700: "#003D82"
        },
        slate: {
          550: "#5A6C7D",
          650: "#475569",
          850: "#2C3E50"
        },
        accent: {
          DEFAULT: "#FF6B35",
          600: "#E85A26"
        }
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif"
        ],
        mono: [
          "JetBrains Mono",
          "Fira Code",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace"
        ],
        display: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif"
        ]
      },
      letterSpacing: {
        tightest: "-0.04em"
      },
      boxShadow: {
        card: "0 1px 0 rgba(15,76,129,0.04), 0 8px 24px rgba(0,0,0,0.08)",
        cardHover: "0 1px 0 rgba(15,76,129,0.04), 0 12px 32px rgba(0,0,0,0.12)",
        ink: "0 1px 0 rgba(255,255,255,0.06) inset, 0 8px 24px rgba(15,76,129,0.45)",
        accent: "0 4px 16px rgba(255,107,53,0.30)",
        accentHover: "0 8px 24px rgba(255,107,53,0.40)"
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(to right, rgba(15,76,129,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,76,129,0.06) 1px, transparent 1px)",
        "grid-dark":
          "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
        "noise":
          "radial-gradient(rgba(15,76,129,0.04) 1px, transparent 1px)",
        "navy-hero":
          "linear-gradient(135deg, #0F4C81 0%, #1A5F9E 100%)",
        "page-fade":
          "linear-gradient(to bottom, #F0F7FF, #FFFFFF 300px)"
      },
      backgroundSize: {
        "grid-32": "32px 32px",
        "grid-24": "24px 24px",
        "noise-4": "4px 4px"
      }
    }
  },
  plugins: []
} satisfies Config;
