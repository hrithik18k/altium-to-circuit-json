import type { AnyCircuitElement, SchematicGroup } from "circuit-json"
import { scaleLength, scalePoint } from "../geometry"
import { SCHEMATIC_SHEET_ID } from "./constants"
import { translateSchematicElement } from "./translateSchematicElement"
import type { SchematicConversionContext } from "./types"

export function finalizeSchematicConversion(
  context: SchematicConversionContext,
): void {
  const schematicComponentIds = context.elements
    .filter(
      (
        element,
      ): element is Extract<
        AnyCircuitElement,
        { type: "schematic_component" }
      > => element.type === "schematic_component",
    )
    .map((element) => element.schematic_component_id)

  if (schematicComponentIds.length > 0) {
    context.elements.push({
      type: "schematic_group",
      schematic_group_id: "schematic_group_altium",
      source_group_id: "source_group_altium",
      schematic_sheet_id: SCHEMATIC_SHEET_ID,
      center: scalePoint(
        {
          x: context.sheetDimensions.width / 2,
          y: context.sheetDimensions.height / 2,
        },
        context.scale,
      ),
      width: scaleLength(context.sheetDimensions.width, context.scale),
      height: scaleLength(context.sheetDimensions.height, context.scale),
      schematic_component_ids: schematicComponentIds,
      name: context.options.sheetName ?? "Altium schematic",
    } satisfies SchematicGroup)
  }

  if (context.options.centerOnSchematicSheet === false) return
  const offset = scalePoint(
    {
      x: -context.sheetDimensions.width / 2,
      y: -context.sheetDimensions.height / 2,
    },
    context.scale,
  )
  context.elements = context.elements.map((element) =>
    translateSchematicElement(element, offset),
  )
}
