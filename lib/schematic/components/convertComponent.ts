import { type AltiumSchComponentRecord, AltiumSchPinRecord } from "altiumts"
import type { SchematicComponent } from "circuit-json"
import { getComponentCenter } from "./getComponentCenter"
import { addNativePassiveLabels } from "./addNativePassiveLabels"
import { applyNativeSymbolPortGeometry } from "../symbols"
import { addComponentFallbackText } from "./addComponentFallbackText"
import { convertComponentPin } from "./convertComponentPin"
import { convertPinlessComponent } from "./convertPinlessComponent"
import { createComponentPinEdgeElements } from "./createComponentPinEdgeElements"
import { createSourceComponent } from "./createSourceComponent"
import { getComponentBodyBounds } from "./getComponentBodyBounds"
import { getComponentIdentity } from "./getComponentIdentity"
import { getComponentSize } from "./getComponentSize"
import { getVisibleSymbolLabels } from "./getVisibleSymbolLabels"
import { isOwnedRecordVisible } from "./isOwnedRecordVisible"
import { isPinHidden } from "./isPinHidden"
import { selectComponentBody } from "./selectComponentBody"
import type { ComponentConversionContext } from "./types"
export function convertComponent(
  {
    componentIndex,
    componentRecord,
  }: {
    componentIndex: number
    componentRecord: AltiumSchComponentRecord
  },
  context: ComponentConversionContext,
): void {
  const { convertedPorts, document, elements, handledRecords, options } =
    context
  handledRecords.add(componentRecord)
  const ownedRecords = document.index.getOwnedRecords(componentRecord)
  for (const ownedRecord of ownedRecords) handledRecords.add(ownedRecord)
  const currentPartId = componentRecord.currentPartId ?? 1
  const visibleOwnedRecords = ownedRecords.filter((record) =>
    isOwnedRecordVisible(record, currentPartId),
  )
  const pins = visibleOwnedRecords.filter(
    (record): record is AltiumSchPinRecord =>
      record instanceof AltiumSchPinRecord &&
      (!isPinHidden(record) || options.includeHidden === true),
  )
  const identity = getComponentIdentity(
    { componentIndex, componentRecord, ownedRecords },
    context,
  )
  if (identity.shouldCreateSourceComponent) {
    elements.push(
      createSourceComponent({
        ...identity,
        pinCount: pins.length,
      }),
    )
  }
  if (pins.length === 0) {
    convertPinlessComponent(
      { identity, ownedRecords: visibleOwnedRecords },
      context,
    )
    return
  }
  const visibleSymbolLabels = getVisibleSymbolLabels(visibleOwnedRecords)
  const componentPorts = pins.map((pin, pinIndex) =>
    convertComponentPin({
      document,
      options,
      pin,
      pinIndex,
      schematicComponentId: identity.schematicComponentId,
      sheetRecord: context.sheetRecord,
      sourceComponentId: identity.sourceComponentId,
      visibleSymbolLabels,
    }),
  )
  const bodyBounds = getComponentBodyBounds(
    visibleOwnedRecords,
    componentPorts.map(({ point }) => point),
  )
  const { symbolSelection, ownedComponentBody, rendersOwnPins } =
    selectComponentBody(
      {
        identity,
        pins,
        records: visibleOwnedRecords,
        componentPorts,
        visibleSymbolLabels,
        bodyBounds,
      },
      context,
    )
  const center = getComponentCenter({
    bodyBounds,
    ports: componentPorts,
    scale: options.scale,
    selection: symbolSelection,
  })
  const size = getComponentSize({
    bodyBounds,
    scale: options.scale,
    symbolSelection,
  })
  if (symbolSelection) {
    applyNativeSymbolPortGeometry({ center, selection: symbolSelection })
  }
  const pinEdgeElements = rendersOwnPins
    ? []
    : createComponentPinEdgeElements(
        {
          componentPorts,
          pins,
          includeNumericDesignators:
            Boolean(ownedComponentBody) && options.includeText !== false,
        },
        context,
      )
  convertedPorts.push(...componentPorts)
  elements.push(
    ...componentPorts.flatMap(
      ({ isSchematicVisible, sourcePort, schematicPort }) => [
        sourcePort,
        ...(isSchematicVisible ? [schematicPort] : []),
      ],
    ),
    ...pinEdgeElements,
    ...(ownedComponentBody ?? []),
  )
  const schematicComponent: SchematicComponent = {
    type: "schematic_component",
    center,
    is_box_with_pins: !ownedComponentBody,
    schematic_component_id: identity.schematicComponentId,
    schematic_sheet_id: options.schematicSheetId,
    size,
    source_component_id: identity.sourceComponentId,
    symbol_display_value: identity.displayText,
    ...(symbolSelection ? { symbol_name: symbolSelection.name } : {}),
  }
  elements.push(schematicComponent)
  addNativePassiveLabels(
    {
      component: schematicComponent,
      identity,
      records: visibleOwnedRecords,
      selection: symbolSelection,
    },
    context,
  )
  if (symbolSelection || ownedComponentBody || options.includeText === false)
    return
  addComponentFallbackText({
    componentIndex,
    designator: identity.designator,
    displayText: identity.displayText,
    elements,
    schematicComponent,
  })
}
