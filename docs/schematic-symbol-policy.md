# Schematic symbol policy

Prefer reusable symbols from `schematic-symbols`. Identify devices from component metadata and match functional terminal names before numeric pin numbers. A supported native symbol must take precedence over source body graphics.

When native automatic labels would lose source layout, place the catalog's primitives at the source terminal positions and retain source text placement. The body still comes from the native catalog. Source capacitor polarity marks and curved plates may identify terminal meaning; their artwork is not copied.

The small compatibility catalog contains independently defined IEC AND, OR, and XOR symbols missing from the shared catalog. It retains terminal positions, pin visibility, inversion markers, and source labels while generating its own body. Add suitable reusable symbols to the shared library when available.

Detailed devices without a suitable native or compatibility symbol retain the existing fallback until a faithful replacement is available. These fallbacks use the native palette: dark-red outlines and foreground fills, pale-yellow backgrounds, black component text, red pin numbers, and teal pin names. Sheet annotations keep their original styling. This migration does not replace unsupported transformer windings, switch contacts, or protection networks with generic boxes.
