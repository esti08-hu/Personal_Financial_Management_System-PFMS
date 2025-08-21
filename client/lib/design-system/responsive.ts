/**
 * Enhanced Mobile Responsiveness System
 * Comprehensive responsive design utilities and mobile-first approach
 */

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Responsive utility function
export function responsive(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Breakpoint definitions
export const breakpoints = {
  xs: '375px',    // Small phones
  sm: '640px',    // Large phones
  md: '768px',    // Tablets
  lg: '1024px',   // Small laptops
  xl: '1280px',   // Large laptops
  '2xl': '1536px', // Desktops
} as const

// Mobile-first responsive patterns
export const responsivePatterns = {
  // Container patterns
  container: {
    mobile: "px-4 mx-auto max-w-full",
    tablet: "md:px-6 md:max-w-3xl",
    desktop: "lg:px-8 lg:max-w-7xl",
    full: "px-4 md:px-6 lg:px-8 mx-auto max-w-full md:max-w-3xl lg:max-w-7xl",
  },

  // Grid patterns
  grid: {
    responsive: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6",
    cards: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6",
    dashboard: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6",
    financial: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6",
  },

  // Flex patterns
  flex: {
    stack: "flex flex-col space-y-4 md:space-y-6",
    stackHorizontal: "flex flex-col md:flex-row md:space-x-6 md:space-y-0 space-y-4",
    center: "flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6",
    between: "flex flex-col md:flex-row md:items-center md:justify-between gap-4",
  },

  // Typography patterns
  typography: {
    heading: "text-xl md:text-2xl lg:text-3xl font-bold",
    subheading: "text-lg md:text-xl lg:text-2xl font-semibold",
    body: "text-sm md:text-base",
    caption: "text-xs md:text-sm",
    display: "text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold",
  },

  // Spacing patterns
  spacing: {
    section: "py-8 md:py-12 lg:py-16",
    component: "p-4 md:p-6 lg:p-8",
    tight: "p-3 md:p-4",
    loose: "p-6 md:p-8 lg:p-12",
  },
} as const

// Touch target utilities for mobile
export const touchTargets = {
  // Minimum touch target sizes (44px recommended)
  button: "min-h-[44px] min-w-[44px] touch-manipulation",
  link: "min-h-[44px] inline-flex items-center touch-manipulation",
  icon: "w-11 h-11 flex items-center justify-center touch-manipulation",
  
  // Interactive elements
  interactive: "touch-manipulation select-none",
  
  // Tap highlights
  tapHighlight: "tap-highlight-transparent active:bg-muted/50 transition-colors",
} as const

// Mobile navigation patterns
export const mobileNavigation = {
  // Mobile menu
  mobileMenu: "fixed inset-0 z-50 bg-background/95 backdrop-blur-sm md:hidden",
  mobileMenuContent: "fixed inset-y-0 left-0 z-50 w-3/4 max-w-sm bg-card border-r shadow-lg md:hidden",
  mobileMenuOverlay: "fixed inset-0 z-40 bg-black/50 md:hidden",
  
  // Bottom navigation
  bottomNav: "fixed bottom-0 left-0 right-0 z-40 bg-card border-t shadow-lg md:hidden",
  bottomNavItem: "flex-1 flex flex-col items-center justify-center py-2 px-1 min-h-[60px] touch-manipulation",
  
  // Tab bar
  tabBar: "flex overflow-x-auto scrollbar-hide border-b bg-card",
  tabItem: "flex-shrink-0 px-4 py-3 text-sm font-medium whitespace-nowrap touch-manipulation min-w-[80px]",
} as const

// Mobile form patterns
export const mobileForm = {
  // Form layouts
  formStack: "space-y-4 md:space-y-6",
  formGrid: "grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6",
  
  // Input sizing for mobile
  input: "h-12 md:h-10 text-base md:text-sm", // Larger on mobile to prevent zoom
  button: "h-12 md:h-10 text-base md:text-sm font-medium",
  
  // Form sections
  section: "space-y-4 p-4 md:p-6 bg-card rounded-lg border",
  sectionTitle: "text-lg md:text-xl font-semibold mb-4",
} as const

// Mobile table patterns
export const mobileTable = {
  // Responsive table wrapper
  wrapper: "overflow-x-auto scrollbar-hide",
  
  // Mobile card view for tables
  cardView: "block md:hidden space-y-4",
  cardItem: "bg-card border rounded-lg p-4 space-y-2",
  cardLabel: "text-sm font-medium text-muted-foreground",
  cardValue: "text-sm text-foreground",
  
  // Desktop table view
  tableView: "hidden md:block",
  
  // Horizontal scroll indicators
  scrollIndicator: "relative after:absolute after:top-0 after:right-0 after:bottom-0 after:w-8 after:bg-gradient-to-l after:from-background after:pointer-events-none",
} as const

// Mobile modal patterns
export const mobileModal = {
  // Full screen on mobile, centered on desktop
  overlay: "fixed inset-0 z-50 bg-black/50",
  content: "fixed inset-x-0 bottom-0 z-50 bg-card rounded-t-xl md:relative md:inset-auto md:rounded-xl md:max-w-lg md:mx-auto md:mt-20",
  
  // Drawer style
  drawer: "fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-card shadow-lg md:max-w-md",
  drawerOverlay: "fixed inset-0 z-40 bg-black/50",
  
  // Bottom sheet
  bottomSheet: "fixed inset-x-0 bottom-0 z-50 bg-card rounded-t-xl max-h-[90vh] overflow-hidden",
  bottomSheetHandle: "w-12 h-1 bg-muted rounded-full mx-auto mt-3 mb-4",
} as const

// Responsive image patterns
export const responsiveImages = {
  // Aspect ratios
  square: "aspect-square",
  video: "aspect-video",
  photo: "aspect-[4/3]",
  wide: "aspect-[16/9]",
  
  // Responsive sizing
  avatar: "w-8 h-8 md:w-10 md:h-10 rounded-full",
  icon: "w-5 h-5 md:w-6 md:h-6",
  logo: "h-8 md:h-10 w-auto",
  
  // Object fit
  cover: "object-cover",
  contain: "object-contain",
  fill: "object-fill",
} as const

// Mobile-specific utilities
export const mobileUtils = {
  // Prevent zoom on input focus (iOS)
  preventZoom: "text-base", // 16px minimum to prevent zoom
  
  // Safe area handling
  safeArea: {
    top: "pt-safe-top",
    bottom: "pb-safe-bottom",
    left: "pl-safe-left",
    right: "pr-safe-right",
    all: "p-safe",
  },
  
  // Scroll behavior
  scroll: {
    smooth: "scroll-smooth",
    snap: "scroll-snap-type-y-mandatory",
    snapItem: "scroll-snap-align-start",
    hideScrollbar: "scrollbar-hide",
  },
  
  // Performance optimizations
  performance: {
    willChange: "will-change-transform",
    transform3d: "transform-gpu",
    backfaceHidden: "backface-visibility-hidden",
  },
} as const

// Responsive visibility utilities
export const responsiveVisibility = {
  // Show/hide at different breakpoints
  mobileOnly: "block md:hidden",
  tabletOnly: "hidden md:block lg:hidden",
  desktopOnly: "hidden lg:block",
  
  // Progressive disclosure
  showOnMobile: "block",
  showOnTablet: "hidden md:block",
  showOnDesktop: "hidden lg:block",
  
  hideOnMobile: "hidden md:block",
  hideOnTablet: "block md:hidden lg:block",
  hideOnDesktop: "block lg:hidden",
} as const

// Responsive layout helpers
export const layoutHelpers = {
  // Center content
  center: "flex items-center justify-center min-h-screen p-4",
  
  // Full height layouts
  fullHeight: "min-h-screen flex flex-col",
  
  // Sticky elements
  stickyHeader: "sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b",
  stickyFooter: "sticky bottom-0 z-40 bg-background/95 backdrop-blur-sm border-t",
  
  // Overflow handling
  overflowHidden: "overflow-hidden",
  overflowScroll: "overflow-auto",
  overflowXScroll: "overflow-x-auto overflow-y-hidden",
  overflowYScroll: "overflow-y-auto overflow-x-hidden",
} as const

// Export utility function to get responsive classes
export function getResponsiveClasses(pattern: keyof typeof responsivePatterns, variant: string) {
  const patternObj = responsivePatterns[pattern] as Record<string, string>
  return patternObj[variant] || ""
}

// Export function to combine responsive utilities
export function combineResponsive(...patterns: string[]) {
  return responsive(...patterns)
}

// Media query helpers for JavaScript
export const mediaQueries = {
  xs: `(min-width: ${breakpoints.xs})`,
  sm: `(min-width: ${breakpoints.sm})`,
  md: `(min-width: ${breakpoints.md})`,
  lg: `(min-width: ${breakpoints.lg})`,
  xl: `(min-width: ${breakpoints.xl})`,
  '2xl': `(min-width: ${breakpoints['2xl']})`,
  
  // Orientation queries
  portrait: '(orientation: portrait)',
  landscape: '(orientation: landscape)',
  
  // Touch device detection
  touch: '(hover: none) and (pointer: coarse)',
  mouse: '(hover: hover) and (pointer: fine)',
  
  // Reduced motion
  reducedMotion: '(prefers-reduced-motion: reduce)',
  
  // Dark mode
  dark: '(prefers-color-scheme: dark)',
  light: '(prefers-color-scheme: light)',
} as const
