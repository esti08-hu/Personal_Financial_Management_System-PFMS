# Personal Financial Management System - Design System v2.0

A comprehensive, modern design system built specifically for financial applications with enhanced accessibility, mobile responsiveness, and visual feedback.

## 🎨 Features

### Enhanced Color System
- **Financial-themed palette** with semantic color meanings
- **Brand colors** (Primary teal, Secondary purple, Accent orange)
- **Financial colors** (Income green, Expense red, Investment purple, Savings blue, Budget amber)
- **Semantic colors** (Success, Warning, Danger, Info)
- **Dark mode support** with consistent color mappings
- **Accessibility compliant** with WCAG 2.1 AA standards

### Advanced Typography
- **Scalable type system** with display, heading, body, and caption variants
- **Financial-specific typography** for amounts, percentages, and dates
- **Responsive typography** that adapts to screen sizes
- **Enhanced font loading** with performance optimizations
- **Tabular numbers** for financial data alignment

### Interactive Components
- **Enhanced visual feedback** with hover, focus, and active states
- **Smooth animations** with configurable durations
- **Touch-friendly** interactions for mobile devices
- **Loading states** and skeleton components
- **Accessibility features** with proper ARIA support

### Mobile-First Responsive Design
- **Breakpoint system** from mobile to desktop
- **Touch targets** optimized for mobile interaction
- **Responsive patterns** for common layouts
- **Mobile navigation** components
- **Adaptive typography** and spacing

## 📁 Structure

```
lib/design-system/
├── colors.ts          # Enhanced color palette and utilities
├── typography.ts      # Typography system and utilities
├── interactions.ts    # Interactive states and animations
├── components.tsx     # Enhanced UI components
├── forms.tsx         # Form components with validation
├── charts.tsx        # Chart and visualization components
├── responsive.ts     # Mobile-first responsive utilities
├── index.ts          # Main export file
└── README.md         # This file
```

## 🚀 Quick Start

### Installation

The design system is already integrated into the project. Import components as needed:

```tsx
import { 
  Badge, 
  FinancialAmount, 
  Percentage,
  StatusIndicator 
} from "@/lib/design-system/components"

import { 
  FormField, 
  Select, 
  Checkbox 
} from "@/lib/design-system/forms"

import { 
  responsivePatterns, 
  touchTargets 
} from "@/lib/design-system/responsive"
```

### Basic Usage

```tsx
// Financial amount with automatic color coding
<FinancialAmount amount={1250.75} currency="ETB" />

// Enhanced badge with financial variants
<Badge variant="income">Income</Badge>

// Responsive form field
<FormField label="Amount" required>
  <Input type="number" placeholder="0.00" />
</FormField>

// Mobile-optimized button
<Button className={touchTargets.button}>
  Save Transaction
</Button>
```

## 🎯 Component Categories

### Core Components
- **Badge** - Enhanced badges with financial variants
- **Button** - Interactive buttons with improved feedback
- **Card** - Flexible card components with variants
- **Input** - Enhanced input fields with validation states

### Financial Components
- **FinancialAmount** - Formatted currency display with color coding
- **Percentage** - Percentage display with trend indicators
- **StatusIndicator** - Status badges with visual indicators
- **Progress** - Progress bars for financial goals

### Form Components
- **FormField** - Complete form field with label, validation, and help text
- **Select** - Enhanced select dropdown
- **Textarea** - Multi-line text input
- **Checkbox** - Styled checkbox with label support
- **RadioGroup** - Radio button group component
- **Switch** - Toggle switch component

### Chart Components
- **ChartContainer** - Wrapper for chart components
- **ChartLegend** - Customizable chart legend
- **FinancialChart** - Financial-specific chart wrapper
- **MetricCard** - Dashboard metric display cards

## 🎨 Color Usage

### Financial Colors
```tsx
// Use semantic financial colors
<div className="text-income">+$1,250</div>
<div className="text-expense">-$850</div>
<div className="bg-investment/10 text-investment">Investment</div>
```

