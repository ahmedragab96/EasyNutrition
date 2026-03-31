# Design System: The Editorial Nutritionist

## 1. Overview & Creative North Star
The "Creative North Star" for this design system is **"The Living Ledger."** We are moving away from the "medical database" feel of traditional trackers and toward a high-end, editorial experience that feels like a premium wellness journal. 

This system breaks the "template" look by rejecting rigid boxes and heavy borders. Instead, we use **Tonal Depth** and **Intentional Asymmetry**. We favor large, breathing white space and overlapping elements—such as a progress ring subtly breaking the boundary of a container—to create a sense of organic movement. The goal is a UI that feels "soft" yet authoritative, using high-contrast typography to ensure data is never lost in the aesthetic.

---

## 2. Colors & Surface Philosophy
The palette is rooted in botanical greens and deep aquatic blues, grounded by a sophisticated "Off-White" surface (`#f8faf2`).

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning or containment. 
*   **Boundaries:** Defined solely through background color shifts. A `surface-container-low` card should sit directly on a `background` or `surface` floor.
*   **Contrast:** High readability is achieved via the `on-surface` (`#2e342b`) and `on-secondary` (`#f6f9ff`) tokens, not through outlines.

### Surface Hierarchy & Nesting
Treat the UI as physical layers of fine, matte paper.
*   **Base Layer:** `surface` (`#f8faf2`) or `background`.
*   **Secondary Sections:** `surface-container-low` (`#f1f5eb`).
*   **Elevated Content (Cards):** `surface-container-lowest` (`#ffffff`) for maximum "pop."
*   **Interactive Overlays:** Use `surface-bright` for elements that need to feel "active."

### The "Glass & Gradient" Rule
To elevate the "Modern" requirement:
*   **Glassmorphism:** For floating navigation bars or snackbars, use `surface` at 80% opacity with a `24px` backdrop-blur. 
*   **Signature Textures:** Use a linear gradient from `primary` (`#006f1d`) to `primary-container` (`#91f78e`) at a 135-degree angle for hero progress rings and primary CTAs. This creates "visual soul" and depth that a flat color lacks.

---

## 3. Typography
We utilize a pairing of **Plus Jakarta Sans** for structure and **Manrope** for utility.

*   **Display & Headlines (Plus Jakarta Sans):** Used for big "Hero" numbers (calories remaining, protein grams). The wide aperture of this font conveys modern authority. 
    *   *Display-LG (`3.5rem`):* For "Calorie Deficit" numbers.
*   **Titles & Body (Manrope):** Chosen for its high legibility in dense data environments.
    *   *Title-MD (`1.125rem`):* For meal names (e.g., "Avocado Toast").
    *   *Body-MD (`0.875rem`):* For nutritional breakdowns (Fats, Carbs, Protein).
*   **Label-SM (`0.6875rem`):** Used for micro-data (timestamps, unit measures), always in `on-surface-variant` to maintain hierarchy.

---

## 4. Elevation & Depth
We eschew traditional drop shadows for **Tonal Layering**.

*   **The Layering Principle:** Depth is achieved by stacking. A `surface-container-lowest` card on a `surface-container-low` background creates a natural lift.
*   **Ambient Shadows:** If an element must "float" (e.g., a FAB), use a shadow color of `#2e342b` (on-surface) at **4% opacity** with a **32px blur**. This mimics natural ambient light.
*   **The "Ghost Border" Fallback:** If accessibility requires a container edge, use `outline-variant` at **15% opacity**. Never use 100% opaque lines.
*   **Glassmorphism:** Use `surface-variant` with a 60% alpha and blur for modal backdrops to keep the user grounded in their current context.

---

## 5. Components

### Buttons & Chips
*   **Primary Button:** Uses the `primary` to `primary-container` signature gradient. Corner radius: `full` (9999px) for a soft, pill-like feel.
*   **Selection Chips:** Must use `secondary-container` for the "Selected" state. Forbid borders; use a soft `surface-dim` background for unselected states.

### Data Visualization (Progress Rings)
*   **The Core Metric:** Use `xl` (3rem) or `full` roundness. The "track" of the progress ring should be `surface-container-highest`. The "fill" should be the `secondary` (`#00649b`) to `secondary-fixed-dim` gradient.

### Cards & Lists
*   **Strict Rule:** No dividers. Use `spacing-6` (1.5rem) of vertical white space to separate list items. 
*   **Interaction:** On tap, a card should shift from `surface-container-low` to `surface-container-lowest` to provide haptic visual feedback.

### Input Fields
*   **Styling:** Forgo the "bottom line" or "boxed" look. Use a subtle `surface-container-high` fill with `rounded-md` (1.5rem) corners. The label (`label-md`) should sit 4px above the container, never inside it.

### New Component: "The Macro-Bar"
A segmented progress bar where `primary` (Protein), `secondary` (Carbs), and `tertiary` (Fats) sit flush against each other. Use `rounded-full` for the parent container only; internal segments are divided by a `2px` "gap" of the background color, not a line.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use asymmetrical margins. If a header is indented `spacing-8`, let the sub-text indent `spacing-10` to create an editorial flow.
*   **Do** use `tertiary` (`#ad350a`) sparingly for limits (e.g., "Sugar Limit Reached"). It should feel like an alert, not an error.
*   **Do** prioritize "Fast Interactions." Every tap should trigger a micro-scale animation (e.g., 0.98x scale down).

### Don't:
*   **Don't** use pure black (`#000000`). Use `inverse_surface` (`#0c0f0b`) for deep contrast.
*   **Don't** use 1px dividers. If you feel you need a line, use a background color change instead.
*   **Don't** use "Standard" 4px rounded corners. Use the **Roundedness Scale** (`DEFAULT: 1rem` or higher) to maintain the soft, premium feel of the system.