/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './index.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        ink: '#0B1F1A',
        mist: '#E8F2EE',
        'mist-light': '#F4F7F5',
        sage: '#A8C5B8',
        mint: '#2EE6A6',
        coral: '#FF5B45',
        slate: '#4A5C56',
      },
      fontFamily: {
        display: ['Syne-Bold'],
        'display-extrabold': ['Syne-ExtraBold'],
        sans: ['Manrope-Regular'],
        'sans-medium': ['Manrope-Medium'],
        'sans-semibold': ['Manrope-SemiBold'],
      },
    },
  },
  plugins: [],
};
