module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#FFFFFF',
          dark: '#242526',
        },
        background: {
          DEFAULT: '#FFFFFF',
          dark: '#1C1E21',
        },
        card: {
          DEFAULT: '#F8F9FA',
          dark: '#242526',
        },
        border: {
          DEFAULT: '#E4E6EB',
          dark: '#3A3B3C',
        },
        accent: {
          DEFAULT: '#0D9488',
          hover: '#0F766E',
          light: '#14B8A6',
        },
        text: {
          primary: { DEFAULT: '#1C1E21', dark: '#E4E6EB' },
          secondary: { DEFAULT: '#65676B', dark: '#B0B3B8' },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
