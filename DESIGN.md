---
name: Obsidian Runway
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1b1b1b'
  surface-container: '#1f1f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353535'
  on-surface: '#e2e2e2'
  on-surface-variant: '#c4c7c8'
  inverse-surface: '#e2e2e2'
  inverse-on-surface: '#303030'
  outline: '#8e9192'
  outline-variant: '#444748'
  surface-tint: '#c6c6c7'
  primary: '#ffffff'
  on-primary: '#2f3131'
  primary-container: '#e2e2e2'
  on-primary-container: '#636565'
  inverse-primary: '#5d5f5f'
  secondary: '#c8c6c5'
  on-secondary: '#313030'
  secondary-container: '#474746'
  on-secondary-container: '#b7b5b4'
  tertiary: '#ffffff'
  on-tertiary: '#2f3131'
  tertiary-container: '#e3e2e2'
  on-tertiary-container: '#636465'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c7'
  on-primary-fixed: '#1a1c1c'
  on-primary-fixed-variant: '#454747'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#e3e2e2'
  tertiary-fixed-dim: '#c6c6c6'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#464747'
  background: '#131313'
  on-background: '#e2e2e2'
  surface-variant: '#353535'
typography:
  headline-xl:
    fontFamily: Hanken Grotesk
    fontSize: 120px
    fontWeight: '800'
    lineHeight: 100px
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 64px
    fontWeight: '700'
    lineHeight: 60px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: 0em
  label-caps:
    fontFamily: Space Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.2em
  ui-mono:
    fontFamily: Space Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0.05em
spacing:
  unit: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
  column-gap: 24px
---

## Brand & Style

This design system is built for the high-pressure, high-stakes environment of a luxury runway installation. It adopts a **Cinematic Brutalist** aesthetic—fusing the raw, industrial power of concrete architecture with the refined, exclusive polish of high-fashion editorial. The brand personality is intentionally intimidating, prestigious, and avant-garde.

The visual language draws inspiration from backstage technical passes, shipping manifests, and architectural blueprints. It prioritizes clarity and impact over "friendliness." The UI should feel like a high-end tool used by directors and insiders, featuring heavy use of film grain textures, scan-line overlays, and high-contrast transitions.

## Colors

The palette is strictly monochrome to maintain a sterile, luxury environment.

- **Deep Black (#000000):** The base of the interface. Used for backgrounds to create an infinite depth effect.
- **Stark White (#FFFFFF):** Reserved for primary typography and essential UI triggers. It should feel piercing against the black.
- **Architectural Greys (#1A1A1A, #F2F2F2):** Used for structural elements, borders, and secondary surfaces to create subtle "tone-on-tone" depth.
- **Metallic Silver (#C0C0C0):** An accent reserved exclusively for hover states or active interactive nodes, mimicking the cold sheen of industrial hardware.

## Typography

Typography is the primary engine of this design system. It utilizes **Hanken Grotesk** for its sharp, aggressive geometry in headlines and **Space Mono** for all UI-related metadata.

- **Editorial Headings:** Must be oversized and often tightly kerned. Headlines should feel "heavy" and dominate the viewport.
- **UI Labels:** Always all-caps with generous letter spacing (0.2em). This mimics the aesthetic of technical labeling and high-end garment tags.
- **Body Text:** Kept minimal and functional. 
- **Alignment:** Prefer flush-left or justified alignments to maintain the rigid, architectural grid.

## Layout & Spacing

The layout philosophy is a **Rigid Editorial Grid**. It uses a 12-column structure on desktop and a 4-column structure on mobile, but avoids fluid "softness." Elements should snap to the grid with zero margin between sections to create a monolithic look.

- **Margins:** Generous outer margins (64px+) on desktop create a sense of exclusivity and "frame" the content like a lookbook.
- **Asymmetry:** Use intentional empty columns to create tension and visual interest.
- **Scanning Lines:** Horizontal and vertical 1px lines (#1A1A1A) should be used to separate content blocks, mimicking technical drawings.

## Elevation & Depth

This system rejects shadows in favor of **Tonal Layering** and **Stark Outlines**. 

- **Level 0 (Base):** #000000.
- **Level 1 (Surfaces):** #1A1A1A with no rounded corners. 
- **Depth:** Depth is conveyed through "Stacking" rather than "Floating." High-contrast borders (1px White or Grey) define the boundaries of elements.
- **Visual Texture:** Apply a 2% opacity monochromatic grain filter over the entire UI to simulate film stock.
- **Scanning Effect:** Active containers may feature a subtle, high-speed vertical "scan-line" animation that occasionally flickers, reinforcing the industrial, surveillance-like vibe.

## Shapes

The shape language is absolute. **0px border radius** across all elements including buttons, inputs, cards, and images. 

- **Hard Edges:** Every element must appear as if cut from steel or stone.
- **Line Work:** Use 1px or 2px strokes for borders. Avoid "soft" dividers; use solid, high-contrast lines.
- **Cropping:** Images and videos should be cropped into harsh rectangles, often using unconventional aspect ratios (e.g., extremely tall 9:21 or wide 21:9).

## Components

### Buttons
- **Primary:** Full-width rectangular blocks of solid White (#FFFFFF) with Black (#000000) all-caps mono text.
- **Secondary:** 1px White stroke outline, no fill. On hover, the background fills with a Metallic Silver (#C0C0C0) gradient.
- **Interactive State:** Hovering over any button should trigger a slight "glitch" or immediate color inversion.

### Input Fields
- **Style:** A single 1px White underline or a stark, outlined box. 
- **Focus:** On focus, the stroke weight increases to 2px, and a small "REC" or "INPUT_ACTIVE" label appears in the top right corner in Space Mono.

### Chips & Tags
- **Style:** Small, sharp-edged boxes with a #1A1A1A background and White mono text. They should look like barcode labels or serial number plates.

### Lists
- **Style:** Separated by 1px Grey horizontal rules. Each item is numbered (01, 02, 03) in mono font to emphasize the sequential, runway-order nature of the content.

### Loading States
- **Style:** Use a typographic counter (00% to 100%) in a large, centered font, or a horizontal "Scanning" bar that moves rapidly across the screen.

### Cards
- **Style:** Transparent backgrounds with 1px architectural grey borders. Images inside cards should be black and white by default, shifting to full color only on interaction.