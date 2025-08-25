/**
 * Design System Showcase Component
 * Demonstrates the enhanced design system components and patterns
 */

"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge, FinancialAmount, Percentage, StatusIndicator, Progress, Alert, AlertTitle, AlertDescription } from "@/lib/design-system/components"
import { FormField, Select, Textarea, Checkbox, RadioGroup, Switch } from "@/lib/design-system/forms"
import { ChartContainer, ChartLegend, FinancialChart, MetricCard } from "@/lib/design-system/charts"
import { responsivePatterns, touchTargets, mobileForm } from "@/lib/design-system/responsive"
import { cn } from "@/lib/utils"

export function DesignSystemShowcase() {
  const [selectedTheme, setSelectedTheme] = React.useState("light")
  const [formData, setFormData] = React.useState({
    email: "",
    amount: "",
    category: "",
    notes: "",
    notifications: false,
    priority: "medium",
  })

  return (
    <div className={cn(responsivePatterns.container.full, "py-8 space-y-8")}>
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">
          Enhanced Design System
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Comprehensive design system with enhanced colors, typography, components, and responsive patterns
        </p>
      </div>

      {/* Color Palette */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Enhanced Color Palette</CardTitle>
          <CardDescription>
            Financial-themed color system with semantic meanings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className={cn(responsivePatterns.grid.responsive, "gap-4")}>
            {/* Brand Colors */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Brand Colors</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-primary"></div>
                  <span className="text-sm">Primary</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-secondary"></div>
                  <span className="text-sm">Secondary</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-accent"></div>
                  <span className="text-sm">Accent</span>
                </div>
              </div>
            </div>

            {/* Financial Colors */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Financial Colors</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-income"></div>
                  <span className="text-sm">Income</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-expense"></div>
                  <span className="text-sm">Expense</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-investment"></div>
                  <span className="text-sm">Investment</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-savings"></div>
                  <span className="text-sm">Savings</span>
                </div>
              </div>
            </div>

            {/* Semantic Colors */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Semantic Colors</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-success-500"></div>
                  <span className="text-sm">Success</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-warning-500"></div>
                  <span className="text-sm">Warning</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-danger-500"></div>
                  <span className="text-sm">Danger</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-info-500"></div>
                  <span className="text-sm">Info</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Components */}
      <Card variant="financial">
        <CardHeader>
          <CardTitle>Enhanced Components</CardTitle>
          <CardDescription>
            Interactive components with improved visual feedback
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Buttons */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Buttons</h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="default">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="success">Success</Button>
              <Button variant="warning">Warning</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="outline">Outline</Button>
            </div>
          </div>

          {/* Badges */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Badges</h3>
            <div className="flex flex-wrap gap-3">
              <Badge variant="default">Default</Badge>
              <Badge variant="income">Income</Badge>
              <Badge variant="expense">Expense</Badge>
              <Badge variant="investment">Investment</Badge>
              <Badge variant="savings">Savings</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="destructive">Error</Badge>
            </div>
          </div>

          {/* Financial Components */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Financial Components</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground w-20">Amount:</span>
                <FinancialAmount amount={1250.75} />
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground w-20">Negative:</span>
                <FinancialAmount amount={-850.25} />
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground w-20">Percentage:</span>
                <Percentage value={12.5} />
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground w-20">Status:</span>
                <StatusIndicator status="active">Active</StatusIndicator>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Progress Indicators</h3>
            <div className="space-y-3">
              <Progress value={75} variant="default" showLabel />
              <Progress value={45} variant="success" showLabel />
              <Progress value={90} variant="warning" showLabel />
              <Progress value={25} variant="danger" showLabel />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Forms */}
      <Card variant="interactive">
        <CardHeader>
          <CardTitle>Enhanced Forms</CardTitle>
          <CardDescription>
            Modern form controls with validation states
          </CardDescription>
        </CardHeader>
        <CardContent className={cn(mobileForm.formStack)}>
          <FormField
            label="Email Address"
            description="We'll never share your email"
            required
          >
            <Input
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
          </FormField>

          <FormField
            label="Amount"
            description="Enter the transaction amount"
          >
            <Input
              type="number"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              startIcon={<span className="text-sm">ETB</span>}
            />
          </FormField>

          <FormField label="Category">
            <Select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="">Select category</option>
              <option value="food">Food & Dining</option>
              <option value="transport">Transportation</option>
              <option value="entertainment">Entertainment</option>
              <option value="utilities">Utilities</option>
            </Select>
          </FormField>

          <FormField label="Notes">
            <Textarea
              placeholder="Add any additional notes..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </FormField>

          <Checkbox
            label="Enable notifications"
            description="Receive email notifications for this transaction"
            checked={formData.notifications}
            onChange={(e) => setFormData(prev => ({ ...prev, notifications: e.target.checked }))}
          />

          <FormField label="Priority Level">
            <RadioGroup
              name="priority"
              value={formData.priority}
              onChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
              options={[
                { value: "low", label: "Low", description: "Non-urgent transaction" },
                { value: "medium", label: "Medium", description: "Standard priority" },
                { value: "high", label: "High", description: "Urgent transaction" },
              ]}
            />
          </FormField>

          <Switch
            label="Auto-categorize"
            description="Automatically categorize similar transactions"
          />

          <div className="flex gap-3 pt-4">
            <Button variant="default" className={touchTargets.button}>
              Save Transaction
            </Button>
            <Button variant="outline" className={touchTargets.button}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Alert Components</h2>
        <div className="space-y-4">
          <Alert variant="default">
            <AlertTitle>Information</AlertTitle>
            <AlertDescription>
              This is a default alert with important information.
            </AlertDescription>
          </Alert>
          
          <Alert variant="success">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              Your transaction has been successfully processed.
            </AlertDescription>
          </Alert>
          
          <Alert variant="warning">
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              You're approaching your monthly budget limit.
            </AlertDescription>
          </Alert>
          
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              There was an error processing your request. Please try again.
            </AlertDescription>
          </Alert>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Financial Metrics</h2>
        <div className={cn(responsivePatterns.grid.financial)}>
          <MetricCard
            title="Total Income"
            value="45,250 ETB"
            change={{ value: 12.5, period: "vs last month" }}
            variant="income"
          />
          <MetricCard
            title="Total Expenses"
            value="32,180 ETB"
            change={{ value: -5.2, period: "vs last month" }}
            variant="expense"
          />
          <MetricCard
            title="Investments"
            value="18,750 ETB"
            change={{ value: 8.3, period: "vs last month" }}
            variant="investment"
          />
          <MetricCard
            title="Savings"
            value="13,070 ETB"
            change={{ value: 15.7, period: "vs last month" }}
            variant="savings"
          />
        </div>
      </div>
    </div>
  )
}
