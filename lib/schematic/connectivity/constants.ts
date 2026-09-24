import type { AltiumPoint } from "altiumts"

import type { CardinalDirection } from "../geometry"

export const DIRECTION_BY_ORIENTATION: readonly CardinalDirection[] = [
  "right",
  "up",
  "left",
  "down",
]

export const VECTOR_BY_DIRECTION: Readonly<
  Record<CardinalDirection, AltiumPoint>
> = {
  down: { x: 0, y: -1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  up: { x: 0, y: 1 },
}
