/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Geist", "system-ui", "sans-serif"],
      },
      colors: {
        surface: {
          light: "#F8FAFC",
          card: "#FFFFFF",
          muted: "#F1F5F9",
          border: "#E2E8F0",
        },
        ink: {
          900: "#0F172A",
          600: "#334155",
        },
        accent: {
          DEFAULT: "#2563EB",
          light: "#3B82F6",
        },
        dark: {
          bg: "#0B0F19",
          border: "#1E293B",
          card: "#111827",
        },
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 16px rgba(15, 23, 42, 0.04)",
      },
    },
  },
  plugins: [],
};
