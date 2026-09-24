import type { SchematicPort } from "circuit-json"
import type { CardinalDirection } from "../geometry"

export function directionToSide(
  direction: CardinalDirection,
): NonNullable<SchematicPort["side_of_component"]> {
  if (direction === "up") return "top"
  if (direction === "down") return "bottom"
  return direction
}
