---
name: Electric Dark
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
  on-surface-variant: '#c5c9ac'
  inverse-surface: '#e2e2e2'
  inverse-on-surface: '#303030'
  outline: '#8f9378'
  outline-variant: '#444932'
  surface-tint: '#b0d500'
  primary: '#ffffff'
  on-primary: '#2a3400'
  primary-container: '#caf300'
  on-primary-container: '#596c00'
  inverse-primary: '#536600'
  secondary: '#c8c6c5'
  on-secondary: '#313030'
  secondary-container: '#4a4949'
  on-secondary-container: '#bab8b7'
  tertiary: '#ffffff'
  on-tertiary: '#303030'
  tertiary-container: '#e4e2e1'
  on-tertiary-container: '#656464'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#caf300'
  primary-fixed-dim: '#b0d500'
  on-primary-fixed: '#171e00'
  on-primary-fixed-variant: '#3e4c00'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474646'
  tertiary-fixed: '#e4e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1b1c1c'
  on-tertiary-fixed-variant: '#474746'
  background: '#131313'
  on-background: '#e2e2e2'
  surface-variant: '#353535'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  display-sm:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
  title-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: '1.4'
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-lg:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.02em
  mono-value:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '700'
    lineHeight: '1.0'
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 12px
---

## Brand & Style
The design system is engineered for high-performance music production environments. It targets professional producers and live performers who require extreme legibility in low-light studio settings. 

The aesthetic is **High-Contrast / Modern** with a lean towards **Technical Minimalism**. It prioritizes functional precision through "Electric Dark" themes—using deep blacks to recede into the background while utilizing high-visibility neon accents to highlight critical data and active states. The emotional response should be one of "charged focus"—minimizing eye strain while providing clear, energetic feedback for every user interaction.

## Colors
This design system utilizes a high-octane palette designed for dark mode by default.
- **Primary (#D4FF00):** A "Neon Volt" used exclusively for active states, playback heads, level meters, and primary call-to-actions.
- **Surface & Background (#000000, #121212):** Pure black is used for the main workspace to ensure hardware blending (OLED optimization), while dark charcoal creates subtle hierarchy for panels and containers.
- **Secondary UI (#2A2A2A):** Used for inactive tracks, slider grooves, and button borders.
- **State Colors:** Success is tied to the primary neon; warnings should use a high-saturation orange (#FF8A00) to remain distinct from the neon-yellow primary.

## Typography
The typography system balances the Swiss-style readability of **Inter** with the technical precision of **JetBrains Mono**. 
- **Inter** is used for structural UI elements, headers, and general interface text to maintain a professional, clean look. 
- **JetBrains Mono** is utilized for all "active data" (BPM, frequency values, dB levels, and timecode) to ensure characters do not jump during rapid value changes (tabular figures) and to reinforce the "software extension" feel.
- High-contrast white (#FFFFFF) is used for primary text, while mid-gray (#888888) is used for inactive labels.

## Layout & Spacing
The layout follows a **dense, modular grid** inspired by DAW (Digital Audio Workstation) interfaces. It uses a 4px base unit to allow for the extreme information density required for music production tools.
- **Grid:** A flexible 12-column system for main views, but internal components (like knobs and faders) should align to a strict 4px micro-grid.
- **Density:** High. Margins between control groups are kept to a minimum (12px - 16px) to maximize the "at-a-glance" capability of the extension.
- **Reflow:** On smaller viewport widths, panels stack vertically, and labels may transition from `label-lg` to `label-sm` icons to save horizontal space.

## Elevation & Depth
In this design system, depth is achieved through **tonal layering and light-strokes** rather than traditional shadows.
- **Base Level (Level 0):** Pure black (#000000) for the main application background.
- **Panel Level (Level 1):** Dark charcoal (#121212) with a 1px solid border of #2A2A2A.
- **Active Elements:** Instead of elevation, active elements use a **Subtle Neon Glow**. When a button or meter is "on," it gains a 2px-4px outer blur using the primary primary color at 30% opacity.
- **Separators:** Use 1px solid lines in #222222 to define sections without adding visual bulk.

## Shapes
The shape language is **Strict & Sharp**. To mirror the precision of Ableton Live’s native environment, a 0px border radius is used for almost all containers, buttons, and input fields.
- **Hard Edges:** Reinforce the feeling of a professional tool/instrument.
- **Level Meters:** Must be rectangular with no rounding.
- **Fader Caps:** Rectangular with a 1px "Neon Volt" center line to indicate position.
- **Knobs:** Circular, but containing a sharp, needle-like indicator.

## Components
- **Buttons:** Ghost style by default with #2A2A2A borders. Active/Toggle-on state fills the border with Primary Neon and adds a subtle text glow.
- **Sliders/Faders:** The "track" is #121212. The "fill" (the amount currently selected) is Primary Neon. The fader handle is a high-contrast white or light gray block.
- **Level Meters:** Segmented blocks. As levels increase, the blocks are #2A2A2A (empty) or Primary Neon (filled). The top "peak" segment should transition to Primary Neon only momentarily.
- **Input Fields:** Flat #000000 background with #2A2A2A border. On focus, the border changes to Primary Neon.
- **Chips/Status Tags:** Small, all-caps monospace text. If a process is active, the chip has a Primary Neon dot next to the label.
- **Transport Controls:** Oversized icons (Play, Record, Stop). Record uses a saturated red (#FF0000), while Play uses Primary Neon.