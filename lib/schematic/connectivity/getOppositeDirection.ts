import type { CardinalDirection } from "../geometry"

export function getOppositeDirection(
  direction: CardinalDirection,
): CardinalDirection {
  if (direction === "up") return "down"
  if (direction === "down") return "up"
  return direction === "left" ? "right" : "left"
}
