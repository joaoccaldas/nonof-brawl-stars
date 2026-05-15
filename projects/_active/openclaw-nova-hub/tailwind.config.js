/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // === NOVA HUB v2.0 COLOR SYSTEM ===
        // Blue primary — the vastness, the depth
        nova: {
          deep: '#0a1628',
          midnight: '#0f1a3a', 
          primary: '#1a3a5c',
          bright: '#2563eb',
          cyan: '#06b6d4',
          sky: '#7dd3fc',
          // Legacy scale preserved
          50: '#f3f8ff',
          100: '#e1edff',
          200: '#bcd6ff',
          300: '#8db7ff',
          400: '#5a92ff',
          500: '#3d74ff',
          600: '#2d56f0',
          700: '#2344c4',
          800: '#1d369a',
          900: '#172b78'
        },
        // Gold accent — the pulse, the warmth
        gold: {
          muted: '#78350f',
          soft: '#a16207',
          warm: '#ca8a04',
          bright: '#fbbf24',
          glow: '#fde047'
        },
        // Neutrals — the void
        ink: {
          darkest: '#020617',
          dark: '#1e293b',
          mid: '#475569',
          light: '#94a3b8',
          // Legacy preserved
          950: '#05060a',
          900: '#0a0c14',
          800: '#12151f',
          700: '#1a1e2c',
          600: '#262a3b'
        },
        // Synapse colors — status indicators
        synapse: {
          cyan: '#46e0ff',
          violet: '#a45bff',
          pink: '#ff5bd8',
          amber: '#ffb547',
          lime: '#8cff66'
        }
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace']
      },
      boxShadow: {
        glow: '0 0 40px -8px rgba(6,182,212,0.45)',
        'glow-strong': '0 0 80px -12px rgba(251,191,36,0.6)',
        'gold-aura': '0 0 60px -10px rgba(251,191,36,0.4)',
        'nova-halo': '0 0 100px -20px rgba(37,99,235,0.3)'
      },
      backgroundImage: {
        'grid-faint': 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        'radial-fade': 'radial-gradient(ellipse at 50% 0%, rgba(37,99,235,0.15), transparent 60%)',
        // === NEW GRADIENTS ===
        'ocean': 'linear-gradient(135deg, #0a1628 0%, #0f1a3a 50%, #1a3a5c 100%)',
        'twilight': 'linear-gradient(160deg, #1a3a5c 0%, #2563eb 60%, #06b6d4 100%)',
        'horizon': 'linear-gradient(180deg, rgba(15,26,58,0.9) 0%, rgba(10,22,40,0.95) 100%)',
        'aurora': 'linear-gradient(90deg, #0a1628 0%, #1a3a5c 25%, #2563eb 50%, #1a3a5c 75%, #0a1628 100%)',
        'gold-horizon': 'linear-gradient(135deg, #78350f 0%, #ca8a04 50%, #fbbf24 100%)'
      },
      keyframes: {
        'pulse-slow': {
          '0%,100%': { opacity: 0.6 },
          '50%': { opacity: 1 }
        },
        'nova-pulse': {
          '0%,100%': { opacity: 0.6, transform: 'scale(1)' },
          '50%': { opacity: 1, transform: 'scale(1.05)' }
        },
        'aurora-shift': {
          '0%,100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' }
        },
        'gold-shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        }
      },
      animation: {
        'pulse-slow': 'pulse-slow 4s ease-in-out infinite',
        'nova-pulse': 'nova-pulse 4s ease-in-out infinite',
        'aurora': 'aurora-shift 15s ease infinite',
        'gold-shimmer': 'gold-shimmer 3s linear infinite',
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 8s linear infinite'
      }
    }
  },
  plugins: []
};
