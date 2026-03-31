/**
 * Design System: The Editorial Nutritionist
 * Creative North Star: "The Living Ledger"
 *
 * Key Rules (from DESIGN.md):
 *  - No 1px borders — boundaries via tonal color shifts only
 *  - No pure black (#000000) — use inverseSurface (#0c0f0b)
 *  - Minimum border radius: 16px (Radius.md)
 *  - Signature gradient: primary → primaryContainer at 135°
 *  - Glassmorphism: surface at 80% opacity + 24px blur for nav/overlays
 */



// ─── Color Palette ────────────────────────────────────────────────────────────

export const Colors = {
  // Primary — Botanical Green
  primary: '#006f1d',
  onPrimary: '#ffffff',
  primaryContainer: '#91f78e',
  onPrimaryContainer: '#002204',

  // Secondary — Aquatic Blue
  secondary: '#00649b',
  onSecondary: '#f6f9ff',
  secondaryContainer: '#cce5ff',
  onSecondaryContainer: '#001d32',
  secondaryFixedDim: '#a0c9f5',

  // Tertiary — Warm Alert (use sparingly for limits/warnings)
  tertiary: '#ad350a',
  onTertiary: '#ffffff',
  tertiaryContainer: '#ffdbd0',
  onTertiaryContainer: '#3e0900',

  // Surface Hierarchy — matte paper layers, lightest → darkest
  background: '#f8faf2',
  surface: '#f8faf2',
  surfaceContainerLowest: '#ffffff',   // Cards — maximum pop
  surfaceContainerLow: '#f1f5eb',      // Secondary sections
  surfaceContainerHigh: '#e8eee0',     // Input fields
  surfaceContainerHighest: '#dde5d4',  // Progress ring tracks
  surfaceDim: '#d8dfd0',               // Unselected chip backs
  surfaceBright: '#f8faf2',
  surfaceVariant: '#dde5d5',           // Modal backdrops (60% alpha)

  // Text / Content
  onSurface: '#2e342b',
  onSurfaceVariant: '#717968',         // Timestamps, unit labels
  outline: '#8f9984',
  outlineVariant: '#c1c9b8',           // Ghost borders at 15% opacity

  // Deep contrast — never use #000000
  inverseSurface: '#0c0f0b',
  onInverseSurface: '#f0f2ea',
  inversePrimary: '#6bdb6c',

  // Semantic
  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',
  onErrorContainer: '#410002',

  // Glass overlay helpers
  /** surface at 80% opacity hex — for glassmorphism overlays */
  glassBackground: 'rgba(248, 250, 242, 0.85)',
  /** onSurface at 4% — for ambient FAB shadows */
  ambientShadow: 'rgba(46, 52, 43, 0.04)',
} as const;

export type ColorToken = keyof typeof Colors;

// ─── Typography ───────────────────────────────────────────────────────────────
// Plus Jakarta Sans — Display & Headlines (authority, wide aperture)
// Manrope           — Titles & Body (legibility in dense data)

export const FontFamily = {
  // Plus Jakarta Sans
  display: 'PlusJakartaSans_400Regular',
  displayMedium: 'PlusJakartaSans_500Medium',
  displaySemiBold: 'PlusJakartaSans_600SemiBold',
  displayBold: 'PlusJakartaSans_700Bold',
  displayExtraBold: 'PlusJakartaSans_800ExtraBold',

  // Manrope
  body: 'Manrope_400Regular',
  bodyMedium: 'Manrope_500Medium',
  bodySemiBold: 'Manrope_600SemiBold',
  bodyBold: 'Manrope_700Bold',
  bodyExtraBold: 'Manrope_800ExtraBold',
} as const;

export type FontFamilyToken = keyof typeof FontFamily;

/** Type scale — rem → px (base 16px) */
export const FontSize = {
  displayLg: 56,    // 3.5rem — hero calorie numbers (Display-LG)
  displayMd: 48,    // 3rem   — section hero numbers
  displaySm: 40,    // 2.5rem
  headlineLg: 32,   // 2rem
  headlineMd: 28,   // 1.75rem
  headlineSm: 24,   // 1.5rem
  titleLg: 20,      // 1.25rem
  titleMd: 18,      // 1.125rem — meal names (Title-MD)
  titleSm: 16,      // 1rem
  bodyLg: 16,       // 1rem
  bodyMd: 14,       // 0.875rem — macro breakdowns (Body-MD)
  bodySm: 12,       // 0.75rem
  labelMd: 12,      // 0.75rem
  labelSm: 11,      // 0.6875rem — timestamps, unit measures (Label-SM)
} as const;

export type FontSizeToken = keyof typeof FontSize;

// ─── Line Heights ─────────────────────────────────────────────────────────────

export const LineHeight = {
  displayLg: 64,
  displayMd: 56,
  displaySm: 48,
  headlineLg: 40,
  headlineMd: 36,
  headlineSm: 32,
  titleLg: 28,
  titleMd: 26,
  titleSm: 24,
  bodyLg: 24,
  bodyMd: 20,
  bodySm: 18,
  labelMd: 16,
  labelSm: 16,
} as const;

// ─── Spacing ──────────────────────────────────────────────────────────────────

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 20,
  six: 24,
  seven: 28,
  eight: 32,
  nine: 40,
  ten: 48,
  twelve: 64,
} as const;

export type SpacingToken = keyof typeof Spacing;

// ─── Border Radius ────────────────────────────────────────────────────────────
// DESIGN RULE: No standard 4px corners. Minimum is sm (12px). Default is md (16px).

export const Radius = {
  sm: 12,
  md: 16,    // DEFAULT minimum for most containers
  lg: 20,
  xl: 24,
  xxl: 32,
  full: 9999,
} as const;

export type RadiusToken = keyof typeof Radius;

// ─── Elevation / Shadow ───────────────────────────────────────────────────────
// We use tonal layering over drop shadows.
// If an element must float (FAB), use ambientShadow at 4% / 32px blur.

export const Elevation = {
  /** Ambient shadow for floating elements (FAB, snackbar) */
  float: {
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 32,
    elevation: 4,
  },
  /** Subtle lift for cards over low-container background */
  card: {
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
} as const;

// ─── Platform helpers ─────────────────────────────────────────────────────────

/** Android navigation bar safe area offset */
export const BottomTabInset = 16;
export const MaxContentWidth = 800;
