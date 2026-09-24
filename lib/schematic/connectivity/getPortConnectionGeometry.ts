import type { AltiumPoint, AltiumRecord } from "altiumts"
import { type CardinalDirection, getLocation } from "../geometry"
import type { SchematicSegment } from "../model"
import { VECTOR_BY_DIRECTION } from "./constants"
import { doesPointTouchWireEndpoint } from "./doesPointTouchWireEndpoint"
import { getOppositeDirection } from "./getOppositeDirection"
import { getRecordDirection } from "./getRecordDirection"

export function getPortConnectionGeometry(
  record: AltiumRecord,
  wireSegments: SchematicSegment[],
): { anchor: AltiumPoint; bodyDirection: CardinalDirection } | undefined {
  const origin = getLocation(record)
  if (!origin) return undefined

  const originToExtremity = getRecordDirection(record)
  const directionVector = VECTOR_BY_DIRECTION[originToExtremity]
  const width = Math.max(record.getNumber("WIDTH") ?? 16, 0)
  const extremity = {
    x: origin.x + directionVector.x * width,
    y: origin.y + directionVector.y * width,
  }
  const originConnected = doesPointTouchWireEndpoint(origin, wireSegments)
  const extremityConnected = doesPointTouchWireEndpoint(extremity, wireSegments)
  const connectedEnd = record.getNumber("CONNECTEDEND")
  const connectsAtExtremity =
    connectedEnd === 2 ||
    (connectedEnd !== 1 &&
      connectedEnd !== 3 &&
      !originConnected &&
      extremityConnected)

  return connectsAtExtremity
    ? {
        anchor: extremity,
        bodyDirection: getOppositeDirection(originToExtremity),
      }
    : { anchor: origin, bodyDirection: originToExtremity }
}
