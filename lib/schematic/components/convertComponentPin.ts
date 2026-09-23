import type { AltiumSchDoc, AltiumSchPinRecord } from "altiumts"
import type { SchematicPort, SourcePort } from "circuit-json"
import {
  DIRECTION_BY_ORIENTATION,
  directionToSide,
  VECTOR_BY_DIRECTION,
} from "../connectivity"
import { getLocation, scaleLength, scalePoint } from "../geometry"
import { uniqueStrings } from "../identifiers"
import type { ConvertedPort, SemanticSchematicOptions } from "../model"
import { parsePinNumber } from "./parsePinNumber"

export function convertComponentPin({
  document,
  options,
  pin,
  pinIndex,
  schematicComponentId,
  sourceComponentId,
  visibleSymbolLabels,
}: {
  document: AltiumSchDoc
  options: SemanticSchematicOptions
  pin: AltiumSchPinRecord
  pinIndex: number
  schematicComponentId: string
  sourceComponentId: string
  visibleSymbolLabels: Set<string>
}): ConvertedPort {
  const recordIndex = document.records.indexOf(pin)
  const pinConglomerate = pin.pinConglomerate
  const orientation = (pinConglomerate ?? pin.orientationQuarterTurns ?? 0) & 3
  const direction = DIRECTION_BY_ORIENTATION[orientation] ?? "right"
  const directionVector = VECTOR_BY_DIRECTION[direction]
  const location = getLocation(pin) ?? { x: 0, y: 0 }
  const pinLength = Math.max(pin.pinLengthSchematicUnits ?? 10, 0)
  const terminalPoint = {
    x: location.x + directionVector.x * pinLength,
    y: location.y + directionVector.y * pinLength,
  }
  const designator = pin.designator ?? `${pinIndex + 1}`
  const pinNumber = parsePinNumber(designator)
  const name = pin.name ?? designator
  const sourcePortId = `source_port_altium_${recordIndex}`
  const schematicPortId = `schematic_port_altium_${recordIndex}`
  const sourcePort: SourcePort = {
    type: "source_port",
    name,
    port_hints: uniqueStrings([
      designator,
      name,
      pinNumber === undefined ? undefined : `pin${pinNumber}`,
    ]),
    source_component_id: sourceComponentId,
    source_port_id: sourcePortId,
    ...(pinNumber === undefined ? {} : { pin_number: pinNumber }),
  }
  const electricalType = pin.electricalType
  const normalizedName = name.trim().toUpperCase()
  const functionalName = normalizedName.replace(/\d+$/u, "")
  const showName =
    pinConglomerate === undefined ||
    (pinConglomerate & 0x08) !== 0 ||
    visibleSymbolLabels.has(normalizedName) ||
    visibleSymbolLabels.has(functionalName)
  const schematicPort: SchematicPort = {
    type: "schematic_port",
    center: scalePoint(terminalPoint, options.scale),
    ...(showName && name ? { display_pin_label: name } : {}),
    distance_from_component_edge: scaleLength(pinLength, options.scale),
    facing_direction: direction,
    is_connected: false,
    schematic_component_id: schematicComponentId,
    schematic_port_id: schematicPortId,
    schematic_sheet_id: options.schematicSheetId,
    side_of_component: directionToSide(direction),
    source_port_id: sourcePortId,
    true_ccw_index: pinIndex,
    ...(pinNumber === undefined ? {} : { pin_number: pinNumber }),
    ...(electricalType === 0 || electricalType === 1
      ? { has_input_arrow: true }
      : {}),
    ...(electricalType === 1 || electricalType === 2
      ? { has_output_arrow: true }
      : {}),
  }
  return {
    isSchematicVisible: true,
    point: terminalPoint,
    record: pin,
    schematicPort,
    sourcePort,
  }
}
