import type { AltiumPadRecord, getAltiumPcbPadGeometry } from "altiumts"

export interface ThroughHolePadConversionOptions {
  cornerRadius: number | undefined
  geometry: ReturnType<typeof getAltiumPcbPadGeometry>
  height: number
  holeDiameter: number
  id: string
  record: AltiumPadRecord
  shape: string
  width: number
  x: number
  y: number
}
