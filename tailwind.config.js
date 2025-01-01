/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"], // Paths to your source files
  theme: {
    extend: {
      colors: {
        primary: "#FFCE1A",
        secondary: "#ODO842",
        blackBG: "#F3F3F30",
        Favourite: "#FF5841",
      },
      fontFamily: {
        primary: ["Montserrat", "sans-serif"],
        secondary: ["Nunito Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};
