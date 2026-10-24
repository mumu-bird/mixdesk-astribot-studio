/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./ui/index.html', './ui/src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))', foreground: 'hsl(var(--foreground))',
        card: 'hsl(var(--card))', primary: 'hsl(var(--primary))',
        secondary: 'hsl(var(--secondary))', muted: 'hsl(var(--muted))',
        'muted-foreground': 'hsl(var(--muted-foreground))', border: 'hsl(var(--border))',
        ring: 'hsl(var(--ring))', success: 'hsl(var(--success))', warning: 'hsl(var(--warning))',
        info: 'hsl(var(--info))',
        accent: 'hsl(var(--secondary))', destructive: 'hsl(var(--destructive))',
      },
      fontFamily: { sans: ['"HarmonyOS Sans SC"', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'] },
      borderRadius: { lg: 'var(--radius)', md: 'var(--radius-md)', sm: 'var(--radius-sm)' },
    },
  },
  plugins: [],
};
