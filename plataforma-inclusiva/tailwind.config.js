// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  // añade ts/tsx si llegas a usarlos
  darkMode: "class",   
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],

  theme: {
    extend: {
      /* 🎨 Paleta */
      colors: {
        madera:      { DEFAULT: "#4F3F36", dark: "#3B2C25" },
        botella:     { DEFAULT: "#3E5F45" },
        grisazo:     { DEFAULT: "#5F7D8A" },
        crema:       { DEFAULT: "#F7F5EC", 50: "#FFFAF2" },
        acento:      { DEFAULT: "#E0A72D" },        // nuevo color destacado
      },

      /* 🖼️ Imágenes de fondo */
      backgroundImage: {
        "gato-libro": "url('/gato-libro.webp')",
      },

      /* 🔤 Tipografía */
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },

  plugins: [require("@tailwindcss/forms")],
};