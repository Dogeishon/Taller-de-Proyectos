// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html","./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        madera:  {  DEFAULT: "#4F3F36" },
        botella: {  DEFAULT: "#3E5F45" },
        grisazo: {  DEFAULT: "#5F7D8A" },
        crema:   {  DEFAULT: "#F7F5EC" },
      },
      backgroundImage: {
        'gato-libro': "url('/gato-libro.webp')",
      }
    },
  },
  plugins: [require("@tailwindcss/forms")],
};

