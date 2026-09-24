import type { AltiumPoint, AltiumRecord } from "altiumts"
import type { AnyCircuitElement } from "circuit-json"
import type { SchematicContext } from "../document"

export interface PrimitiveRenderOptions {
  color: string
  context: SchematicContext
  index: number
  record: AltiumRecord
  strokeWidth: number
}

export interface PowerPortGeometry {
  direction: AltiumPoint
  location: AltiumPoint
  perpendicular: AltiumPoint
}

export interface RenderedPowerPortGraphics {
  elements: AnyCircuitElement[]
  labelDistance: number
}

export interface SymbolRenderOptions {
  includeHidden?: boolean
  includeText?: boolean
}
