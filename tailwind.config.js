/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1E90FF", // Our main theme color
        hover: "#1870CC", // Darker shade for hover
        button : "#2196F3FF",
      },
    },
  },
  plugins: [],
};
