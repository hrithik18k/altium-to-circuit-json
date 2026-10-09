import type { AltiumPoint, AltiumRecord } from "altiumts"
import type { AnyCircuitElement } from "circuit-json"
import type { SymbolSelection } from "../model"
import { convertOwnedComponentRecords } from "./convertOwnedComponentRecords"
import type { ComponentConversionContext, ComponentIdentity } from "./types"

export function convertNativeBodyWithSourceText(
  {
    selection,
    center,
    identity,
    records,
  }: {
    selection: SymbolSelection
    center: AltiumPoint
    identity: ComponentIdentity
    records: AltiumRecord[]
  },
  context: ComponentConversionContext,
): AnyCircuitElement[] | undefined {
  // Native symbols embed fixed REF/VAL labels. Export their body separately
  // so source text can retain its layout without duplicate catalog labels.
  const body = selection.symbol.primitives.filter((p) => p.type !== "text")
  if (body.some((p) => p.type !== "path")) return undefined
  const labels = records.filter((record) =>
    ["4", "34", "41"].includes(record.recordKind ?? ""),
  )
  // Without an explicit source designator, retain the catalog's fallback labels.
  if (
    !labels.some(
      (record) => record.recordKind === "34" && !record.getBoolean("ISHIDDEN"),
    )
  )
    return undefined
  const paths: AnyCircuitElement[] = body.flatMap((primitive, index) => {
    if (primitive.type !== "path") return []
    return [
      {
        type: "schematic_path",
        schematic_path_id: `${identity.schematicComponentId}_native_${index}`,
        schematic_component_id: identity.schematicComponentId,
        schematic_sheet_id: context.options.schematicSheetId,
        points: primitive.points.map((point) => ({
          x: center.x + point.x - selection.symbol.center.x,
          y: center.y + point.y - selection.symbol.center.y,
        })),
        stroke_width: primitive.strokeWidth ?? 0.012,
        stroke_color: "#800000",
        is_filled: primitive.fill === true,
        is_dashed: false,
        ...(primitive.fill ? { fill_color: "#800000" } : {}),
      },
    ]
  })
  const text = convertOwnedComponentRecords(
    {
      ownedRecords: labels,
      schematicComponentId: identity.schematicComponentId,
    },
    context,
  )
  return [
    ...paths,
    ...text.map((element) =>
      element.type === "schematic_text"
        ? { ...element, color: "#000000" }
        : element,
    ),
  ]
}
