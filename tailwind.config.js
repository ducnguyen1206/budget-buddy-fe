/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1a38d6",
        secondary: "#1454e8",
        color3: "#19c3ff",
        color4: "#f0f8ff",
        color5: "#EA916E",
        error: "#de3b40",
      },
    },
  },
  plugins: [],
};
