/** @type {import('tailwindcss').Config} */
// Design tokens for the "Maritime Investigation Archive" look.
// ink = navy desk, cream = case-file paper, gold = amber accent (one accent only),
// coral = rust (evidence / danger), steel = muted blue-grey for neutral info. No other hues.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    borderRadius: { none: '0', sm: '2px', DEFAULT: '2px', md: '3px', lg: '4px', xl: '6px', '2xl': '8px', '3xl': '8px', full: '9999px' },
    extend: {
      colors: {
        ink: { 950: '#0A121C', 900: '#0F1B29', 800: '#16263A', 700: '#1E3249', 600: '#2C4560', 500: '#46627F', 400: '#7389A0', 300: '#A3B4C6' },
        cream: { 50: '#FBF8F0', 100: '#F3ECDB', 200: '#E6DCC3', 300: '#CFC3A4', 400: '#A89D82' },
        gold: { 300: '#EBC77A', 400: '#E3B04B', 500: '#D9A03A', 600: '#B8832A', 700: '#8A5F16' },
        steel: { 300: '#9DB4CC', 400: '#7F9BB8', 500: '#5F7F9F' },
        coral: '#B8452A',
        good: '#6FB58A',
        bad: '#E0745F',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        arabic: ['"Noto Naskh Arabic"', 'Amiri', '"Traditional Arabic"', '"Geeza Pro"', 'serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      maxWidth: { page: '1680px' },
    },
  },
  plugins: [],
}
