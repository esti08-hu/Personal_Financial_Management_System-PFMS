/**
 * Personal Financial Management System - Design System
 * Comprehensive design system with enhanced colors, typography, components, and interactions
 * 
 * @version 2.0.0
 * @author PFMS Design Team
 */

// Core utilities
export { cn } from "@/lib/utils"

// Color system
export * from "./colors"
export type {
  BrandColor,
  SemanticColor,
  NeutralShade,
  FinancialColorType,
} from "./colors"

// Typography system
export * from "./typography"
export type {
  TypographyVariant,
  TextColorVariant,
  TypographySize,
} from "./typography"

// Interaction patterns
export * from "./interactions"

// Enhanced components
export * from "./components"

// Form components
export * from "./forms"

// Chart components
export * from "./charts"

// Responsive utilities
export * from "./responsive"

// Design tokens
export const designTokens = {
  // Spacing scale (based on 4px grid)
  spacing: {
    xs: "0.25rem",    // 4px
    sm: "0.5rem",     // 8px
    md: "1rem",       // 16px
    lg: "1.5rem",     // 24px
    xl: "2rem",       // 32px
    "2xl": "3rem",    // 48px
    "3xl": "4rem",    // 64px
    "4xl": "6rem",    // 96px
  },

  // Border radius scale
  radius: {
    none: "0",
    sm: "0.25rem",    // 4px
    md: "0.5rem",     // 8px
    lg: "0.75rem",    // 12px
    xl: "1rem",       // 16px
    "2xl": "1.5rem",  // 24px
    full: "9999px",
  },

  // Shadow scale
  shadows: {
    xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    sm: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
    inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
  },

  // Animation durations
  duration: {
    fast: "150ms",
    normal: "200ms",
    slow: "300ms",
    slower: "500ms",
  },

  // Animation easings
  easing: {
    linear: "linear",
    in: "cubic-bezier(0.4, 0, 1, 1)",
    out: "cubic-bezier(0, 0, 0.2, 1)",
    inOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  },

  // Z-index scale
  zIndex: {
    hide: -1,
    auto: "auto",
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },
} as const

// Component size variants
export const sizeVariants = {
  xs: {
    height: "1.5rem",   // 24px
    padding: "0.25rem 0.5rem",
    fontSize: "0.75rem",
  },
  sm: {
    height: "2rem",     // 32px
    padding: "0.375rem 0.75rem",
    fontSize: "0.875rem",
  },
  md: {
    height: "2.5rem",   // 40px
    padding: "0.5rem 1rem",
    fontSize: "1rem",
  },
  lg: {
    height: "3rem",     // 48px
    padding: "0.75rem 1.5rem",
    fontSize: "1.125rem",
  },
  xl: {
    height: "3.5rem",   // 56px
    padding: "1rem 2rem",
    fontSize: "1.25rem",
  },
} as const

// Semantic color mappings for financial contexts
export const financialSemantics = {
  positive: "success",
  negative: "danger",
  neutral: "muted",
  income: "success",
  expense: "danger",
  investment: "info",
  savings: "primary",
  budget: "warning",
} as const

// Accessibility helpers
export const a11y = {
  // Screen reader only content
  srOnly: "sr-only",
  
  // Focus management
  focusRing: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  
  // Skip links
  skipLink: "absolute left-[-10000px] top-auto w-1 h-1 overflow-hidden focus:left-6 focus:top-6 focus:w-auto focus:h-auto focus:overflow-visible",
  
  // ARIA live regions
  liveRegion: "sr-only",
  
  // High contrast mode support
  highContrast: "forced-colors:border-[ButtonBorder] forced-colors:text-[ButtonText]",
} as const

// Layout patterns
export const layoutPatterns = {
  // Page layouts
  page: "min-h-screen bg-background text-foreground",
  pageContent: "container mx-auto px-4 py-8 md:px-6 lg:px-8",
  
  // Section layouts
  section: "py-12 md:py-16 lg:py-20",
  sectionContent: "container mx-auto px-4 md:px-6 lg:px-8",
  
  // Card layouts
  cardGrid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
  cardStack: "space-y-6",
  
  // Dashboard layouts
  dashboard: "grid grid-cols-1 lg:grid-cols-4 gap-6",
  dashboardMain: "lg:col-span-3 space-y-6",
  dashboardSidebar: "lg:col-span-1 space-y-6",
  
  // Form layouts
  form: "space-y-6 max-w-md mx-auto",
  formWide: "space-y-6 max-w-2xl mx-auto",
  formGrid: "grid grid-cols-1 md:grid-cols-2 gap-6",
} as const

// Component composition helpers
export const compose = {
  // Button compositions
  primaryButton: "btn-primary",
  secondaryButton: "btn-secondary",
  dangerButton: "btn-destructive",
  
  // Card compositions
  defaultCard: "enhanced-card",
  interactiveCard: "enhanced-card hover:shadow-lg hover:-translate-y-1 cursor-pointer",
  financialCard: "financial-card",
  
  // Input compositions
  defaultInput: "input-field",
  errorInput: "input-field input-error",
  successInput: "input-field input-success",
  
  // Text compositions
  heading: "text-heading-lg font-heading text-foreground",
  subheading: "text-heading-md font-heading text-foreground",
  body: "text-body-md font-body text-foreground",
  caption: "text-caption-md font-caption text-muted-foreground",
  
  // Financial text compositions
  amount: "font-mono font-semibold tabular-nums",
  positiveAmount: "font-mono font-semibold tabular-nums text-success-600",
  negativeAmount: "font-mono font-semibold tabular-nums text-danger-600",
  percentage: "font-mono font-medium tabular-nums text-sm",
} as const

// Theme configuration
export const themeConfig = {
  // Default theme
  default: {
    colors: "light",
    radius: "md",
    shadows: true,
    animations: true,
  },
  
  // Accessibility theme
  accessible: {
    colors: "high-contrast",
    radius: "sm",
    shadows: false,
    animations: false,
  },
  
  // Compact theme
  compact: {
    spacing: "tight",
    radius: "sm",
    shadows: false,
    animations: true,
  },
} as const

// Export version information
export const version = "2.0.0"
export const buildDate = new Date().toISOString()

// Export design system metadata
export const designSystem = {
  name: "PFMS Design System",
  version,
  buildDate,
  description: "Comprehensive design system for Personal Financial Management System",
  tokens: designTokens,
  patterns: layoutPatterns,
  semantics: financialSemantics,
  accessibility: a11y,
  composition: compose,
  themes: themeConfig,
} as const

// Type exports for better TypeScript support
export type DesignToken = keyof typeof designTokens
export type SizeVariant = keyof typeof sizeVariants
export type FinancialSemantic = keyof typeof financialSemantics
export type LayoutPattern = keyof typeof layoutPatterns
export type ThemeConfig = keyof typeof themeConfig
