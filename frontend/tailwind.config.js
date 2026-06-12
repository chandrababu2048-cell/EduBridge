// Tailwind configuration — colors and font from UI_UX.md
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        nunito: ['Nunito', 'sans-serif'],
      },
      colors: {
        primary: '#4F86C6',
        secondary: '#67C99A',
        accent: '#FFD166',
        coral: '#FF6B6B',
      },
      animation: {
        'bounce-slow': 'bounce 1s infinite',
      }
    },
  },
  plugins: [],
}
