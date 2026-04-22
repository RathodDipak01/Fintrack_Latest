const config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#070A12",
        midnight: "#0B0F19",
        panel: "#121826",
        panel2: "#1A2233",
        profit: "#22C55E",
        loss: "#EF4444",
        ai: "#3B82F6",
        warn: "#FACC15",
      },
      boxShadow: {
        glass: "0 24px 80px rgba(0, 0, 0, 0.35)",
        glow: "0 0 38px rgba(59, 130, 246, 0.18)",
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "Inter",
          "SF Pro Display",
          "system-ui",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
