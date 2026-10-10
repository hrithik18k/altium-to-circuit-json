import type { AltiumRecord } from "altiumts"
import type { AnyCircuitElement } from "circuit-json"
import { convertOwnedComponentRecords } from "../components/convertOwnedComponentRecords"
import { convertPrimitiveGatePin } from "../components/convertPrimitiveGatePin"
import { getComponentBodyBounds } from "../components/getComponentBodyBounds"
import type {
  ComponentConversionContext,
  ComponentIdentity,
} from "../components/types"
import { getBoundsCenter, scaleLength, scalePoint } from "../geometry"
import type { ConvertedPort } from "../model"
import { COMPATIBILITY_SYMBOL_CATALOG } from "./compatibilitySymbolCatalog"
import { getCompatibilitySymbolKind } from "./getCompatibilitySymbolKind"

export function convertCompatibilityComponentBody(
  {
    identity,
    ports,
    records,
  }: {
    identity: ComponentIdentity
    ports: ConvertedPort[]
    records: AltiumRecord[]
  },
  context: ComponentConversionContext,
): AnyCircuitElement[] | undefined {
  const kind = getCompatibilitySymbolKind({ identity, ports })
  if (!kind) return undefined
  const template = COMPATIBILITY_SYMBOL_CATALOG[kind]
  if (!template) return undefined
  // Only the placement envelope is retained. Artwork is generated from the
  // compatibility catalog, never from source polygon/line/arc records.
  const bounds = getComponentBodyBounds(
    records,
    ports.map((port) => port.point),
  )
  const center = scalePoint(getBoundsCenter(bounds), context.options.scale)
  const width = Math.max(
    scaleLength(bounds.maxX - bounds.minX, context.options.scale),
    0.4,
  )
  const height = Math.max(
    scaleLength(bounds.maxY - bounds.minY, context.options.scale),
    0.4,
  )
  const common = {
    schematic_component_id: identity.schematicComponentId,
    schematic_sheet_id: context.options.schematicSheetId,
  }
  const elements: AnyCircuitElement[] = [
    {
      type: "schematic_rect",
      schematic_rect_id: `compatibility_frame_${identity.schematicComponentId}`,
      ...common,
      center,
      width,
      height,
      rotation: 0,
      color: "#840000",
      stroke_width: 0.012,
      fill_color: "#ffffc2",
      is_filled: true,
      is_dashed: false,
    },
  ]
  if (template.legend && context.options.includeText !== false) {
    elements.push({
      type: "schematic_text",
      schematic_text_id: `compatibility_kind_${identity.schematicComponentId}`,
      ...common,
      text: template.legend,
      position: center,
      font_size: Math.min(
        height * 0.22,
        width / Math.max(template.legend.length, 1),
      ),
      rotation: 0,
      anchor: "center",
      color: "#0f0f0f",
    })
  }
  return [
    ...elements,
    ...convertOwnedComponentRecords(
      {
        schematicComponentId: identity.schematicComponentId,
        ownedRecords: records.filter((record) =>
          ["4", "34", "41"].includes(record.recordKind ?? ""),
        ),
      },
      context,
    ),
    ...ports
      .flatMap((port) => convertPrimitiveGatePin(port, context))
      .map((element) =>
        element.type === "schematic_line" ||
        element.type === "schematic_circle" ||
        element.type === "schematic_path"
          ? { ...element, stroke_width: 0.012 }
          : element,
      ),
  ]
}
