/**
 * Enhanced Design System Components
 * Comprehensive component library with consistent styling and behavior
 */

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { financialFormatting } from "./typography"

// Enhanced Badge Component
const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:scale-105 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "bg-danger-500 text-white hover:bg-danger-600",
        success: "bg-success-500 text-white hover:bg-success-600",
        warning: "bg-warning-500 text-white hover:bg-warning-600",
        info: "bg-info-500 text-white hover:bg-info-600",
        outline: "border border-input bg-background text-foreground hover:bg-accent",
        ghost: "text-foreground hover:bg-accent",
        // Financial variants
        income: "bg-income/10 text-income border border-income/20 hover:bg-income/20",
        expense: "bg-expense/10 text-expense border border-expense/20 hover:bg-expense/20",
        investment: "bg-investment/10 text-investment border border-investment/20 hover:bg-investment/20",
        savings: "bg-savings/10 text-savings border border-savings/20 hover:bg-savings/20",
        budget: "bg-budget/10 text-budget border border-budget/20 hover:bg-budget/20",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        default: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
}

// Enhanced Financial Amount Component
interface FinancialAmountProps {
  amount: number
  currency?: string
  showSign?: boolean
  variant?: "default" | "large" | "small"
  colorCoded?: boolean
  className?: string
}

function FinancialAmount({ 
  amount, 
  currency = "ETB", 
  showSign = true, 
  variant = "default",
  colorCoded = true,
  className 
}: FinancialAmountProps) {
  const formattedAmount = financialFormatting.formatAmount(amount, currency, showSign)
  const colorClass = colorCoded ? financialFormatting.getAmountColor(amount) : ""
  
  const sizeClasses = {
    small: "text-sm font-medium",
    default: "text-base font-semibold",
    large: "text-lg font-bold",
  }

  return (
    <span className={cn(
      "font-mono tabular-nums",
      sizeClasses[variant],
      colorClass,
      className
    )}>
      {formattedAmount}
    </span>
  )
}

// Enhanced Percentage Component
interface PercentageProps {
  value: number
  decimals?: number
  showSign?: boolean
  colorCoded?: boolean
  threshold?: number
  className?: string
}

function Percentage({ 
  value, 
  decimals = 1, 
  showSign = true, 
  colorCoded = true, 
  threshold = 0,
  className 
}: PercentageProps) {
  const formattedValue = financialFormatting.formatPercentage(value, decimals)
  const sign = showSign && value !== 0 ? (value > 0 ? "+" : "") : ""
  const colorClass = colorCoded ? financialFormatting.getPercentageColor(value, threshold) : ""

  return (
    <span className={cn(
      "font-mono tabular-nums text-sm font-medium",
      colorClass,
      className
    )}>
      {sign}{formattedValue}
    </span>
  )
}

// Enhanced Status Indicator Component
const statusVariants = cva(
  "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium",
  {
    variants: {
      status: {
        active: "bg-success-50 text-success-700 border border-success-200",
        inactive: "bg-gray-50 text-gray-700 border border-gray-200",
        pending: "bg-warning-50 text-warning-700 border border-warning-200",
        error: "bg-danger-50 text-danger-700 border border-danger-200",
        processing: "bg-info-50 text-info-700 border border-info-200",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        default: "px-3 py-1 text-sm",
        lg: "px-4 py-1.5 text-base",
      },
    },
    defaultVariants: {
      status: "active",
      size: "default",
    },
  }
)

interface StatusIndicatorProps extends VariantProps<typeof statusVariants> {
  children: React.ReactNode
  showDot?: boolean
  className?: string
}

function StatusIndicator({ status, size, children, showDot = true, className }: StatusIndicatorProps) {
  const dotColors = {
    active: "bg-success-500",
    inactive: "bg-gray-500",
    pending: "bg-warning-500",
    error: "bg-danger-500",
    processing: "bg-info-500",
  }

  return (
    <div className={cn(statusVariants({ status, size }), className)}>
      {showDot && (
        <div className={cn("w-2 h-2 rounded-full", dotColors[status || "active"])} />
      )}
      {children}
    </div>
  )
}

// Enhanced Loading Skeleton Component
interface SkeletonProps {
  className?: string
  variant?: "text" | "circular" | "rectangular" | "rounded"
  width?: string | number
  height?: string | number
  lines?: number
}

function Skeleton({ 
  className, 
  variant = "rectangular", 
  width, 
  height, 
  lines = 1 
}: SkeletonProps) {
  const baseClasses = "animate-pulse bg-muted"
  
  const variantClasses = {
    text: "rounded h-4",
    circular: "rounded-full",
    rectangular: "rounded-none",
    rounded: "rounded-md",
  }

  if (variant === "text" && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              baseClasses,
              variantClasses[variant],
              i === lines - 1 ? "w-3/4" : "w-full",
              className
            )}
            style={{ width: i === lines - 1 ? "75%" : width, height }}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={{ width, height }}
    />
  )
}

// Enhanced Progress Component
interface ProgressProps {
  value: number
  max?: number
  variant?: "default" | "success" | "warning" | "danger"
  size?: "sm" | "default" | "lg"
  showLabel?: boolean
  className?: string
}

function Progress({ 
  value, 
  max = 100, 
  variant = "default", 
  size = "default", 
  showLabel = false,
  className 
}: ProgressProps) {
  const percentage = Math.min((value / max) * 100, 100)
  
  const variantClasses = {
    default: "bg-primary",
    success: "bg-success-500",
    warning: "bg-warning-500",
    danger: "bg-danger-500",
  }
  
  const sizeClasses = {
    sm: "h-1",
    default: "h-2",
    lg: "h-3",
  }

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between text-sm text-muted-foreground mb-1">
          <span>{percentage.toFixed(0)}%</span>
          <span>{value} / {max}</span>
        </div>
      )}
      <div className={cn("bg-muted rounded-full overflow-hidden", sizeClasses[size])}>
        <div
          className={cn("h-full transition-all duration-300 ease-in-out", variantClasses[variant])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// Enhanced Alert Component
const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground border-border",
        destructive: "border-danger-200 bg-danger-50 text-danger-800 [&>svg]:text-danger-600",
        success: "border-success-200 bg-success-50 text-success-800 [&>svg]:text-success-600",
        warning: "border-warning-200 bg-warning-50 text-warning-800 [&>svg]:text-warning-600",
        info: "border-info-200 bg-info-50 text-info-800 [&>svg]:text-info-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface AlertProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {}

function Alert({ className, variant, ...props }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5
      className={cn("mb-1 font-medium leading-none tracking-tight", className)}
      {...props}
    />
  )
}

function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <div
      className={cn("text-sm [&_p]:leading-relaxed", className)}
      {...props}
    />
  )
}

export {
  Badge,
  badgeVariants,
  FinancialAmount,
  Percentage,
  StatusIndicator,
  statusVariants,
  Skeleton,
  Progress,
  Alert,
  AlertTitle,
  AlertDescription,
  alertVariants,
}
