export interface Bounds {
  maxX: number
  maxY: number
  minX: number
  minY: number
}

export type CardinalDirection = "up" | "down" | "left" | "right"

export type SchematicPointKey = string & {
  readonly __schematicPointKey: unique symbol
}
