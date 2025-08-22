/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'headline': ['Georgia', 'Times New Roman', 'serif'],
        'body': ['Arial', 'Helvetica', 'sans-serif'],
      },
      fontSize: {
        '8xl': '6rem',
        '9xl': '8rem',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}