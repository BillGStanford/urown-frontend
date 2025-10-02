module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      fontFamily: {
        'bold': ['Arial', 'Helvetica', 'sans-serif'],
      },
      fontSize: {
        'huge': '3rem',
        'massive': '4rem',
      }
    },
  },
  plugins: [],
};