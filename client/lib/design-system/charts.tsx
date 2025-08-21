/**
 * Enhanced Chart and Visualization Components
 * Optimized for financial data with accessibility and dark mode support
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { chartColors, financialColors } from "./colors"

// Chart color utilities
export const getChartColors = (theme: 'light' | 'dark' = 'light') => ({
  primary: chartColors.categorical,
  sequential: chartColors.sequential.teal,
  diverging: chartColors.diverging.redGreen,
  financial: {
    income: theme === 'light' ? financialColors.income.light : financialColors.income.dark,
    expense: theme === 'light' ? financialColors.expense.light : financialColors.expense.dark,
    investment: theme === 'light' ? financialColors.investment.light : financialColors.investment.dark,
    savings: theme === 'light' ? financialColors.savings.light : financialColors.savings.dark,
    budget: theme === 'light' ? financialColors.budget.light : financialColors.budget.dark,
  },
})

// Enhanced Chart Container
interface ChartContainerProps {
  children: React.ReactNode
  className?: string
  title?: string
  description?: string
  config?: Record<string, any>
}

export function ChartContainer({ 
  children, 
  className, 
  title, 
  description,
  config 
}: ChartContainerProps) {
  return (
    <div className={cn("w-full", className)}>
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-foreground mb-1">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="relative">
        {children}
      </div>
    </div>
  )
}

// Enhanced Chart Legend
interface ChartLegendProps {
  items: Array<{
    label: string
    color: string
    value?: string | number
  }>
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

export function ChartLegend({ 
  items, 
  orientation = 'horizontal', 
  className 
}: ChartLegendProps) {
  return (
    <div className={cn(
      "flex gap-4",
      orientation === 'vertical' ? "flex-col" : "flex-wrap",
      className
    )}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-sm flex-shrink-0"
            style={{ backgroundColor: item.color ? item.color : 'var(--color-primary)' }}
          />
          <span className="text-sm text-foreground font-medium">
            {item.label}
          </span>
          {item.value && (
            <span className="text-sm text-muted-foreground ml-auto">
              {item.value}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

// Enhanced Chart Tooltip
interface ChartTooltipProps {
  active?: boolean
  payload?: any[]
  label?: string
  formatter?: (value: any, name: string) => [string, string]
  labelFormatter?: (label: string) => string
  className?: string
}

export function ChartTooltip({ 
  active, 
  payload, 
  label, 
  formatter,
  labelFormatter,
  className 
}: ChartTooltipProps) {
  if (!active || !payload || !payload.length) {
    return null
  }

  return (
    <div className={cn(
      "bg-card border border-border rounded-lg shadow-lg p-3 min-w-[150px]",
      "backdrop-blur-sm bg-card/95",
      className
    )}>
      {label && (
        <p className="text-sm font-medium text-foreground mb-2">
          {labelFormatter ? labelFormatter(label) : label}
        </p>
      )}
      <div className="space-y-1">
        {payload.map((entry, index) => {
          const [value, name] = formatter 
            ? formatter(entry.value, entry.name || entry.dataKey)
            : [entry.value, entry.name || entry.dataKey]
          
          return (
            <div key={index} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs text-muted-foreground">
                  {name}
                </span>
              </div>
              <span className="text-xs font-medium text-foreground">
                {value}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Financial Chart Wrapper with enhanced styling
interface FinancialChartProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  period?: string
  className?: string
  loading?: boolean
  error?: string
}

export function FinancialChart({ 
  children, 
  title, 
  subtitle, 
  period,
  className,
  loading = false,
  error 
}: FinancialChartProps) {
  if (loading) {
    return (
      <div className={cn(
        "bg-card border border-border rounded-xl p-6 shadow-sm",
        className
      )}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/3"></div>
          <div className="h-3 bg-muted rounded w-1/4"></div>
          <div className="h-48 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn(
        "bg-card border border-border rounded-xl p-6 shadow-sm",
        className
      )}>
        <div className="text-center py-8">
          <div className="text-danger-500 mb-2">
            <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "bg-card border border-border rounded-xl shadow-sm overflow-hidden",
      "hover:shadow-md transition-shadow duration-200",
      className
    )}>
      {(title || subtitle || period) && (
        <div className="p-6 pb-4 border-b border-border/50">
          <div className="flex items-start justify-between">
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-foreground">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-muted-foreground mt-1">
                  {subtitle}
                </p>
              )}
            </div>
            {period && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                {period}
              </span>
            )}
          </div>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  )
}

// Enhanced Metric Card for dashboard
interface MetricCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    period: string
  }
  icon?: React.ReactNode
  variant?: 'default' | 'income' | 'expense' | 'investment' | 'savings'
  className?: string
  loading?: boolean
}

export function MetricCard({ 
  title, 
  value, 
  change, 
  icon, 
  variant = 'default',
  className,
  loading = false 
}: MetricCardProps) {
  const variantStyles = {
    default: "bg-card border-border",
    income: "bg-gradient-to-br from-income/5 to-income/10 border-income/20",
    expense: "bg-gradient-to-br from-expense/5 to-expense/10 border-expense/20",
    investment: "bg-gradient-to-br from-investment/5 to-investment/10 border-investment/20",
    savings: "bg-gradient-to-br from-savings/5 to-savings/10 border-savings/20",
  }

  if (loading) {
    return (
      <div className={cn(
        "p-6 rounded-xl border shadow-sm",
        variantStyles[variant],
        className
      )}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded w-2/3"></div>
          <div className="h-8 bg-muted rounded w-1/2"></div>
          <div className="h-3 bg-muted rounded w-1/3"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "p-6 rounded-xl border shadow-sm transition-all duration-200",
      "hover:shadow-md hover:-translate-y-0.5",
      variantStyles[variant],
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-2">
            {title}
          </p>
          <p className="text-2xl font-bold text-foreground mb-1">
            {value}
          </p>
          {change && (
            <div className="flex items-center gap-1">
              <span className={cn(
                "text-xs font-medium",
                change.value > 0 ? "text-success-600" : 
                change.value < 0 ? "text-danger-600" : "text-muted-foreground"
              )}>
                {change.value > 0 ? "+" : ""}{change.value}%
              </span>
              <span className="text-xs text-muted-foreground">
                {change.period}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="text-muted-foreground">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

// Chart accessibility helpers
export const chartA11yProps = {
  role: "img",
  "aria-label": "Chart visualization",
  tabIndex: 0,
}

// Responsive chart dimensions
export const getResponsiveChartDimensions = (containerWidth: number) => ({
  width: containerWidth,
  height: Math.max(200, Math.min(400, containerWidth * 0.6)),
})
