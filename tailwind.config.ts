import type { Config } from "tailwindcss";

export default {
  darkMode: "class",

  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        ink: {
          0: "#070B12",
          1: "#060912",
          2: "#0B1220",
          3: "#0E1628",
        },
        surface: {
          0: "#ffffff",
          1: "#f8fafc",
          2: "#f1f5f9",
        },
      },

      boxShadow: {
        soft: "0 1px 2px rgba(15,23,42,0.06), 0 8px 24px rgba(15,23,42,0.08)",
        glow: "0 0 0 1px rgba(37,99,235,0.14), 0 14px 40px rgba(59,130,246,0.14)",
        card: "0 10px 30px rgba(2,6,23,0.10)",
      },

      borderRadius: {
        xl: "14px",
        "2xl": "18px",
        "3xl": "24px",
      },
    },
  },

  plugins: [],
} satisfies Config;
