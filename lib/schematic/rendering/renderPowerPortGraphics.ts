import type { AnyCircuitElement, SchematicPath } from "circuit-json"
import { SCHEMATIC_SHEET_ID } from "../document"
import { scalePoint } from "../geometry"
import { createPowerPortLine } from "./createPowerPortLine"
import { getPowerPortPoint } from "./getPowerPortPoint"
import type { PowerPortGeometry, RenderedPowerPortGraphics } from "./types"

export function renderPowerPortGraphics({
  color,
  index,
  powerPortGeometry,
  scale,
  style,
}: {
  color: string
  index: number
  powerPortGeometry: PowerPortGeometry
  scale: number
  style: number
}): RenderedPowerPortGraphics {
  const { location } = powerPortGeometry
  const lineOptions = { color, index, scale }
  const elements: AnyCircuitElement[] = []
  if (style === 2) {
    elements.push(
      createPowerPortLine({
        ...lineOptions,
        end: getPowerPortPoint({ ...powerPortGeometry, along: 8 }),
        start: location,
        suffix: "power_port_stem",
      }),
      createPowerPortLine({
        ...lineOptions,
        end: getPowerPortPoint({ ...powerPortGeometry, along: 8, across: 5 }),
        start: getPowerPortPoint({
          ...powerPortGeometry,
          along: 8,
          across: -5,
        }),
        suffix: "power_port_bar",
      }),
    )
    return { elements, labelDistance: 12 }
  }
  if (style === 5) {
    elements.push(
      createPowerPortLine({
        ...lineOptions,
        end: getPowerPortPoint({ ...powerPortGeometry, along: 4 }),
        start: location,
        suffix: "power_port_stem",
      }),
      {
        type: "schematic_path",
        schematic_path_id: `schematic_power_port_altium_${index}`,
        schematic_sheet_id: SCHEMATIC_SHEET_ID,
        points: [
          getPowerPortPoint({ ...powerPortGeometry, along: 4, across: -7 }),
          getPowerPortPoint({ ...powerPortGeometry, along: 4, across: 7 }),
          getPowerPortPoint({ ...powerPortGeometry, along: 12 }),
        ].map((point) => scalePoint(point, scale)),
        stroke_width: 0.1,
        stroke_color: color,
        is_filled: false,
        is_dashed: false,
      } satisfies SchematicPath,
    )
    return { elements, labelDistance: 16 }
  }
  if (style === 4) {
    elements.push(
      createPowerPortLine({
        ...lineOptions,
        end: getPowerPortPoint({ ...powerPortGeometry, along: 4 }),
        start: location,
        suffix: "power_port_stem",
      }),
      ...[
        { along: 4, halfWidth: 7 },
        { along: 8, halfWidth: 4.5 },
        { along: 12, halfWidth: 2 },
      ].map(({ along, halfWidth }, lineIndex) =>
        createPowerPortLine({
          ...lineOptions,
          end: getPowerPortPoint({
            ...powerPortGeometry,
            along,
            across: halfWidth,
          }),
          start: getPowerPortPoint({
            ...powerPortGeometry,
            along,
            across: -halfWidth,
          }),
          suffix: `power_port_ground_${lineIndex}`,
        }),
      ),
    )
    return { elements, labelDistance: 16 }
  }
  if (style === 6) {
    elements.push(
      createPowerPortLine({
        ...lineOptions,
        end: getPowerPortPoint({ ...powerPortGeometry, along: 4 }),
        start: location,
        suffix: "power_port_stem",
      }),
      createPowerPortLine({
        ...lineOptions,
        end: getPowerPortPoint({ ...powerPortGeometry, along: 4, across: 7 }),
        start: getPowerPortPoint({
          ...powerPortGeometry,
          along: 4,
          across: -7,
        }),
        suffix: "power_port_chassis_bar",
      }),
      ...[
        { from: -7, to: -9 },
        { from: 0, to: -2 },
        { from: 7, to: 5 },
      ].map(({ from, to }, lineIndex) =>
        createPowerPortLine({
          ...lineOptions,
          end: getPowerPortPoint({
            ...powerPortGeometry,
            along: 9,
            across: to,
          }),
          start: getPowerPortPoint({
            ...powerPortGeometry,
            along: 4,
            across: from,
          }),
          suffix: `power_port_chassis_${lineIndex}`,
        }),
      ),
    )
    return { elements, labelDistance: 14 }
  }
  elements.push({
    type: "schematic_path",
    schematic_path_id: `schematic_power_port_altium_${index}`,
    schematic_sheet_id: SCHEMATIC_SHEET_ID,
    points: [
      location,
      getPowerPortPoint({ ...powerPortGeometry, along: 10, across: -5 }),
      getPowerPortPoint({ ...powerPortGeometry, along: 10, across: 5 }),
    ].map((point) => scalePoint(point, scale)),
    stroke_width: 0.1,
    stroke_color: color,
    fill_color: color,
    is_filled: true,
    is_dashed: false,
  } satisfies SchematicPath)
  return { elements, labelDistance: 14 }
}
