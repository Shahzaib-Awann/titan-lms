---
version: alpha
name: Titan LMS
description: "A premium Learning Management System designed around deep navy surfaces, vibrant purple gradients, rounded cards, and clean educational dashboards. The visual language balances professionalism with approachability using generous spacing, soft shadows, modern illustrations, and high-contrast typography. Primary actions use vivid violet while supporting surfaces remain dark and unobtrusive, allowing course content and progress metrics to become the visual focus."

colors:
  primary: "#7658FF"
  on-primary: "#FFFFFF"
  primary-hover: "#6848F8"

  secondary: "#4ADE80"
  warning: "#FBBF24"
  danger: "#FB7185"

  heading: "#F5F7FF"
  body: "#C8CEE6"
  muted: "#8F97B6"

  canvas: "#0F1322"
  surface-1: "#171C2D"
  surface-2: "#1F2438"
  surface-3: "#262D45"

  border: "#2D3552"

  success: "#4ADE80"
  info: "#60A5FA"
  warning-soft: "#F59E0B"
  error: "#F87171"

  gradient-start: "#5B4CF6"
  gradient-middle: "#6F5BFF"
  gradient-end: "#9268FF"

typography:
  display:
    fontFamily: "Inter, Geist Sans, ui-sans-serif, sans-serif"
    fontSize: 42px
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: -0.03em

  heading:
    fontFamily: "Inter, Geist Sans, ui-sans-serif, sans-serif"
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1.2

  body:
    fontFamily: "Inter, Geist Sans, ui-sans-serif, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6

  caption:
    fontFamily: "Inter, Geist Sans, ui-sans-serif, sans-serif"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.5

spacing:
  base: 8px
  scale:
    - 4
    - 8
    - 12
    - 16
    - 24
    - 32
    - 40
    - 48
    - 64
    - 96

radius:
  sm: 8px
  md: 12px
  lg: 18px
  xl: 24px
  xxl: 32px
  pill: 9999px

shadows:
  card: "0 10px 30px rgba(15,19,34,.25)"
  elevated: "0 20px 60px rgba(15,19,34,.35)"
  floating: "0 30px 80px rgba(15,19,34,.45)"

motion:
  duration-fast: 150ms
  duration-base: 250ms
  duration-slow: 400ms
  easing: cubic-bezier(.4,0,.2,1)
---

# 1. Visual Theme & Atmosphere

Titan LMS embraces a modern SaaS dashboard aesthetic with a dark-first interface. Instead of relying on heavy borders, hierarchy is created through layered surfaces, soft elevation, and carefully balanced spacing. Purple gradients establish the brand identity while colorful course thumbnails and illustrations add energy throughout the interface.

The experience should feel premium, calm, and productivity-focused rather than playful or corporate.

---

# 2. Color System

Four-layer surface hierarchy:

- **Canvas** — #0F1322 (application background)
- **Surface 1** — #171C2D (cards)
- **Surface 2** — #1F2438 (sidebars)
- **Surface 3** — #262D45 (inputs, secondary containers)

Brand colors:

- Primary — #7658FF
- Hover — #6848F8
- Hero Gradient — #5B4CF6 → #6F5BFF → #9268FF

Semantic colors:

- Success — #4ADE80
- Warning — #FBBF24
- Error — #FB7185
- Info — #60A5FA

Typography colors:

- Heading — #F5F7FF
- Body — #C8CEE6
- Muted — #8F97B6

Borders should remain subtle and never dominate the interface.

---

# 3. Typography

The design uses Inter (or Geist Sans) throughout the application.

Hierarchy:

Display

- 42px
- Extra Bold (800)

Section Titles

- 28px
- Bold (700)

Card Titles

- 18px
- SemiBold (600)

Body

- 16px
- Regular (400)

Caption

- 14px
- Medium (500)

The typography should remain spacious with generous line-height to support long educational content.

---

# 4. Components & Patterns

## Sidebar

- Dark vertical navigation
- Rounded active item
- Purple active background
- White active text
- Gray inactive text
- Optional glowing notification dots

## Hero Banner

Large purple gradient card featuring:

- Welcome message
- CTA buttons
- Friendly 3D illustration
- Soft decorative floating shapes

## Statistic Cards

Small rounded cards displaying:

- Icon
- Large numeric value
- Label
- Supporting metric
- Hover elevation

## Course Cards

Include:

- Thumbnail
- Difficulty badge
- Course title
- Subtitle
- Progress bar
- Completion percentage

Cards elevate slightly on hover.

## Calendar

Minimal monthly calendar using subtle separators.

Selected day:

- Filled purple circle

Current day:

- Purple outline

## Events Panel

Timeline layout:

- Colored indicator
- Time
- Event title
- Category

## Announcement Cards

Simple list items containing:

- Icon
- Title
- Subtitle
- Relative timestamp

---

# 5. Layout & Spacing

Desktop layout:

Sidebar

- 260px

Main Content

- Flexible

Right Panel

- 320px

Global page padding:

32px

Card padding:

24px

Gap between cards:

24px

Section spacing:

32–48px

All cards use consistent corner radii and generous whitespace.

---

# 6. Motion & Interaction

Hover

- Lift 4–6px
- Shadow increases
- Transition 250ms

Buttons

- Slight scale (1.02)
- Purple darkens

Progress Bars

- Smooth animated fill

Sidebar Navigation

- Active pill slides smoothly

Cards

- Fade + translate upward on load

Hero Illustration

- Gentle floating animation

All animations respect:

prefers-reduced-motion

---

# Rationale

## Premium Educational Experience

The interface is designed to reduce cognitive load while keeping students engaged. Dark surfaces reduce visual fatigue during long study sessions, while bright accent colors draw attention only to important actions.

## Purple as Brand Identity

Purple communicates creativity, learning, and innovation. Rather than using it everywhere, it is reserved for primary actions, progress indicators, and key highlights, making interactions immediately recognizable.

## Layered Surface System

Instead of relying on borders, depth is created using progressively lighter surfaces. This gives the dashboard a clean and modern appearance while maintaining clear visual hierarchy.

## Large Rounded Components

Generous corner radii create a friendly, approachable interface suitable for educational platforms. Rounded shapes also help distinguish cards and navigation elements without requiring heavy outlines.

## Dashboard-First Layout

Information is organized into modular cards, allowing students to quickly scan progress, assignments, schedules, and announcements without feeling overwhelmed.

---

# Accessibility

## Contrast Ratios

Heading (#F5F7FF) on Canvas (#0F1322)

- AAA

Body (#C8CEE6) on Surface (#171C2D)

- AA+

Muted (#8F97B6)

- AA

Purple buttons use white text exclusively.

---

## Minimum Requirements

Touch Targets

- 44×44px minimum

Focus Ring

- 2px solid #7658FF
- 2px offset

Interactive elements should never rely solely on color changes.

---

## Motion

Supports:

prefers-reduced-motion

When enabled:

- Disable floating illustrations
- Disable card lift animations
- Disable progress animations
- Disable hero entrance animations

---

## Design Principles

- Prioritize clarity over decoration.
- Use whitespace to create hierarchy.
- Reserve vibrant purple for meaningful interactions.
- Maintain consistent spacing across all modules.
- Keep navigation predictable and visually lightweight.
- Make educational progress the primary visual focus.
