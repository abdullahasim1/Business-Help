/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#172033',
        muted: '#667085',
        line: '#d9e1e7',
        brand: '#2563eb',
        accent: '#10b981',
      },
    },
  },
  plugins: [],
}
