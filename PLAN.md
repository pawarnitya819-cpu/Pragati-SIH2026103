# Ministry-Wise / Sector-Wise Spotlight Panel Implementation Plan

## Overview
Implement a new component `MinistrySectorSpotlight.jsx` that replicates the structural layout of India's PRAGATI portal with toggle between Ministry-Wise and Sector-Wise views, pill-based navigation, stat cards, and animated isometric illustrations for sector view.

## Approach
1. Create `MinistrySectorSpotlight.jsx` as the main container component
2. Create `SectorIllustration.jsx` for animated SVG illustrations
3. Reuse existing data structures and extend SECTOR_INFO where needed
4. Wire into AdminDashboard or Overview page (placing above existing components)

## Phase 1: Core Structure & Data (Priority)
### Components to Create:
1. `frontend/src/components/MinistrySectorSpotlight.jsx`
   - Toggle pills: "Ministry-Wise" / "Sector-Wise" (saffron-500 active state)
   - Left panel: Vertical stack of pill buttons (collapsible, active with chevron)
   - Right panel: Stat card with header + 2x3 grid of stat tiles
   - Right side (sector-view only): Container for SectorIllustration

### Data Processing:
- Reuse ministry aggregation logic from MinistryBreakdown.jsx
- Create sector aggregation logic similar to ministry but grouped by sector
- Calculate stats: Project Count, Original Cost, Latest Revised Cost, Expenditure (Cumm.), Completed During Month, Newly Added
- Use useMemo for performance

## Phase 2: Sector Illustrations (Priority)
### Selected Sectors for Initial Implementation (3 sectors):
1. **Railways** - Train moving along tracks
2. **Power** - Wind turbine blades rotating  
3. **Waterways** - Boat bobbing gently on water

### SVG Structure Approach (example for Railways):
```svg
<svg viewBox="0 0 200 200" className="w-full h-full">
  <!-- Isometric Base Ground -->
  <rect x="0" y="150" width="200" height="50" fill="#3B82F6" />
  
  <!-- Isometric Tracks -->
  <path d="M20,150 L180,110" stroke="#6B7280" strokeWidth="4" />
  <path d="M40,150 L200,110" stroke="#6B7280" strokeWidth="4" />
  
  <!-- Train Body (isometric rectangle) -->
  <rect x="50" y="100" width="80" height="30" fill="#EF4444" />
  
  <!-- Train Details -->
  <rect x="60" y="105" width="20" height="20" fill="#FFFFFF" /> <!-- Window -->
  <rect x="100" y="105" width="20" height="20" fill="#FFFFFF" /> <!-- Window -->
  <circle cx="70" cy="140" r="8" fill="#374151" /> <!-- Wheel -->
  <circle cx="130" cy="140" r="8" fill="#374151" /> <!-- Wheel -->
  
  <!-- Animation Target: Train x position -->
</svg>
```

### Animation Approach:
- Use framer-motion's `motion` component with `while` or `animate` props
- Railways: Animate train moving along track path (x position from 20 to 180)
- Power: Animate wind turbine blade rotation (rotate transform 0deg to 360deg)
- Waterways: Animate boat bobbing (y position sine wave motion)
- Duration: 4-8 seconds, ease-in-out, infinite loop
- Respect `prefers-reduced-motion` using useReducedMotion hook or media query
- Crossfade: Use AnimatePresence when switching sectors

### Color Palette:
- Base on Tailwind navy/saffron but with sector-specific accent colors
- Railways: Use existing Railways color from SECTOR_INFO (#D97706 saffron-600)
- Power: Use existing Power color (#15803D success-600)  
- Waterways: Use existing Waterways color (#7C3AED violet)
- Keep consistent isometric shading (lighter top, darker sides)

## Phase 3: Integration & Refinement
### Placement Decision:
Place the spotlight panel **above** existing SectorInformation/MinistryBreakdown components in AdminDashboard because:
1. It provides a high-level overview before diving into details
2. Matches PRAGATI portal layout where summary comes first
3. Avoids duplication of information (shows aggregates vs individual cards)

### Responsive Behavior:
- Mobile (< md): Stack pill-list above stat card, illustration hidden or below
- Desktop (≥ md): Side-by-side layout as described
- Use Tailwind responsive classes: hidden md:block, etc.

### Implementation Steps:
1. Create MinistrySectorSpotlight with toggle and basic layout
2. Implement data aggregation functions
3. Create SectorIllustration with 3 SVG animations
4. Connect toggle to switch views
5. Add responsive behavior
6. Integrate into AdminDashboard.jsx
7. Refine animations and styling

## Files to Modify/Create:
- `frontend/src/components/MinistrySectorSpotlight.jsx` (new)
- `frontend/src/components/SectorIllustration.jsx` (new)
- `frontend/src/components/AdminDashboard.jsx` (modify to insert new component)
- Possibly extend SECTOR_INFO in SectorInformation.jsx if additional fields needed

## Dependencies:
- Already installed: framer-motion (motion/react)
- Using existing: Lucide icons, Tailwind, React hooks