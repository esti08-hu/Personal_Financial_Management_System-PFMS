/**
 * Design System Test Page
 * Comprehensive testing page for all enhanced design system components
 */

import { DesignSystemShowcase } from "@/components/design-system/DesignSystemShowcase"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Design System - PFMS",
  description: "Enhanced design system showcase for Personal Financial Management System",
}

export default function DesignSystemPage() {
  return (
    <main className="min-h-screen bg-background">
      <DesignSystemShowcase />
    </main>
  )
}
