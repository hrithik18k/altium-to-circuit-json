import type { AltiumPoint } from "altiumts"
import { pointsEqual, scalePoint } from "../geometry"
import type { ConvertedPort } from "../model"

export function getPortIdAtElectricalPoint({
  port,
  electricalPoint,
  altiumUnitsToMillimetersScale,
}: {
  port: ConvertedPort | undefined
  electricalPoint: AltiumPoint
  altiumUnitsToMillimetersScale: number
}): string | undefined {
  if (!port?.isSchematicVisible) return undefined
  return pointsEqual(
    port.schematicPort.center,
    scalePoint(electricalPoint, altiumUnitsToMillimetersScale),
  )
    ? port.schematicPort.schematic_port_id
    : undefined
}
