/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/renderer/index.html',
    './src/renderer/src/**/*.{js,ts,jsx,tsx}',
    './src/ui/**/*.{js,ts,jsx,tsx}',
    './src/modules/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#2bbdee',
        'background-dark': '#0f1115',
        'background-dark-end': '#1a1d24',
        'glass-bg': 'rgba(255, 255, 255, 0.03)',
        'glass-border': 'rgba(255, 255, 255, 0.1)',
      },
      fontFamily: {
        'display': ['Inter', 'sans-serif'],
        'sans': ['Inter', 'sans-serif'] // Default sans to Inter as well
      },
      backgroundImage: {
        'neon-gradient': 'linear-gradient(135deg, #2bbdee 0%, #22d3ee 100%)',
      },
      boxShadow: {
        'neon': '0 0 20px rgba(43, 189, 238, 0.3)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      }
    }
  },
  plugins: []
}
