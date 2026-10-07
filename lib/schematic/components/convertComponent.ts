import { type AltiumSchComponentRecord, AltiumSchPinRecord } from "altiumts"
import type { SchematicComponent } from "circuit-json"
import { getBoundsCenter, scalePoint } from "../geometry"
import {
  applyNativeSymbolPortGeometry,
  selectCircuitJsonSymbol,
} from "../symbols"
import { addComponentFallbackText } from "./addComponentFallbackText"
import { convertComponentPin } from "./convertComponentPin"
import { convertMarkedCapacitorBody } from "./convertMarkedCapacitorBody"
import { convertOwnedComponentBody } from "./convertOwnedComponentBody"
import { convertOwnedSingleInputGateBody } from "./convertOwnedSingleInputGateBody"
import { convertPinlessComponent } from "./convertPinlessComponent"
import { createComponentPinEdgeElements } from "./createComponentPinEdgeElements"
import { createSourceComponent } from "./createSourceComponent"
import { getComponentBodyBounds } from "./getComponentBodyBounds"
import { getComponentIdentity } from "./getComponentIdentity"
import { getComponentSize } from "./getComponentSize"
import { getVisibleSymbolLabels } from "./getVisibleSymbolLabels"
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
  let symbolSelection = selectCircuitJsonSymbol({
    ...identity,
    ports: componentPorts,
  })
  const polarizedCapacitorBody = convertMarkedCapacitorBody(
    { identity, records: visibleOwnedRecords, symbolSelection },
    context,
  )
  if (polarizedCapacitorBody) symbolSelection = undefined
  const singleInputGateBody = symbolSelection
    ? undefined
    : convertOwnedSingleInputGateBody(
        { identity, records: visibleOwnedRecords, componentPorts },
        context,
      )
  const ownedComponentBody =
    polarizedCapacitorBody ??
    singleInputGateBody ??
    (symbolSelection
      ? undefined
      : convertOwnedComponentBody(
          { identity, pins, records: visibleOwnedRecords, visibleSymbolLabels },
          context,
        ))
  const center = scalePoint(getBoundsCenter(bodyBounds), options.scale)
  const size = getComponentSize({
    bodyBounds,
    scale: options.scale,
    symbolSelection,
  })
  if (symbolSelection) {
    applyNativeSymbolPortGeometry({ center, selection: symbolSelection })
  }
  const pinEdgeElements = singleInputGateBody
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
