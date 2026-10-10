import {
  type AltiumRecord,
  AltiumSchDesignatorRecord,
  AltiumSchLabelRecord,
  AltiumSchParameterRecord,
} from "altiumts"
import type { SchematicComponent, SchematicText } from "circuit-json"
import type { SymbolSelection } from "../model"
import { scalePoint, subtractPoints } from "../geometry"
import { convertOwnedComponentRecords } from "./convertOwnedComponentRecords"
import { createComponentText } from "./createComponentText"
import type { ComponentConversionContext, ComponentIdentity } from "./types"

export function addNativePassiveLabels(
  {
    component,
    identity,
    records,
    selection,
  }: {
    component: SchematicComponent
    identity: ComponentIdentity
    records: AltiumRecord[]
    selection: SymbolSelection | undefined
  },
  context: ComponentConversionContext,
): void {
  if (!selection || !/^(boxresistor|capacitor)_/.test(selection.name)) return
  // Native catalog labels cannot rotate. Keep the native body and render each
  // placement's labels separately; source_component.name remains its identity.
  component.symbol_display_value = ""
  if (context.options.includeText === false) return
  const labels = records.filter(
    (record) =>
      record instanceof AltiumSchDesignatorRecord ||
      record instanceof AltiumSchParameterRecord ||
      (record instanceof AltiumSchLabelRecord &&
        !["+", "-"].includes(record.text?.trim() ?? "")),
  )
  const labelElements = convertOwnedComponentRecords(
    {
      ownedRecords: labels,
      schematicComponentId: identity.schematicComponentId,
    },
    context,
  ).filter((element) => element.type === "schematic_text")
  for (const primitive of selection.symbol.primitives) {
    if (
      primitive.type !== "text" ||
      !["{REF}", "{VAL}"].includes(primitive.text)
    )
      continue
    const isReference = primitive.text === "{REF}"
    const hasSourceLabel = labels.some((record) =>
      isReference
        ? record instanceof AltiumSchDesignatorRecord
        : record instanceof AltiumSchParameterRecord &&
          ["value", "comment"].includes(record.name?.toLowerCase() ?? ""),
    )
    // Hidden source labels stay hidden. Only absent labels need a fallback.
    if (hasSourceLabel) continue
    const text = isReference ? identity.designator : identity.displayText
    if (!text) continue
    const anchors: Record<string, SchematicText["anchor"]> = {
      middle_left: "center_left",
      middle_right: "center_right",
      middle_bottom: "bottom_center",
      middle_top: "top_center",
      bottom_left: "bottom_left",
      top_left: "top_left",
    }
    const offset = scalePoint(
      subtractPoints(primitive, selection.symbol.center),
      selection.geometryScale ?? 1,
    )
    labelElements.push({
      ...createComponentText({
        anchor: anchors[primitive.anchor] ?? "center",
        component,
        id: `${identity.schematicComponentId}_${isReference ? "ref" : "val"}`,
        position: {
          x: component.center.x + offset.x,
          y: component.center.y + offset.y,
        },
        text,
      }),
      color: "#000000",
    })
  }
  // circuit-to-svg 0.0.436 skips component-owned text on native symbols.
  // Sheet annotations preserve layout without replacing the native body.
  context.elements.push(
    ...labelElements.map(({ schematic_component_id, ...label }) => ({
      ...label,
      color: "#000000",
      schematic_sheet_id: component.schematic_sheet_id,
      schematic_text_id: `${identity.schematicComponentId}_label_${label.schematic_text_id}`,
    })),
  )
}
