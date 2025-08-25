/** @type {import('tailwindcss').Config} */
module.exports = {
  // Use class strategy for dark mode so `.dark` on <html> controls theme
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
}
