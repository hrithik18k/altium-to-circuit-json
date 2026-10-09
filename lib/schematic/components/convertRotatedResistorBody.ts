import {
  type AltiumPoint,
  type AltiumRecord,
  AltiumSchDesignatorRecord,
  AltiumSchLineRecord,
  AltiumSchParameterRecord,
  type AltiumSchPinRecord,
  AltiumSchPolylineRecord,
  getSchematicRecordPoints,
} from "altiumts"
import type { AnyCircuitElement } from "circuit-json"
import { getCorner, getLocation, pointsEqual } from "../geometry"
import type { SymbolSelection } from "../model"
import { convertOwnedComponentRecords } from "./convertOwnedComponentRecords"
import { prepareOwnedComponentBodyElements } from "./prepareOwnedComponentBodyElements"
import type { ComponentConversionContext, ComponentIdentity } from "./types"

export function convertRotatedResistorBody(
  {
    identity,
    pins,
    records,
    symbolSelection,
  }: {
    identity: ComponentIdentity
    pins: AltiumSchPinRecord[]
    records: AltiumRecord[]
    symbolSelection: SymbolSelection | undefined
  },
  context: ComponentConversionContext,
): AnyCircuitElement[] | undefined {
  if (
    !symbolSelection?.name.startsWith("boxresistor_") ||
    pins.length !== 2 ||
    !records.some((record) => {
      const isComponentLabel =
        record instanceof AltiumSchDesignatorRecord ||
        (record instanceof AltiumSchParameterRecord &&
          ["comment", "value"].includes(record.name?.toLowerCase() ?? ""))
      return (
        isComponentLabel &&
        (!record.getBoolean("ISHIDDEN") ||
          context.options.includeHidden === true) &&
        Boolean(record.getDecoded("TEXT")?.trim()) &&
        (record.getNumber("ORIENTATION") ?? 0) % 2 !== 0
      )
    })
  ) {
    return undefined
  }

  // Native symbols place their labels horizontally. Keep the source body when
  // its labels are rotated, but require a complete path between the two pins
  // so decorations or incomplete graphics cannot replace a working symbol.
  const edges = records.flatMap((record) => {
    const points =
      record instanceof AltiumSchLineRecord
        ? [getLocation(record), getCorner(record)]
        : record instanceof AltiumSchPolylineRecord
          ? getSchematicRecordPoints(record)
          : []
    return points.slice(1).flatMap((end, index) => {
      const start = points[index]
      return start && end && !pointsEqual(start, end) ? [{ start, end }] : []
    })
  })
  const startPoint = getLocation(pins[0]!)
  const target = getLocation(pins[1]!)
  if (!startPoint || !target || edges.length < 3) return undefined
  let point: AltiumPoint = startPoint
  while (edges.length > 0) {
    const currentPoint: AltiumPoint = point
    const connected = edges.filter(
      (edge) =>
        pointsEqual(edge.start, currentPoint) ||
        pointsEqual(edge.end, currentPoint),
    )
    if (connected.length !== 1) return undefined
    const edge = connected[0]!
    edges.splice(edges.indexOf(edge), 1)
    point = pointsEqual(edge.start, point) ? edge.end : edge.start
  }
  if (!pointsEqual(point, target)) return undefined

  return prepareOwnedComponentBodyElements(
    convertOwnedComponentRecords(
      {
        ownedRecords: records,
        schematicComponentId: identity.schematicComponentId,
      },
      context,
    ),
  )
}
