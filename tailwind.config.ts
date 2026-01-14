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
        wine: {
          50: "#fdf2f4",
          100: "#fce7eb",
          200: "#f9d0d9",
          300: "#f4a9ba",
          400: "#ec7896",
          500: "#df4d74",
          600: "#cc2d5a",
          700: "#ab2049",
          800: "#8f1d40",
          900: "#722043",  // Burgundy
          950: "#450a1f",
        },
      },
    },
  },
  plugins: [],
};

export default config;
