import type React from "react"
import type { Metadata } from "next"
import { Inter, Satisfy as Satoshi } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Playfair_Display as Playfair } from "next/font/google"
import { Toaster } from "sonner"

// Enhanced font loading with better performance and display optimization
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
})

const satoshi = Satoshi({
  subsets: ["latin"],
  variable: "--font-satoshi",
  weight: ["400"],
  display: "swap",
  fallback: ["Inter", "system-ui", "sans-serif"],
})

export const metadata: Metadata = {
  title: "MoneyMaster - Plan Your Financial Future",
  description: "Create and manage budgets effortlessly with MoneyMaster's comprehensive financial planning tools.",
}

const playfair = Playfair({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "700"],
  display: "swap",
  fallback: ["serif"],
})
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${satoshi.variable} ${playfair.variable} font-sans antialiased min-h-screen text-foreground`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  )
}
