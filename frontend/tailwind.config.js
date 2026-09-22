/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "background": "var(--color-background)",
        "surface": "var(--color-surface)",
        "surface-container-lowest": "var(--color-surface-container-lowest)",
        "surface-container-low": "var(--color-surface-container-low)",
        "surface-container": "var(--color-surface-container)",
        "surface-container-high": "var(--color-surface-container-high)",
        "surface-container-highest": "var(--color-surface-container-highest)",
        "surface-dim": "var(--color-surface-dim)",
        "surface-bright": "var(--color-surface-bright)",
        "primary": "var(--color-primary)",
        "on-primary": "var(--color-on-primary)",
        "primary-container": "var(--color-primary-container)",
        "on-primary-container": "var(--color-on-primary-container)",
        "secondary": "var(--color-secondary)",
        "secondary-fixed": "var(--color-secondary-fixed)",
        "secondary-fixed-dim": "var(--color-secondary-fixed-dim)",
        "on-secondary-fixed-variant": "var(--color-on-secondary-fixed-variant)",
        "on-surface": "var(--color-on-surface)",
        "on-surface-variant": "var(--color-on-surface-variant)",
        "outline": "var(--color-outline)",
        "outline-variant": "var(--color-outline-variant)",
        "risk-high": "#ba1a1a",
        "risk-medium": "#e65100",
        "risk-low": "#2e7d32"
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        headline: ["Hanken Grotesk", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"]
      },
      boxShadow: {
        "ambient": "0 8px 32px -4px rgba(45, 27, 20, 0.04), 0 4px 12px -2px rgba(45, 27, 20, 0.02)",
        "ambient-hover": "0 14px 44px -4px rgba(45, 27, 20, 0.08), 0 8px 20px -2px rgba(45, 27, 20, 0.03)"
      },
      borderRadius: {
        "3xl": "1.5rem",
        "4xl": "2rem"
      },
      spacing: {
        "bento-gap": "20px"
      }
    }
  },
  plugins: []
}
