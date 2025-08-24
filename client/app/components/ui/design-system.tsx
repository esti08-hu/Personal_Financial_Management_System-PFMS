"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Unified button component with enhanced styling
interface EnhancedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "success" | "warning" | "destructive" | "outline"
  size?: "sm" | "md" | "lg"
}

export const EnhancedButton = React.forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(
          "enhanced-badge transition-all duration-200 ease-in-out",
          {
            primary: "btn-primary",
            secondary: "btn-secondary",
            success: "btn-success",
            warning: "btn-warning",
            destructive: "btn-destructive",
            outline: "btn-outline",
          }[variant],
          {
            sm: "text-xs px-2.5 py-1.5",
            md: "text-sm px-4 py-2",
            lg: "text-base px-6 py-3",
          }[size],
          className
        )}
        {...props}
      />
    )
  }
)
EnhancedButton.displayName = "EnhancedButton"

// Unified card component with enhanced styling
interface EnhancedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
}

export const EnhancedCard = React.forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ className, title, description, children, ...props }, ref) => {
    return (
      <Card ref={ref} className={cn("enhanced-card", className)} {...props}>
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent>{children}</CardContent>
      </Card>
    )
  }
)
EnhancedCard.displayName = "EnhancedCard"

// Unified input component with enhanced styling
interface EnhancedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const EnhancedInput = React.forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && <Label>{label}</Label>}
        <Input ref={ref} className={cn("input-field", error && "border-red-500", className)} {...props} />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    )
  }
)
EnhancedInput.displayName = "EnhancedInput"

// Unified badge component with enhanced styling
interface EnhancedBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "destructive"
}

export const EnhancedBadge = React.forwardRef<HTMLSpanElement, EnhancedBadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <Badge
        ref={ref}
        className={cn(
          "enhanced-badge",
          {
            default: "bg-primary text-primary-foreground",
            secondary: "bg-secondary text-secondary-foreground",
            success: "bg-success text-success-foreground",
            warning: "bg-warning text-warning-foreground",
            destructive: "bg-destructive text-destructive-foreground",
          }[variant],
          className
        )}
        {...props}
      />
    )
  }
)
EnhancedBadge.displayName = "EnhancedBadge"