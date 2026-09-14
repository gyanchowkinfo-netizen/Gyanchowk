export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gyan: {
          primary: 'var(--gyan-primary)',
          'primary-light': 'var(--gyan-primary-light)',
          'primary-dark': 'var(--gyan-primary-dark)',
          secondary: 'var(--gyan-secondary)',
          'secondary-light': 'var(--gyan-secondary-light)',
          'secondary-dark': 'var(--gyan-secondary-dark)',
          accent: 'var(--gyan-accent)',
          background: 'var(--gyan-background)',
          'background-secondary': 'var(--gyan-background-secondary)',
          surface: 'var(--gyan-surface)',
          text: 'var(--gyan-text)',
          'text-secondary': 'var(--gyan-text-secondary)',
          muted: 'var(--gyan-text-muted)',
          border: 'var(--gyan-border)',
          'border-hover': 'var(--gyan-border-hover)',
          success: 'var(--gyan-success)',
          warning: 'var(--gyan-warning)',
          error: 'var(--gyan-error)',
          info: 'var(--gyan-info)',
          footer: 'var(--gyan-footer)',
        },
        gc: {
          black: 'var(--gyan-text)',
          navy: 'var(--gyan-background-secondary)',
          ink: 'var(--gyan-surface)',
          panel: 'var(--gyan-background-secondary)',
          line: 'var(--gyan-border)',
          blue: 'var(--gyan-primary)',
          glow: 'var(--gyan-primary-light)',
          gold: 'var(--gyan-secondary)',
          amber: 'var(--gyan-secondary-dark)',
          orange: 'var(--gyan-accent)',
          mist: 'var(--gyan-text-secondary)',
          mute: 'var(--gyan-text-muted)',
          surface: 'var(--gyan-surface)',
        },
      },
      fontFamily: {
        sans: ['var(--font-plus-jakarta)', 'system-ui', 'sans-serif'],
        display: ['var(--font-sora)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 40px color-mix(in srgb, var(--gyan-primary-light) 25%, transparent)',
        gold: '0 0 28px color-mix(in srgb, var(--gyan-secondary) 28%, transparent)',
        sm: '0 1px 2px color-mix(in srgb, var(--gyan-primary-dark) 6%, transparent)',
      },
      backgroundImage: {
        'gc-hero':
          'radial-gradient(1200px 500px at 10% -10%, color-mix(in srgb, var(--gyan-primary) 12%, transparent), transparent 55%), radial-gradient(900px 400px at 90% 0%, color-mix(in srgb, var(--gyan-secondary) 12%, transparent), transparent 50%), linear-gradient(180deg, var(--gyan-background) 0%, var(--gyan-background-secondary) 55%, var(--gyan-background) 100%)',
        'gyan-cta':
          'linear-gradient(135deg, var(--gyan-primary-dark) 0%, var(--gyan-primary) 58%, var(--gyan-primary-light) 100%)',
      },
    },
  },
  plugins: [],
};
