# GradientHoverCard Component

A reusable card component with beautiful gradient borders and hover effects, designed to match the CursorIt project's aesthetic.

## Features

- **Gradient borders** with customizable color variants
- **Smooth hover animations** with scale and glow effects
- **Selection state** with enhanced visual feedback
- **Three color variants** to match different UI contexts

## Usage

```tsx
import GradientHoverCard from "@/components/ui/gradient-hover-card";

// Basic usage
<GradientHoverCard>
  <div className="p-6">
    <h3>Card Content</h3>
    <p>Any content goes here</p>
  </div>
</GradientHoverCard>

// With selection and click handler
<GradientHoverCard
  isSelected={selectedItem === "item1"}
  onClick={() => setSelectedItem("item1")}
  variant="primary"
>
  <div className="p-6">
    <h3>Selectable Card</h3>
  </div>
</GradientHoverCard>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | - | Content to render inside the card |
| `className` | `string` | - | Additional CSS classes for the outer container |
| `isSelected` | `boolean` | `false` | Whether the card is in selected state |
| `onClick` | `() => void` | - | Click handler for the card |
| `variant` | `"default" \| "primary" \| "accent"` | `"default"` | Color variant for the gradient border |

## Variants

### Default
- **Gradient**: Indigo to Purple (`#6366f1` to `#a855f7`)
- **Glow**: Indigo (`rgba(99, 102, 241, 0.4)`)

### Primary
- **Gradient**: Purple to Blue (`#a855f7` to `#3b82f6`)
- **Glow**: Purple (`rgba(168, 85, 247, 0.4)`)

### Accent
- **Gradient**: Cyan to Violet (`#06b6d4` to `#8b5cf6`)
- **Glow**: Cyan (`rgba(6, 182, 212, 0.4)`)

## Animation Effects

- **Hover**: Inner card scales to 98% with increased border radius
- **Hover Glow**: Box shadow with variant-specific color
- **Selection**: Scale up to 102% with enhanced glow effect

## Examples

### Platform Selection Cards
Used in the platform selection page for Web, Mobile, and Desktop options.

### Button Cards
Can be used for any clickable card interface where you want enhanced visual feedback.

### Feature Cards
Perfect for showcasing features or options with interactive selection.

## Styling Notes

- The component uses a 2px gradient border with rounded corners
- Inner content area has a dark background (`bg-black/90`) for contrast
- Glass effect overlay is applied for depth
- All animations are smooth with proper timing functions
