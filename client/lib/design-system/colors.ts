/**
 * Enhanced Color Palette for Personal Financial Management System
 * Comprehensive color system with semantic tokens, accessibility considerations,
 * and consistent dark/light mode support
 */

// Brand Colors - Primary financial theme
export const brandColors = {
  // Primary brand colors - Financial blue/teal theme
  primary: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6', // Main brand color
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
    950: '#042f2e',
  },
  
  // Secondary brand colors - Complementary purple
  secondary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87',
    950: '#3b0764',
  },
  
  // Accent colors for highlights and CTAs
  accent: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
    950: '#431407',
  },
} as const;

// Semantic Colors - Context-specific colors
export const semanticColors = {
  // Success states - Financial gains, positive actions
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },
  
  // Warning states - Caution, pending actions
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },
  
  // Error/Danger states - Financial losses, critical actions
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },
  
  // Info states - Informational content
  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
} as const;

// Neutral Colors - Backgrounds, text, borders
export const neutralColors = {
  // Light mode neutrals
  light: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },
  
  // Dark mode neutrals
  dark: {
    50: '#0a0a0a',
    100: '#171717',
    200: '#262626',
    300: '#404040',
    400: '#525252',
    500: '#737373',
    600: '#a3a3a3',
    700: '#d4d4d4',
    800: '#e5e5e5',
    900: '#f5f5f5',
    950: '#fafafa',
  },
} as const;

// Financial-specific colors
export const financialColors = {
  // Income/Revenue colors
  income: {
    light: '#22c55e',
    dark: '#4ade80',
    background: '#f0fdf4',
    foreground: '#14532d',
  },
  
  // Expense/Cost colors
  expense: {
    light: '#ef4444',
    dark: '#f87171',
    background: '#fef2f2',
    foreground: '#7f1d1d',
  },
  
  // Investment colors
  investment: {
    light: '#8b5cf6',
    dark: '#a78bfa',
    background: '#faf5ff',
    foreground: '#581c87',
  },
  
  // Savings colors
  savings: {
    light: '#06b6d4',
    dark: '#22d3ee',
    background: '#f0fdfa',
    foreground: '#164e63',
  },
  
  // Budget colors
  budget: {
    light: '#f59e0b',
    dark: '#fbbf24',
    background: '#fffbeb',
    foreground: '#78350f',
  },
} as const;

// Chart and visualization colors
export const chartColors = {
  primary: ['#14b8a6', '#0d9488', '#0f766e', '#115e59', '#134e4a'],
  categorical: [
    '#14b8a6', // Teal
    '#a855f7', // Purple
    '#f97316', // Orange
    '#22c55e', // Green
    '#ef4444', // Red
    '#3b82f6', // Blue
    '#f59e0b', // Amber
    '#ec4899', // Pink
  ],
  sequential: {
    teal: ['#f0fdfa', '#ccfbf1', '#99f6e4', '#5eead4', '#2dd4bf', '#14b8a6', '#0d9488', '#0f766e', '#115e59'],
    purple: ['#faf5ff', '#f3e8ff', '#e9d5ff', '#d8b4fe', '#c084fc', '#a855f7', '#9333ea', '#7c3aed', '#6b21a8'],
    blue: ['#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af'],
  },
  diverging: {
    redGreen: ['#7f1d1d', '#dc2626', '#f87171', '#fecaca', '#f5f5f5', '#bbf7d0', '#4ade80', '#16a34a', '#14532d'],
    blueOrange: ['#172554', '#1d4ed8', '#60a5fa', '#bfdbfe', '#f5f5f5', '#fed7aa', '#fb923c', '#ea580c', '#431407'],
  },
} as const;

// Accessibility helpers
export const accessibilityColors = {
  // High contrast pairs for accessibility
  highContrast: {
    light: {
      background: '#ffffff',
      foreground: '#000000',
      primary: '#0066cc',
      secondary: '#6b7280',
    },
    dark: {
      background: '#000000',
      foreground: '#ffffff',
      primary: '#3b82f6',
      secondary: '#9ca3af',
    },
  },
  
  // Focus indicators
  focus: {
    ring: '#3b82f6',
    ringOffset: '#ffffff',
    darkRing: '#60a5fa',
    darkRingOffset: '#000000',
  },
} as const;

// Color utility functions
export const colorUtils = {
  // Get color with opacity
  withOpacity: (color: string, opacity: number) => `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
  
  // Get semantic color based on value
  getFinancialColor: (value: number, type: 'income' | 'expense' | 'neutral' = 'neutral') => {
    if (type === 'income' || value > 0) return financialColors.income.light;
    if (type === 'expense' || value < 0) return financialColors.expense.light;
    return neutralColors.light[500];
  },
  
  // Get chart color by index
  getChartColor: (index: number) => chartColors.categorical[index % chartColors.categorical.length],
} as const;

export type BrandColor = keyof typeof brandColors;
export type SemanticColor = keyof typeof semanticColors;
export type NeutralShade = keyof typeof neutralColors.light;
export type FinancialColorType = keyof typeof financialColors;
