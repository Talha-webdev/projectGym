import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        gym: {
          bg: "#0A0A0A",
          surface: "#1A1A1A",
          elevated: "#242424",
          border: "#2A2A2A",
          "border-light": "#333333",
          gold: "#D4A853",
          "gold-hover": "#E5BD6A",
          "gold-muted": "rgba(212, 168, 83, 0.12)",
          "text-primary": "#FFFFFF",
          "text-secondary": "#A0A0A0",
          "text-muted": "#6B6B6B",
          success: "#22C55E",
          error: "#EF4444",
          warning: "#F59E0B",
        },
      },
      fontFamily: {
        heading: ["Inter", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        accent: ["Playfair Display", "serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "gold-pulse": "goldPulse 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(40px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        goldPulse: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(212, 168, 83, 0.4)" },
          "50%": { boxShadow: "0 0 0 10px rgba(212, 168, 83, 0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
