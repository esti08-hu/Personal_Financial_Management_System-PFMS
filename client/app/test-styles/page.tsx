/**
 * Simple Style Test Page
 * Basic test to verify Tailwind CSS and design system are working
 */

export default function TestStylesPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Basic Typography Test */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Style Test Page</h1>
          <p className="text-lg text-muted-foreground">
            Testing if Tailwind CSS and our design system are working properly.
          </p>
        </div>

        {/* Color Test */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Color Test</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-primary text-primary-foreground p-4 rounded-lg text-center">
              Primary
            </div>
            <div className="bg-secondary text-secondary-foreground p-4 rounded-lg text-center">
              Secondary
            </div>
            <div className="bg-success-500 text-white p-4 rounded-lg text-center">
              Success
            </div>
            <div className="bg-danger-500 text-white p-4 rounded-lg text-center">
              Danger
            </div>
          </div>
        </div>

        {/* Financial Colors Test */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Financial Colors</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-income text-income-foreground p-4 rounded-lg text-center">
              Income
            </div>
            <div className="bg-expense text-expense-foreground p-4 rounded-lg text-center">
              Expense
            </div>
            <div className="bg-investment text-investment-foreground p-4 rounded-lg text-center">
              Investment
            </div>
            <div className="bg-savings text-savings-foreground p-4 rounded-lg text-center">
              Savings
            </div>
          </div>
        </div>

        {/* Card Test */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Card Test</h2>
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-card-foreground mb-2">Test Card</h3>
            <p className="text-muted-foreground">
              This is a test card to verify that card styling is working properly.
            </p>
          </div>
        </div>

        {/* Button Test */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Button Test</h2>
          <div className="flex flex-wrap gap-4">
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
              Primary Button
            </button>
            <button className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/80 transition-colors">
              Secondary Button
            </button>
            <button className="bg-success-500 text-white px-4 py-2 rounded-md hover:bg-success-600 transition-colors">
              Success Button
            </button>
            <button className="bg-danger-500 text-white px-4 py-2 rounded-md hover:bg-danger-600 transition-colors">
              Danger Button
            </button>
          </div>
        </div>

        {/* Input Test */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Input Test</h2>
          <div className="space-y-4 max-w-md">
            <input
              type="text"
              placeholder="Test input field"
              className="w-full border border-input bg-background rounded-md px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <input
              type="email"
              placeholder="Email input"
              className="w-full border border-input bg-background rounded-md px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        {/* Responsive Test */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Responsive Test</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold text-card-foreground">Card 1</h3>
              <p className="text-muted-foreground text-sm">Responsive grid test</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold text-card-foreground">Card 2</h3>
              <p className="text-muted-foreground text-sm">Responsive grid test</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold text-card-foreground">Card 3</h3>
              <p className="text-muted-foreground text-sm">Responsive grid test</p>
            </div>
          </div>
        </div>

        {/* Dark Mode Test */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Dark Mode Test</h2>
          <p className="text-muted-foreground">
            Toggle dark mode in your browser or system settings to test dark mode colors.
          </p>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-muted-foreground">
              This should adapt to light/dark mode automatically.
            </p>
          </div>
        </div>

        {/* CSS Variables Test */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">CSS Variables Test</h2>
          <div className="space-y-2">
            <div style={{ color: 'hsl(var(--primary))' }}>
              Primary color using CSS variable
            </div>
            <div style={{ color: 'hsl(var(--success))' }}>
              Success color using CSS variable
            </div>
            <div style={{ color: 'hsl(var(--income))' }}>
              Income color using CSS variable
            </div>
            <div style={{ color: 'hsl(var(--expense))' }}>
              Expense color using CSS variable
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
