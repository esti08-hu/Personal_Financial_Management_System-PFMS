import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--background))',
        foreground: 'rgb(var(--foreground))',
        card: 'hsl(var(--color-card))',
        'card-foreground': 'hsl(var(--color-card-foreground))',
        primary: {
          DEFAULT: 'hsl(var(--color-primary))', // Sky blue: 204 86% 53%
          foreground: 'hsl(var(--color-primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--color-secondary))',
          foreground: 'hsl(var(--color-secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--color-muted))',
          foreground: 'hsl(var(--color-muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--color-accent))',
          foreground: 'hsl(var(--color-accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--color-destructive))',
          foreground: 'hsl(var(--color-destructive-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--color-success))',
          foreground: 'hsl(var(--color-success-foreground))',
        },
        warning: {
          DEFAULT: 'hsl(var(--color-warning))',
          foreground: 'hsl(var(--color-warning-foreground))',
        },
        info: {
          DEFAULT: 'hsl(var(--color-info))',
          foreground: 'hsl(var(--color-info-foreground))',
        },
        border: 'hsl(var(--color-border))',
        input: 'hsl(var(--color-input))',
        ring: 'hsl(var(--color-ring))',

        // Financial-specific colors
        income: {
          DEFAULT: 'hsl(var(--color-income))',
          foreground: 'hsl(var(--color-income-foreground))',
        },
        expense: {
          DEFAULT: 'hsl(var(--color-expense))',
          foreground: 'hsl(var(--color-expense-foreground))',
        },
        savings: {
          DEFAULT: 'hsl(var(--color-savings))',
          foreground: 'hsl(var(--color-savings-foreground))',
        },
        investment: {
          DEFAULT: 'hsl(var(--color-investment))',
          foreground: 'hsl(var(--color-investment-foreground))',
        },
        budget: {
          DEFAULT: 'hsl(var(--color-budget))',
          foreground: 'hsl(var(--color-budget-foreground))',
        },
        neon: {
          cyan: '#00f3ff',
          blue: '#1a5bff',
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        display: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon': '0 0 10px rgba(0, 243, 255, 0.3), inset 0 0 10px rgba(0, 243, 255, 0.1)',
        'neon-strong': '0 0 20px rgba(0, 243, 255, 0.6), inset 0 0 15px rgba(0, 243, 255, 0.2)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      dropShadow: {
        'neon': '0 0 8px rgba(0, 243, 255, 0.8)',
      }
    },
  },
  plugins: [],
};

export default config;
