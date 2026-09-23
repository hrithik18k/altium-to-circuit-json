import type { SchematicNetLabel } from "circuit-json"
import type { CardinalDirection } from "../geometry"

export function directionToOppositeSide(
  direction: CardinalDirection,
): SchematicNetLabel["anchor_side"] {
  if (direction === "up") return "bottom"
  if (direction === "down") return "top"
  return direction === "left" ? "right" : "left"
}
