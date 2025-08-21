/**
 * Enhanced Typography System for Personal Financial Management System
 * Comprehensive typography scale with semantic naming and consistent hierarchy
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Typography variants for consistent text styling
export const typographyVariants = {
  // Display text - For hero sections and major headings
  display: {
    "2xl": "text-display-2xl font-display tracking-tight text-foreground",
    xl: "text-display-xl font-display tracking-tight text-foreground",
    lg: "text-display-lg font-display tracking-tight text-foreground",
    md: "text-display-md font-display tracking-tight text-foreground",
    sm: "text-display-sm font-display tracking-tight text-foreground",
  },
  
  // Headings - For section titles and content hierarchy
  heading: {
    xl: "text-heading-xl font-heading tracking-tight text-foreground",
    lg: "text-heading-lg font-heading tracking-tight text-foreground",
    md: "text-heading-md font-heading tracking-tight text-foreground",
    sm: "text-heading-sm font-heading tracking-tight text-foreground",
    xs: "text-heading-xs font-heading tracking-tight text-foreground",
  },
  
  // Body text - For main content and descriptions
  body: {
    xl: "text-body-xl font-body text-foreground",
    lg: "text-body-lg font-body text-foreground",
    md: "text-body-md font-body text-foreground",
    sm: "text-body-sm font-body text-foreground",
    xs: "text-body-xs font-body text-foreground",
  },
  
  // Caption text - For labels, metadata, and secondary information
  caption: {
    lg: "text-caption-lg font-caption text-muted-foreground",
    md: "text-caption-md font-caption text-muted-foreground",
    sm: "text-caption-sm font-caption text-muted-foreground",
  },
  
  // Specialized text variants
  label: "text-caption-md font-label text-foreground",
  button: "text-body-sm font-button text-current",
  link: "text-body-md font-body text-primary hover:text-primary/80 underline-offset-4 hover:underline",
  code: "text-body-sm font-mono bg-muted px-1.5 py-0.5 rounded-md text-foreground",
  
  // Financial-specific text variants
  financial: {
    amount: "text-heading-md font-mono font-semibold tabular-nums",
    currency: "text-caption-sm font-medium text-muted-foreground uppercase tracking-wider",
    percentage: "text-body-sm font-medium tabular-nums",
    date: "text-caption-md font-medium text-muted-foreground",
  },
} as const;

// Color variants for different text contexts
export const textColorVariants = {
  // Semantic colors
  default: "text-foreground",
  muted: "text-muted-foreground",
  primary: "text-primary",
  secondary: "text-secondary-foreground",
  success: "text-success-600",
  warning: "text-warning-600",
  danger: "text-danger-600",
  info: "text-info-600",
  
  // Financial colors
  income: "text-income",
  expense: "text-expense",
  investment: "text-investment",
  savings: "text-savings",
  budget: "text-budget",
  
  // Contextual colors
  positive: "text-success-600",
  negative: "text-danger-600",
  neutral: "text-muted-foreground",
} as const;

// Typography utility function
export function typography(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper function to get typography classes
export function getTypographyClasses(
  variant: keyof typeof typographyVariants,
  size?: string,
  color?: keyof typeof textColorVariants
) {
  let baseClasses = "";
  
  if (variant === "financial") {
    const financialVariant = size as keyof typeof typographyVariants.financial;
    baseClasses = typographyVariants.financial[financialVariant] || typographyVariants.financial.amount;
  } else if (typeof typographyVariants[variant] === "object" && size) {
    const variantObj = typographyVariants[variant] as Record<string, string>;
    baseClasses = variantObj[size] || "";
  } else if (typeof typographyVariants[variant] === "string") {
    baseClasses = typographyVariants[variant] as string;
  }
  
  const colorClass = color ? textColorVariants[color] : "";
  
  return typography(baseClasses, colorClass);
}

// Financial amount formatting utilities
export const financialFormatting = {
  // Format currency amounts with proper styling
  formatAmount: (amount: number, currency = "ETB", showSign = true) => {
    const sign = showSign && amount !== 0 ? (amount > 0 ? "+" : "") : "";
    const formattedAmount = Math.abs(amount).toLocaleString();
    return `${sign}${formattedAmount} ${currency}`;
  },
  
  // Get color class based on amount value
  getAmountColor: (amount: number) => {
    if (amount > 0) return textColorVariants.income;
    if (amount < 0) return textColorVariants.expense;
    return textColorVariants.neutral;
  },
  
  // Format percentage with styling
  formatPercentage: (value: number, decimals = 1) => {
    return `${value.toFixed(decimals)}%`;
  },
  
  // Get percentage color class
  getPercentageColor: (value: number, threshold = 0) => {
    if (value > threshold) return textColorVariants.positive;
    if (value < threshold) return textColorVariants.negative;
    return textColorVariants.neutral;
  },
} as const;

// Responsive typography utilities
export const responsiveTypography = {
  // Responsive display text
  displayResponsive: "text-display-md md:text-display-lg lg:text-display-xl xl:text-display-2xl",
  headingResponsive: "text-heading-sm md:text-heading-md lg:text-heading-lg",
  bodyResponsive: "text-body-sm md:text-body-md",
  
  // Mobile-first responsive classes
  mobile: {
    display: "text-display-sm font-display tracking-tight",
    heading: "text-heading-sm font-heading tracking-tight",
    body: "text-body-sm font-body",
    caption: "text-caption-sm font-caption",
  },
  
  tablet: {
    display: "md:text-display-md",
    heading: "md:text-heading-md",
    body: "md:text-body-md",
    caption: "md:text-caption-md",
  },
  
  desktop: {
    display: "lg:text-display-lg xl:text-display-xl",
    heading: "lg:text-heading-lg",
    body: "lg:text-body-lg",
    caption: "lg:text-caption-lg",
  },
} as const;

// Text truncation utilities
export const textTruncation = {
  truncate: "truncate",
  ellipsis: "text-ellipsis overflow-hidden",
  clamp: {
    1: "line-clamp-1",
    2: "line-clamp-2",
    3: "line-clamp-3",
    4: "line-clamp-4",
    5: "line-clamp-5",
    6: "line-clamp-6",
  },
} as const;

// Export types for TypeScript support
export type TypographyVariant = keyof typeof typographyVariants;
export type TextColorVariant = keyof typeof textColorVariants;
export type TypographySize = string;

// Default typography configurations for common components
export const componentTypography = {
  button: {
    primary: typography(typographyVariants.button, textColorVariants.default),
    secondary: typography(typographyVariants.button, textColorVariants.muted),
  },
  
  card: {
    title: typography(typographyVariants.heading.md, textColorVariants.default),
    description: typography(typographyVariants.body.sm, textColorVariants.muted),
    content: typography(typographyVariants.body.md, textColorVariants.default),
  },
  
  form: {
    label: typography(typographyVariants.label, textColorVariants.default),
    input: typography(typographyVariants.body.md, textColorVariants.default),
    error: typography(typographyVariants.caption.sm, textColorVariants.danger),
    help: typography(typographyVariants.caption.sm, textColorVariants.muted),
  },
  
  table: {
    header: typography(typographyVariants.caption.lg, textColorVariants.muted),
    cell: typography(typographyVariants.body.sm, textColorVariants.default),
    numeric: typography(typographyVariants.body.sm, "font-mono tabular-nums", textColorVariants.default),
  },
  
  navigation: {
    primary: typography(typographyVariants.body.md, textColorVariants.default),
    secondary: typography(typographyVariants.body.sm, textColorVariants.muted),
    active: typography(typographyVariants.body.md, textColorVariants.primary),
  },
} as const;
