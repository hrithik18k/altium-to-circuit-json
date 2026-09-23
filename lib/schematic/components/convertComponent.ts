import {
  type AltiumSchComponentRecord,
  AltiumSchLabelRecord,
  AltiumSchPinRecord,
} from "altiumts"
import type { SchematicComponent } from "circuit-json"
import { getBoundsCenter, scaleLength, scalePoint } from "../geometry"
import {
  applyNativeSymbolPortGeometry,
  selectCircuitJsonSymbol,
} from "../symbols"
import { addComponentFallbackText } from "./addComponentFallbackText"
import { convertComponentPin } from "./convertComponentPin"
import { createSourceComponent } from "./createSourceComponent"
import { getComponentBodyBounds } from "./getComponentBodyBounds"
import { getComponentIdentity } from "./getComponentIdentity"
import { isOwnedRecordVisible } from "./isOwnedRecordVisible"
import { isPinHidden } from "./isPinHidden"
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
  if (pins.length === 0) return
  const visibleSymbolLabels = new Set(
    visibleOwnedRecords
      .filter(
        (record): record is AltiumSchLabelRecord =>
          record instanceof AltiumSchLabelRecord,
      )
      .flatMap((record) => {
        const text = record.text?.trim().toUpperCase()
        return text ? [text] : []
      }),
  )
  const identity = getComponentIdentity(
    { componentIndex, componentRecord, ownedRecords },
    context,
  )
  if (identity.shouldCreateSourceComponent) {
    elements.push(
      createSourceComponent({
        displayText: identity.displayText,
        designator: identity.designator,
        libraryReference: identity.libraryReference,
        manufacturerPartNumber: identity.manufacturerPartNumber,
        pinCount: pins.length,
        sourceComponentId: identity.sourceComponentId,
      }),
    )
  }

  const componentPorts = pins.map((pin, pinIndex) =>
    convertComponentPin({
      document,
      options,
      pin,
      pinIndex,
      schematicComponentId: identity.schematicComponentId,
      sourceComponentId: identity.sourceComponentId,
      visibleSymbolLabels,
    }),
  )
  const bodyBounds = getComponentBodyBounds(
    visibleOwnedRecords,
    componentPorts.map(({ point }) => point),
  )
  const symbolSelection = selectCircuitJsonSymbol({
    designator: identity.designator,
    libraryReference: identity.libraryReference,
    ports: componentPorts,
  })
  const center = scalePoint(getBoundsCenter(bodyBounds), options.scale)
  const size = symbolSelection
    ? { ...symbolSelection.symbol.size }
    : {
        height: Math.max(
          scaleLength(bodyBounds.maxY - bodyBounds.minY, options.scale),
          0.4,
        ),
        width: Math.max(
          scaleLength(bodyBounds.maxX - bodyBounds.minX, options.scale),
          0.4,
        ),
      }
  if (symbolSelection) {
    applyNativeSymbolPortGeometry({ center, selection: symbolSelection })
  }
  convertedPorts.push(...componentPorts)
  elements.push(
    ...componentPorts.flatMap(
      ({ isSchematicVisible, sourcePort, schematicPort }) => [
        sourcePort,
        ...(isSchematicVisible ? [schematicPort] : []),
      ],
    ),
  )
  const schematicComponent: SchematicComponent = {
    type: "schematic_component",
    center,
    is_box_with_pins: true,
    schematic_component_id: identity.schematicComponentId,
    schematic_sheet_id: options.schematicSheetId,
    size,
    source_component_id: identity.sourceComponentId,
    symbol_display_value: identity.displayText,
    ...(symbolSelection ? { symbol_name: symbolSelection.name } : {}),
  }
  elements.push(schematicComponent)
  if (!symbolSelection && options.includeText !== false) {
    addComponentFallbackText({
      componentIndex,
      designator: identity.designator,
      displayText: identity.displayText,
      elements,
      schematicComponent,
    })
  }
}
