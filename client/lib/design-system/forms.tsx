/**
 * Enhanced Form Components
 * Modern form controls with validation states and accessibility
 */

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Enhanced Form Field Component
interface FormFieldProps {
  label?: string
  description?: string
  error?: string
  required?: boolean
  children: React.ReactNode
  className?: string
}

export function FormField({ 
  label, 
  description, 
  error, 
  required, 
  children, 
  className 
}: FormFieldProps) {
  const id = React.useId()
  
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label 
          htmlFor={id}
          className="text-sm font-medium text-foreground block"
        >
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {React.cloneElement(children as React.ReactElement, { 
          id,
          "aria-invalid": !!error,
          "aria-describedby": description || error ? `${id}-description` : undefined,
        })}
      </div>
      
      {(description || error) && (
        <div id={`${id}-description`} className="space-y-1">
          {error && (
            <p className="text-sm text-danger-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </p>
          )}
          {description && !error && (
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// Enhanced Select Component
const selectVariants = cva(
  "flex h-9 w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-sm transition-all duration-200 placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-input hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20",
        error: "border-danger-500 focus:border-danger-500 focus:ring-2 focus:ring-danger-500/20",
        success: "border-success-500 focus:border-success-500 focus:ring-2 focus:ring-success-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement>, VariantProps<typeof selectVariants> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, variant, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          className={cn(selectVariants({ variant }), "appearance-none pr-8", className)}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    )
  }
)

Select.displayName = "Select"

// Enhanced Textarea Component
const textareaVariants = cva(
  "flex min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm transition-all duration-200 placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-none",
  {
    variants: {
      variant: {
        default: "border-input hover:border-primary/50 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20",
        error: "border-danger-500 focus-visible:border-danger-500 focus-visible:ring-2 focus-visible:ring-danger-500/20",
        success: "border-success-500 focus-visible:border-success-500 focus-visible:ring-2 focus-visible:ring-success-500/20",
      },
      resize: {
        none: "resize-none",
        vertical: "resize-y",
        horizontal: "resize-x",
        both: "resize",
      },
    },
    defaultVariants: {
      variant: "default",
      resize: "vertical",
    },
  }
)

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement>, VariantProps<typeof textareaVariants> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, resize, ...props }, ref) => {
    return (
      <textarea
        className={cn(textareaVariants({ variant, resize }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)

Textarea.displayName = "Textarea"

// Enhanced Checkbox Component
interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  description?: string
  variant?: 'default' | 'success' | 'warning' | 'danger'
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, variant = 'default', ...props }, ref) => {
    const id = React.useId()
    
    const variantStyles = {
      default: "border-input focus:ring-primary/20 checked:bg-primary checked:border-primary",
      success: "border-success-500 focus:ring-success-500/20 checked:bg-success-500 checked:border-success-500",
      warning: "border-warning-500 focus:ring-warning-500/20 checked:bg-warning-500 checked:border-warning-500",
      danger: "border-danger-500 focus:ring-danger-500/20 checked:bg-danger-500 checked:border-danger-500",
    }

    return (
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id={id}
          className={cn(
            "w-4 h-4 rounded border-2 bg-background transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-offset-2",
            "checked:text-white disabled:opacity-50 disabled:cursor-not-allowed",
            variantStyles[variant],
            className
          )}
          ref={ref}
          {...props}
        />
        {(label || description) && (
          <div className="flex-1">
            {label && (
              <label htmlFor={id} className="text-sm font-medium text-foreground cursor-pointer">
                {label}
              </label>
            )}
            {description && (
              <p className="text-sm text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }
)

Checkbox.displayName = "Checkbox"

// Enhanced Radio Group Component
interface RadioOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

interface RadioGroupProps {
  name: string
  options: RadioOption[]
  value?: string
  onChange?: (value: string) => void
  variant?: 'default' | 'success' | 'warning' | 'danger'
  orientation?: 'vertical' | 'horizontal'
  className?: string
}

export function RadioGroup({ 
  name, 
  options, 
  value, 
  onChange, 
  variant = 'default',
  orientation = 'vertical',
  className 
}: RadioGroupProps) {
  const variantStyles = {
    default: "border-input focus:ring-primary/20 checked:bg-primary checked:border-primary",
    success: "border-success-500 focus:ring-success-500/20 checked:bg-success-500 checked:border-success-500",
    warning: "border-warning-500 focus:ring-warning-500/20 checked:bg-warning-500 checked:border-warning-500",
    danger: "border-danger-500 focus:ring-danger-500/20 checked:bg-danger-500 checked:border-danger-500",
  }

  return (
    <div className={cn(
      "space-y-3",
      orientation === 'horizontal' && "flex flex-wrap gap-6 space-y-0",
      className
    )}>
      {options.map((option) => (
        <div key={option.value} className="flex items-start gap-3">
          <input
            type="radio"
            id={`${name}-${option.value}`}
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={option.disabled}
            className={cn(
              "w-4 h-4 rounded-full border-2 bg-background transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-offset-2",
              "checked:text-white disabled:opacity-50 disabled:cursor-not-allowed",
              variantStyles[variant]
            )}
          />
          <div className="flex-1">
            <label 
              htmlFor={`${name}-${option.value}`} 
              className={cn(
                "text-sm font-medium cursor-pointer",
                option.disabled ? "text-muted-foreground" : "text-foreground"
              )}
            >
              {option.label}
            </label>
            {option.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {option.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// Enhanced Switch Component
interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  description?: string
  size?: 'sm' | 'default' | 'lg'
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, description, size = 'default', ...props }, ref) => {
    const id = React.useId()
    
    const sizeStyles = {
      sm: "w-8 h-4",
      default: "w-10 h-5",
      lg: "w-12 h-6",
    }
    
    const thumbSizeStyles = {
      sm: "w-3 h-3",
      default: "w-4 h-4",
      lg: "w-5 h-5",
    }

    return (
      <div className="flex items-start gap-3">
        <div className="relative">
          <input
            type="checkbox"
            id={id}
            className="sr-only"
            ref={ref}
            {...props}
          />
          <label
            htmlFor={id}
            className={cn(
              "relative inline-flex cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200",
              "focus-within:ring-2 focus-within:ring-primary/20 focus-within:ring-offset-2",
              "bg-muted checked:bg-primary",
              sizeStyles[size],
              className
            )}
          >
            <span
              className={cn(
                "inline-block rounded-full bg-white shadow-sm transition-transform duration-200",
                "translate-x-0 checked:translate-x-full",
                thumbSizeStyles[size]
              )}
            />
          </label>
        </div>
        {(label || description) && (
          <div className="flex-1">
            {label && (
              <label htmlFor={id} className="text-sm font-medium text-foreground cursor-pointer">
                {label}
              </label>
            )}
            {description && (
              <p className="text-sm text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }
)

Switch.displayName = "Switch"
