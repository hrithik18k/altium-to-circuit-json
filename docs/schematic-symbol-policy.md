# Schematic symbol policy

Prefer reusable symbols from `schematic-symbols`. Identify devices from component metadata and match functional terminal names before numeric pin numbers. A supported native symbol must take precedence over source body graphics.

Native passives reference the catalog symbol directly. Preserve source label positions and sizes as separate annotations so the renderer displays them once. Center symbols on their terminals and scale resistor geometry when needed to preserve dense layouts. Capacitor terminal names and nearby polarity marks determine terminal meaning; curved plates only resolve polarity for an already polarized device. Conflicting evidence retains the fallback rather than guessing. Source body artwork is not copied for supported native passives.

The small compatibility catalog contains independently defined IEC AND, OR, and XOR symbols missing from the shared catalog. It retains terminal positions, pin visibility, inversion markers, and source labels while generating its own body. Add suitable reusable symbols to the shared library when available.

Detailed devices without a suitable native or compatibility symbol retain the existing fallback until a faithful replacement is available. These fallbacks use the native palette: dark-red outlines and foreground fills, pale-yellow backgrounds, black component text, red pin numbers, and teal pin names. Sheet annotations keep their original styling. This migration does not replace unsupported transformer windings, switch contacts, or protection networks with generic boxes.
