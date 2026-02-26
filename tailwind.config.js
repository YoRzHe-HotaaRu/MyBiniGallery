/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./**/*.{js,ts,jsx,tsx}", "!./node_modules/**"],
  theme: {
    container: {
      center: true,
    },
    extend: {},
  },
  plugins: [],
};
