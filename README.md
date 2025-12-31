# LaserFrame-JSX

A retro sci-fi holographic UI construction effect for React applications, inspired by the briefing screens in **Syndicate Wars** (1996).

![LaserFrame Effect](https://img.shields.io/badge/React-18+-61DAFB?logo=react) ![License](https://img.shields.io/badge/license-MIT-green)

## Overview

LaserFrame creates an animated "laser printing" effect where UI panels are constructed by laser beams projecting from a central origin point. Each element's frame is traced by animated beams before the content is revealed, mimicking the holographic terminal interfaces of classic cyberpunk games.

**Effect Sequence:**
1. Laser beams shoot from a central origin to each corner of a panel
2. Frame edges are traced as each corner is reached
3. Panel background fades in with a subtle glow
4. Content is revealed with optional text printing animation
5. CRT scanlines overlay adds authenticity

## Repository Structure

```
LaserFrame-JSX/
├── README.md                    # This file
├── laserprint-demo.jsx          # Self-contained demo with mock data
└── laserprint-hologram.jsx      # Full component library (optional)
```

## Quick Start

### Option 1: Copy the Demo File

The simplest approach is to copy `laserprint-demo.jsx` directly into your React project. It's self-contained with all components inline.

```bash
# Copy to your components folder
cp laserprint-demo.jsx src/components/LaserPrintDemo.jsx
```

```jsx
import LaserPrintDemo from './components/LaserPrintDemo';

function App() {
  return <LaserPrintDemo />;
}
```

### Option 2: Extract Components for Custom Use

For integration into existing UIs, extract the core components from the demo file:

```jsx
// Extract these from laserprint-demo.jsx:
// - LaserBeam
// - HologramPanel

// Then use in your own layouts
```

## Component Architecture

### Understanding the Codebase

Before adapting the component, familiarize yourself with these key pieces:

#### `LaserBeam`
The fundamental animation unit. Draws an animated line from origin to target coordinates.

```jsx
<LaserBeam
  originX={450}        // X coordinate of beam source
  originY={275}        // Y coordinate of beam source
  targetX={30}         // X coordinate of beam destination
  targetY={30}         // Y coordinate of beam destination
  color="#00f0ff"      // Beam color (CSS color value)
  duration={150}       // Animation duration in ms
  delay={0}            // Delay before animation starts
  thickness={2}        // Beam stroke width
  onComplete={() => {}} // Callback when beam reaches target
/>
```

**Key implementation details:**
- Uses `requestAnimationFrame` for smooth animation
- Renders as SVG `<line>` elements with glow filters
- Includes a bright white core and impact point glow
- Progress is calculated as elapsed time / duration

#### `HologramPanel`
Orchestrates multiple `LaserBeam` components to construct a rectangular panel.

```jsx
<HologramPanel
  x={30}               // Panel X position
  y={30}               // Panel Y position
  width={380}          // Panel width
  height={180}         // Panel height
  originX={450}        // Laser origin X (center of screen)
  originY={275}        // Laser origin Y (center of screen)
  color="#00f0ff"      // Panel color theme
  delay={0}            // Delay before construction starts
  speed={1.5}          // Animation speed multiplier
  title="My Panel"     // Optional title text
  onPrintComplete={() => {}} // Callback when fully constructed
>
  {/* Panel content */}
</HologramPanel>
```

**Construction phases:**
1. `phase 0`: Waiting for delay
2. `phase 1-4`: Beams firing to each corner sequentially
3. `phase 5+`: Fill animation and content reveal

#### Animation Flow

```
[Delay Timer]
     │
     ▼
[Phase 1] ──► Beam to corner 0 (top-left)
     │
     ▼
[Phase 2] ──► Beam to corner 1 (top-right)
     │
     ▼
[Phase 3] ──► Beam to corner 2 (bottom-right)
     │
     ▼
[Phase 4] ──► Beam to corner 3 (bottom-left)
     │
     ▼
[Phase 5] ──► Fill animation + content reveal
     │
     ▼
[onPrintComplete callback]
```

## Customization Guide

### Changing Colors

The color palette uses CSS color values. Key colors in the demo:

```jsx
const COLORS = {
  cyan: '#00f0ff',      // Primary UI color
  magenta: '#ff00ff',   // Secondary/alert color
  purple: '#8800ff',    // Tertiary/map color
  green: '#00ff66',     // Success/friendly color
  yellow: '#ffcc00',    // Warning/highlight color
  red: '#ff0066',       // Danger/target color
};
```

To change a panel's color scheme, modify the `color` prop:

```jsx
<HologramPanel color="#ff6600" ... >
```

### Adjusting Animation Speed

The `speed` prop is a multiplier affecting all timing:

```jsx
// Slower, more dramatic construction
<HologramPanel speed={0.5} ... />

// Faster, snappier feel
<HologramPanel speed={2.0} ... />
```

Internal timing calculations:
```jsx
const beamDuration = 80 / speed;   // Time for each beam
const fillDuration = 300 / speed;  // Time for fill animation
```

### Staggering Multiple Panels

Use the `delay` prop to sequence panel construction:

```jsx
<HologramPanel delay={0} ... />      {/* Starts immediately */}
<HologramPanel delay={500} ... />    {/* Starts after 500ms */}
<HologramPanel delay={900} ... />    {/* Starts after 900ms */}
```

### Changing the Origin Point

The origin is where all laser beams emanate from. Default is screen center:

```jsx
const originX = containerWidth / 2;
const originY = containerHeight / 2;
```

For a different effect, try corner origins:

```jsx
// Bottom-left origin (beams shoot upward)
const originX = 50;
const originY = containerHeight - 50;
```

### Disabling Scanlines

Remove or comment out the scanlines overlay div:

```jsx
{/* Remove this block to disable scanlines */}
<div style={{
  position: 'absolute',
  inset: 0,
  background: `repeating-linear-gradient(...)`,
  ...
}} />
```

## Integration Patterns

### Pattern 1: Full-Page Terminal UI

Replace your app's main content area with a LaserFrame container:

```jsx
function TerminalPage() {
  return (
    <div style={{ background: '#030108', minHeight: '100vh' }}>
      {/* Laser-printed panels */}
    </div>
  );
}
```

### Pattern 2: Modal/Dialog Overlay

Wrap modal content in a HologramPanel:

```jsx
function HologramModal({ isOpen, onClose, children }) {
  const [key, setKey] = useState(0);
  
  useEffect(() => {
    if (isOpen) setKey(k => k + 1); // Replay animation on open
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay">
      <svg key={key} width={500} height={400}>
        <HologramPanel
          x={0} y={0} width={500} height={400}
          originX={250} originY={200}
          color="#00f0ff"
        >
          {children}
        </HologramPanel>
      </svg>
    </div>
  );
}
```

### Pattern 3: Tab Content Transitions

Re-render with a new key to replay the effect on tab change:

```jsx
function TabbedInterface() {
  const [activeTab, setActiveTab] = useState('tab1');
  const [animKey, setAnimKey] = useState(0);
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setAnimKey(k => k + 1); // Force re-mount to replay animation
  };
  
  return (
    <>
      <TabButtons onChange={handleTabChange} />
      <svg key={animKey}>
        {/* Panels re-animate on tab change */}
      </svg>
    </>
  );
}
```

### Pattern 4: Lazy Content Loading

Trigger panel construction after data loads:

```jsx
function DataPanel({ data, index }) {
  if (!data) return null;
  
  return (
    <HologramPanel
      delay={index * 300}  // Stagger based on position
      onPrintComplete={() => console.log('Panel ready')}
    >
      {data.content}
    </HologramPanel>
  );
}
```

## Adapting for Your Framework

### Next.js

Add `'use client'` directive for client-side rendering:

```jsx
'use client';

import { useState, useEffect, useCallback } from 'react';
// ... rest of component
```

### Vite

Works out of the box. Import directly:

```jsx
import LaserPrintDemo from './LaserPrintDemo';
```

### TypeScript

Add type definitions for props:

```typescript
interface LaserBeamProps {
  originX: number;
  originY: number;
  targetX: number;
  targetY: number;
  color?: string;
  duration?: number;
  delay?: number;
  thickness?: number;
  onComplete?: () => void;
}

interface HologramPanelProps {
  x: number;
  y: number;
  width: number;
  height: number;
  originX: number;
  originY: number;
  color?: string;
  delay?: number;
  speed?: number;
  title?: string;
  children?: React.ReactNode;
  onPrintComplete?: () => void;
}
```

## Performance Considerations

- **SVG Rendering**: All effects use SVG, which performs well for this use case
- **requestAnimationFrame**: Animations use rAF for smooth 60fps rendering
- **Component Cleanup**: Timers are cleared on unmount via useEffect cleanup
- **Re-renders**: Use `React.memo` on panel content if needed

For many simultaneous panels (10+), consider:
```jsx
// Reduce beam/fill durations
<HologramPanel speed={3} ... />

// Or simplify the glow effects
style={{ filter: 'none' }}  // Remove drop-shadow filters
```

## Browser Support

Tested on modern browsers supporting:
- CSS `filter: drop-shadow()`
- SVG animations
- `requestAnimationFrame`

## License

MIT License - Feel free to use in personal and commercial projects.

## Credits

Visual effect inspired by **Syndicate Wars** (Bullfrog Productions, 1996).

---

**Repository:** [github.com/MushroomFleet/LaserFrame-JSX](https://github.com/MushroomFleet/LaserFrame-JSX)
