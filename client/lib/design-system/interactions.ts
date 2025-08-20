/**
 * Enhanced Interactive States and Visual Feedback System
 * Comprehensive interaction patterns for better user experience
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Base interaction utilities
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Interactive state variants
export const interactionVariants = {
  // Hover effects
  hover: {
    subtle: "hover:bg-muted/50 transition-colors duration-200",
    lift: "hover:shadow-md hover:-translate-y-0.5 transition-all duration-200",
    scale: "hover:scale-105 transition-transform duration-200",
    glow: "hover:shadow-lg hover:shadow-primary/25 transition-shadow duration-200",
    brighten: "hover:brightness-110 transition-all duration-200",
    fade: "hover:opacity-80 transition-opacity duration-200",
  },
  
  // Focus states
  focus: {
    ring: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    primary: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
    success: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success-500 focus-visible:ring-offset-2",
    warning: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning-500 focus-visible:ring-offset-2",
    danger: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger-500 focus-visible:ring-offset-2",
    subtle: "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
  },
  
  // Active states
  active: {
    scale: "active:scale-95 transition-transform duration-100",
    press: "active:translate-y-0.5 transition-transform duration-100",
    dim: "active:opacity-70 transition-opacity duration-100",
    glow: "active:shadow-inner transition-shadow duration-100",
  },
  
  // Disabled states
  disabled: {
    default: "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
    subtle: "disabled:opacity-60 disabled:cursor-not-allowed",
    muted: "disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed",
  },
  
  // Loading states
  loading: {
    pulse: "animate-pulse",
    spin: "animate-spin",
    bounce: "animate-bounce",
    ping: "animate-ping",
    skeleton: "animate-pulse bg-muted rounded",
  },
} as const;

// Button interaction patterns
export const buttonInteractions = {
  // Primary button interactions
  primary: cn(
    "bg-primary text-primary-foreground",
    interactionVariants.hover.brighten,
    interactionVariants.focus.primary,
    interactionVariants.active.scale,
    interactionVariants.disabled.default,
    "transition-all duration-200 ease-in-out"
  ),
  
  // Secondary button interactions
  secondary: cn(
    "bg-secondary text-secondary-foreground border border-input",
    interactionVariants.hover.subtle,
    interactionVariants.focus.ring,
    interactionVariants.active.scale,
    interactionVariants.disabled.default,
    "transition-all duration-200 ease-in-out"
  ),
  
  // Ghost button interactions
  ghost: cn(
    "text-foreground",
    interactionVariants.hover.subtle,
    interactionVariants.focus.ring,
    interactionVariants.active.scale,
    interactionVariants.disabled.default,
    "transition-all duration-200 ease-in-out"
  ),
  
  // Destructive button interactions
  destructive: cn(
    "bg-danger-500 text-white",
    "hover:bg-danger-600",
    interactionVariants.focus.danger,
    interactionVariants.active.scale,
    interactionVariants.disabled.default,
    "transition-all duration-200 ease-in-out"
  ),
  
  // Success button interactions
  success: cn(
    "bg-success-500 text-white",
    "hover:bg-success-600",
    interactionVariants.focus.success,
    interactionVariants.active.scale,
    interactionVariants.disabled.default,
    "transition-all duration-200 ease-in-out"
  ),
  
  // Warning button interactions
  warning: cn(
    "bg-warning-500 text-white",
    "hover:bg-warning-600",
    interactionVariants.focus.warning,
    interactionVariants.active.scale,
    interactionVariants.disabled.default,
    "transition-all duration-200 ease-in-out"
  ),
} as const;

// Card interaction patterns
export const cardInteractions = {
  // Basic card with subtle hover
  default: cn(
    "bg-card text-card-foreground border border-border rounded-lg shadow-sm",
    interactionVariants.hover.subtle,
    "transition-all duration-200"
  ),
  
  // Interactive card with lift effect
  interactive: cn(
    "bg-card text-card-foreground border border-border rounded-lg shadow-sm cursor-pointer",
    interactionVariants.hover.lift,
    interactionVariants.focus.ring,
    interactionVariants.active.scale,
    "transition-all duration-200"
  ),
  
  // Clickable card with glow effect
  clickable: cn(
    "bg-card text-card-foreground border border-border rounded-lg shadow-sm cursor-pointer",
    interactionVariants.hover.glow,
    interactionVariants.focus.ring,
    interactionVariants.active.press,
    "transition-all duration-200"
  ),
  
  // Financial card with enhanced styling
  financial: cn(
    "bg-gradient-to-br from-card to-card/80 backdrop-blur-sm border border-border/50 rounded-xl shadow-sm",
    interactionVariants.hover.lift,
    "transition-all duration-300"
  ),
} as const;

// Input interaction patterns
export const inputInteractions = {
  // Default input styling
  default: cn(
    "border border-input bg-background rounded-md px-3 py-2",
    "placeholder:text-muted-foreground",
    "focus:border-primary focus:ring-2 focus:ring-primary/20",
    interactionVariants.disabled.muted,
    "transition-all duration-200"
  ),
  
  // Enhanced input with better focus
  enhanced: cn(
    "border border-input bg-background rounded-md px-3 py-2",
    "placeholder:text-muted-foreground",
    "focus:border-primary focus:ring-2 focus:ring-primary/20 focus:shadow-sm",
    "hover:border-primary/50",
    interactionVariants.disabled.muted,
    "transition-all duration-200"
  ),
  
  // Error state input
  error: cn(
    "border border-danger-500 bg-background rounded-md px-3 py-2",
    "placeholder:text-muted-foreground",
    "focus:border-danger-500 focus:ring-2 focus:ring-danger-500/20",
    interactionVariants.disabled.muted,
    "transition-all duration-200"
  ),
  
  // Success state input
  success: cn(
    "border border-success-500 bg-background rounded-md px-3 py-2",
    "placeholder:text-muted-foreground",
    "focus:border-success-500 focus:ring-2 focus:ring-success-500/20",
    interactionVariants.disabled.muted,
    "transition-all duration-200"
  ),
} as const;

// Table interaction patterns
export const tableInteractions = {
  // Table row hover
  row: cn(
    interactionVariants.hover.subtle,
    "transition-colors duration-150"
  ),
  
  // Clickable table row
  rowClickable: cn(
    "cursor-pointer",
    interactionVariants.hover.subtle,
    interactionVariants.focus.subtle,
    "transition-colors duration-150"
  ),
  
  // Table header
  header: cn(
    "font-medium text-muted-foreground",
    "hover:text-foreground transition-colors duration-150"
  ),
  
  // Sortable table header
  headerSortable: cn(
    "font-medium text-muted-foreground cursor-pointer select-none",
    "hover:text-foreground hover:bg-muted/50 transition-colors duration-150"
  ),
} as const;

// Navigation interaction patterns
export const navigationInteractions = {
  // Navigation link
  link: cn(
    "text-muted-foreground",
    "hover:text-foreground hover:bg-muted/50 rounded-md px-2 py-1",
    interactionVariants.focus.subtle,
    "transition-all duration-200"
  ),
  
  // Active navigation link
  linkActive: cn(
    "text-primary bg-primary/10",
    "hover:bg-primary/20 rounded-md px-2 py-1",
    interactionVariants.focus.primary,
    "transition-all duration-200"
  ),
  
  // Navigation button
  button: cn(
    "text-foreground",
    interactionVariants.hover.subtle,
    interactionVariants.focus.ring,
    interactionVariants.active.scale,
    "rounded-md px-3 py-2 transition-all duration-200"
  ),
} as const;

// Loading and skeleton patterns
export const loadingPatterns = {
  // Skeleton loader
  skeleton: cn(
    "animate-pulse bg-muted rounded",
    "relative overflow-hidden",
    "before:absolute before:inset-0",
    "before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
    "before:animate-shimmer"
  ),
  
  // Pulse loader
  pulse: cn(
    "animate-pulse bg-muted/50 rounded"
  ),
  
  // Spinner
  spinner: cn(
    "animate-spin rounded-full border-2 border-muted border-t-primary"
  ),
  
  // Loading overlay
  overlay: cn(
    "absolute inset-0 bg-background/80 backdrop-blur-sm",
    "flex items-center justify-center",
    "transition-opacity duration-200"
  ),
} as const;

// Feedback patterns for financial data
export const financialFeedback = {
  // Positive financial change
  positive: cn(
    "text-success-600 bg-success-50 border border-success-200",
    "rounded-md px-2 py-1 text-sm font-medium",
    "transition-all duration-200"
  ),
  
  // Negative financial change
  negative: cn(
    "text-danger-600 bg-danger-50 border border-danger-200",
    "rounded-md px-2 py-1 text-sm font-medium",
    "transition-all duration-200"
  ),
  
  // Neutral financial change
  neutral: cn(
    "text-muted-foreground bg-muted border border-border",
    "rounded-md px-2 py-1 text-sm font-medium",
    "transition-all duration-200"
  ),
  
  // Financial amount with color coding
  amount: (value: number) => cn(
    "font-mono font-semibold tabular-nums",
    value > 0 ? "text-success-600" : value < 0 ? "text-danger-600" : "text-muted-foreground"
  ),
} as const;

// Animation utilities
export const animations = {
  // Entrance animations
  fadeIn: "animate-in fade-in duration-200",
  slideIn: "animate-in slide-in-from-bottom-4 duration-300",
  scaleIn: "animate-in zoom-in-95 duration-200",
  
  // Exit animations
  fadeOut: "animate-out fade-out duration-200",
  slideOut: "animate-out slide-out-to-bottom-4 duration-300",
  scaleOut: "animate-out zoom-out-95 duration-200",
  
  // Bounce effect
  bounce: "animate-bounce",
  
  // Pulse effect
  pulse: "animate-pulse",
  
  // Spin effect
  spin: "animate-spin",
} as const;
