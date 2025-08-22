import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 ease-in-out disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-95",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md hover:shadow-primary/25 focus-visible:ring-primary",
        destructive:
          "bg-danger-500 text-white shadow-sm hover:bg-danger-600 hover:shadow-md hover:shadow-danger-500/25 focus-visible:ring-danger-500",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground hover:border-accent focus-visible:ring-ring",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 hover:shadow-md focus-visible:ring-ring",
        ghost:
          "hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring",
        link: "text-primary underline-offset-4 hover:underline focus-visible:ring-primary",
        success:
          "bg-success-500 text-white shadow-sm hover:bg-success-600 hover:shadow-md hover:shadow-success-500/25 focus-visible:ring-success-500",
        warning:
          "bg-warning-500 text-white shadow-sm hover:bg-warning-600 hover:shadow-md hover:shadow-warning-500/25 focus-visible:ring-warning-500",
        info:
          "bg-info-500 text-white shadow-sm hover:bg-info-600 hover:shadow-md hover:shadow-info-500/25 focus-visible:ring-info-500",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
