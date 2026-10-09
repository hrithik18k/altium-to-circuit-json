import type { PcbBoard, SourceNet } from "circuit-json"
import { stackSvgsHorizontally } from "stack-svgs"

const NOT_EMITTED = "not emitted"

function formatMillimeters(measurement: number | undefined): string {
  return measurement === undefined
    ? NOT_EMITTED
    : `${Number(measurement.toFixed(6))} mm`
}

function formatBoolean(flag: boolean | undefined): string {
  return flag === undefined ? NOT_EMITTED : String(flag)
}

function getSourceNetTraceWidth(sourceNets: SourceNet[]): number | undefined {
  const traceWidthsMillimeters = [
    ...new Set(
      sourceNets.flatMap(({ trace_width }) =>
        trace_width === undefined ? [] : [trace_width],
      ),
    ),
  ]
  return traceWidthsMillimeters.length === 1
    ? traceWidthsMillimeters[0]
    : undefined
}

export function createRoutingConstraintsComparisonSvg({
  board,
  boardComparisonSvg,
  sourceNets,
}: {
  board: PcbBoard
  boardComparisonSvg: string
  sourceNets: SourceNet[]
}): string {
  const rows = [
    {
      actual: formatBoolean(board.allow_blind_and_buried_vias),
      expected: "true",
      field: "allow_blind_and_buried_vias",
    },
    {
      actual: formatBoolean(board.is_via_in_pad_allowed),
      expected: "true",
      field: "is_via_in_pad_allowed",
    },
    {
      actual: formatMillimeters(board.min_trace_width),
      expected: "0.1524 mm",
      field: "min_trace_width",
    },
    {
      actual: formatMillimeters(getSourceNetTraceWidth(sourceNets)),
      expected: "0.254 mm",
      field: "source_net.trace_width",
    },
    {
      actual: formatMillimeters(board.min_via_pad_diameter),
      expected: "0.2032 mm",
      field: "min_via_pad_diameter",
    },
    {
      actual: formatMillimeters(board.min_via_hole_diameter),
      expected: "0.1016 mm",
      field: "min_via_hole_diameter",
    },
  ]
  const rowSvg = rows
    .map(({ actual, expected, field }, index) => {
      const y = 190 + index * 76
      const actualColor = actual === expected ? "#15803d" : "#b91c1c"
      return [
        `<text x="48" y="${y}" font-size="23" font-family="monospace" fill="#111827">${field}</text>`,
        `<text x="48" y="${y + 30}" font-size="20" font-family="sans-serif" fill="#475569">Altium: ${expected}</text>`,
        `<text x="420" y="${y + 30}" font-size="20" font-family="sans-serif" fill="${actualColor}">Circuit JSON: ${actual}</text>`,
      ].join("")
    })
    .join("")
  const routingConstraintsSvg = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">',
    '<rect width="800" height="800" fill="#ffffff"/>',
    '<text x="48" y="70" font-size="32" font-weight="700" font-family="sans-serif" fill="#111827">PMP22650 routing constraints</text>',
    '<text x="48" y="112" font-size="20" font-family="sans-serif" fill="#475569">Source design compared with converted output</text>',
    rowSvg,
    "</svg>",
  ].join("")

  return stackSvgsHorizontally([boardComparisonSvg, routingConstraintsSvg], {
    gap: 24,
    normalizeSize: false,
    rootAttributes: {
      "aria-label":
        "PMP22650 Altium, Circuit JSON, and routing constraints comparison",
      role: "img",
    },
  })
}
