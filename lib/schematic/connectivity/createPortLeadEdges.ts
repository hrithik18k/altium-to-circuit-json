import type { AltiumPoint } from "altiumts"
import type { SchematicTrace } from "circuit-json"
import { pointsEqual } from "../geometry"
import type { ConvertedPort } from "../model"

export function createPortLeadEdges(
  convertedPort: ConvertedPort,
  electricalTerminal: AltiumPoint,
): SchematicTrace["edges"] {
  const portCenter = convertedPort.schematicPort.center
  const facingDirection =
    convertedPort.schematicPort.facing_direction ?? "right"
  const elbow =
    facingDirection === "left" || facingDirection === "right"
      ? { x: electricalTerminal.x, y: portCenter.y }
      : { x: portCenter.x, y: electricalTerminal.y }
  const candidatePoints = [portCenter, elbow, electricalTerminal]
  const points = candidatePoints.filter(
    (point, index) =>
      index === 0 || !pointsEqual(point, candidatePoints[index - 1]),
  )

  return points.slice(1).flatMap((to, index) => {
    const from = points[index]
    if (!from) return []
    return [
      {
        from,
        ...(index === 0
          ? {
              from_schematic_port_id:
                convertedPort.schematicPort.schematic_port_id,
            }
          : {}),
        to,
      },
    ]
  })
}