### Brand Colors
```tsx
// Primary brand color
<Button className="bg-primary text-primary-foreground">
  Primary Action
</Button>

// Secondary actions
<Button variant="secondary">Secondary Action</Button>
```

## 📱 Responsive Design

### Breakpoints
- `xs`: 375px (Small phones)
- `sm`: 640px (Large phones)
- `md`: 768px (Tablets)
- `lg`: 1024px (Small laptops)
- `xl`: 1280px (Large laptops)
- `2xl`: 1536px (Desktops)

### Responsive Patterns
```tsx
// Responsive grid
<div className={responsivePatterns.grid.financial}>
  {/* Grid items */}
</div>

// Responsive container
<div className={responsivePatterns.container.full}>
  {/* Content */}
</div>

// Mobile-first typography
<h1 className={responsivePatterns.typography.heading}>
  Responsive Heading
</h1>
```

### Touch Targets
```tsx
// Mobile-optimized button
<Button className={touchTargets.button}>
  Touch-Friendly Button
</Button>

// Interactive icon
<button className={touchTargets.icon}>
  <Icon />
</button>
```

## ♿ Accessibility

### Focus Management
- Visible focus indicators on all interactive elements
- Keyboard navigation support
- Screen reader compatibility

### Color Contrast
- WCAG 2.1 AA compliant color combinations
- High contrast mode support
- Color-blind friendly palette

### Semantic HTML
- Proper ARIA labels and roles
- Semantic form structure
- Accessible error messaging

## 🌙 Dark Mode

The design system includes comprehensive dark mode support:

```tsx
// Automatic dark mode colors
<div className="bg-card text-card-foreground">
  Content adapts to theme
</div>

// Theme-aware financial colors
<FinancialAmount amount={1250} /> // Automatically adjusts for dark mode
```

## 📊 Financial Data Display

### Amount Formatting
```tsx
// Automatic formatting and color coding
<FinancialAmount amount={1250.75} currency="ETB" showSign />

// Custom variants
<FinancialAmount amount={-850} variant="large" />
```

### Percentage Display
```tsx
// Trend indicators
<Percentage value={12.5} showSign colorCoded />

// Custom threshold
<Percentage value={-5.2} threshold={0} />
```

## 🔧 Customization

### Theme Configuration
The design system supports multiple theme configurations:

```tsx
import { themeConfig } from "@/lib/design-system"

// Default theme
themeConfig.default

// High contrast theme
themeConfig.accessible

// Compact theme
themeConfig.compact
```

### Custom Colors
Extend the color palette by modifying the color configuration:

```tsx
// Add custom financial categories
const customColors = {
  ...financialColors,
  subscription: {
    light: '#8b5cf6',
    dark: '#a78bfa',
    background: '#faf5ff',
    foreground: '#581c87',
  }
}
```

## 📈 Performance

### Optimizations
- **Font loading** optimized with `font-display: swap`
- **Tree shaking** support for unused components
- **CSS-in-JS** with zero runtime overhead
- **Responsive images** with proper aspect ratios

### Bundle Size
- Core design system: ~15KB gzipped
- Individual component imports supported
- Minimal runtime dependencies

## 🧪 Testing

Visit `/design-system` to see all components in action and test the design system interactively.

## 📝 Contributing

When adding new components:

1. Follow the established naming conventions
2. Include responsive variants
3. Add accessibility features
4. Document usage examples
5. Test in both light and dark modes

## 🔄 Migration Guide

### From v1.0 to v2.0

1. **Color classes**: Update old color classes to new semantic names
2. **Typography**: Replace old font classes with new typography variants
3. **Components**: Update component props to new API
4. **Responsive**: Use new responsive patterns instead of custom breakpoints

### Breaking Changes
- Removed legacy color classes
- Updated component prop names
- New responsive breakpoint system
- Enhanced accessibility requirements

## 📚 Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Material Design Guidelines](https://material.io/design)

---

**Version**: 2.0.0  
**Last Updated**: 2024-08-15  
**Maintainer**: PFMS Design Team
