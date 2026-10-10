import type { AltiumRecord } from "altiumts"
import type { AnyCircuitElement } from "circuit-json"
import { convertOwnedComponentRecords } from "../components/convertOwnedComponentRecords"
import type {
  ComponentConversionContext,
  ComponentIdentity,
} from "../components/types"
import { getAveragePoint } from "../geometry"
import type { SymbolSelection } from "../model"

export function fitNativeSymbolToSourceLayout(
  {
    identity,
    records,
    selection,
  }: {
    identity: ComponentIdentity
    records: AltiumRecord[]
    selection: SymbolSelection
  },
  context: ComponentConversionContext,
): AnyCircuitElement[] | undefined {
  const [first, second] = selection.assignments
  if (!first || !second || selection.assignments.length !== 2) return undefined
  if (
    selection.symbol.primitives.some(
      (primitive) =>
        primitive.type !== "path" &&
        primitive.type !== "text" &&
        !(primitive.type === "circle" && primitive.radius === 0),
    )
  )
    return undefined
  const sourceSpan = Math.hypot(
    first.convertedPort.schematicPort.center.x -
      second.convertedPort.schematicPort.center.x,
    first.convertedPort.schematicPort.center.y -
      second.convertedPort.schematicPort.center.y,
  )
  const nativeSpan = Math.hypot(
    first.symbolPort.x - second.symbolPort.x,
    first.symbolPort.y - second.symbolPort.y,
  )
  if (sourceSpan < 1e-8 || nativeSpan < 1e-8) return undefined
  const scale = sourceSpan / nativeSpan
  const sourceVector = {
    x:
      second.convertedPort.schematicPort.center.x -
      first.convertedPort.schematicPort.center.x,
    y:
      second.convertedPort.schematicPort.center.y -
      first.convertedPort.schematicPort.center.y,
  }
  if (
    Math.hypot(
      sourceVector.x - (second.symbolPort.x - first.symbolPort.x) * scale,
      sourceVector.y - (second.symbolPort.y - first.symbolPort.y) * scale,
    ) > 1e-8
  )
    return undefined
  const nativeCenter = getAveragePoint(
    selection.assignments.map((assignment) => assignment.symbolPort),
  )
  const center = getAveragePoint(
    selection.assignments.map(
      (assignment) => assignment.convertedPort.schematicPort.center,
    ),
  )
  const body: AnyCircuitElement[] = selection.symbol.primitives.flatMap(
    (primitive, index) =>
      primitive.type === "path"
        ? [
            {
              type: "schematic_path" as const,
              schematic_path_id: `native_catalog_${selection.name}_${identity.schematicComponentId}_${index}`,
              schematic_component_id: identity.schematicComponentId,
              schematic_sheet_id: context.options.schematicSheetId,
              points: primitive.points.map((point) => ({
                x: center.x + (point.x - nativeCenter.x) * scale,
                y: center.y + (point.y - nativeCenter.y) * scale,
              })),
              stroke_color: "#840000",
              stroke_width: primitive.strokeWidth ?? 0.012,
              is_filled: primitive.fill ?? false,
              fill_color: primitive.fill ? "#840000" : "transparent",
              is_dashed: false,
            },
          ]
        : [],
  )
  return [
    ...body,
    ...convertOwnedComponentRecords(
      {
        schematicComponentId: identity.schematicComponentId,
        ownedRecords: records.filter(
          (record) =>
            ["4", "34", "41"].includes(record.recordKind ?? "") &&
            record.getDecoded("TEXT")?.trim() !== "+",
        ),
      },
      context,
    ),
  ]
}
