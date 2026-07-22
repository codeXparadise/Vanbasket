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
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          honey: {
            DEFAULT: "#c07a12",
            light: "#f3ebd8",
            dark: "#8d5404",
          },
          cream: {
            light: "#faf8f5",
            warm: "#f1eae0",
            dark: "#e2d7c5",
          },
          espresso: {
            DEFAULT: "#241b15",
            muted: "#52443a",
          },
          forest: {
            DEFAULT: "#2c4535",
            light: "#415f4c",
          },
          terracotta: {
            DEFAULT: "#9c4927",
            light: "#b85c37",
          }
        }
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
      },
      transitionTimingFunction: {
        "organic": "cubic-bezier(0.25, 1, 0.5, 1)",
      },
      animation: {
        "slide-right": "slideRight 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards",
        "fade-in-up": "fadeInUp 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards",
        "drip": "drip 3s ease-in-out infinite",
        "slide-in-toast": "slideInToast 0.4s cubic-bezier(0.25, 1, 0.5, 1) forwards",
        "scale-in": "scaleIn 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards",
        "slide-in-left": "slideInLeft 0.6s cubic-bezier(0.25, 1, 0.5, 1) forwards",
        "slide-in-right": "slideInRight 0.6s cubic-bezier(0.25, 1, 0.5, 1) forwards",
      },
      keyframes: {
        slideRight: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        drip: {
          "0%, 100%": { transform: "translateY(0) scaleY(1)" },
          "50%": { transform: "translateY(4px) scaleY(1.05)" },
        },
        slideInToast: {
          "0%": { opacity: "0", transform: "translateX(100%) scale(0.95)" },
          "100%": { opacity: "1", transform: "translateX(0) scale(1)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      }
    },
  },
  plugins: [],
};
export default config;
