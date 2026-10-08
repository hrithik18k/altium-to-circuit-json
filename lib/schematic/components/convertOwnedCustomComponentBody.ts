import {
  type AltiumRecord,
  AltiumSchArcRecord,
  AltiumSchEllipseRecord,
  AltiumSchEllipticalArcRecord,
  AltiumSchLineRecord,
  AltiumSchPolygonRecord,
  AltiumSchPolylineRecord,
  AltiumSchRectangleRecord,
  AltiumSchRoundedRectangleRecord,
} from "altiumts"
import type { AnyCircuitElement } from "circuit-json"
import { getRoundedRectangleCircle } from "../geometry/getRoundedRectangleCircle"
import { convertOwnedComponentRecords } from "./convertOwnedComponentRecords"
import { prepareOwnedComponentBodyElements } from "./prepareOwnedComponentBodyElements"
import type { ComponentConversionContext, ComponentIdentity } from "./types"

export function convertOwnedCustomComponentBody(
  {
    identity,
    records,
  }: {
    identity: ComponentIdentity
    records: AltiumRecord[]
  },
  context: ComponentConversionContext,
): AnyCircuitElement[] | undefined {
  const bodyPrimitiveKinds = new Set(
    records.flatMap((record) => {
      if (record instanceof AltiumSchEllipseRecord) return ["ellipse"]
      if (
        record instanceof AltiumSchArcRecord ||
        record instanceof AltiumSchEllipticalArcRecord
      ) {
        return ["arc"]
      }
      if (record instanceof AltiumSchLineRecord) return ["line"]
      if (
        record instanceof AltiumSchPolygonRecord ||
        record instanceof AltiumSchPolylineRecord
      ) {
        return ["polygon"]
      }
      return []
    }),
  )
  const bodyPrimitiveCount = records.filter(
    (record) =>
      record instanceof AltiumSchEllipseRecord ||
      record instanceof AltiumSchArcRecord ||
      record instanceof AltiumSchEllipticalArcRecord ||
      record instanceof AltiumSchLineRecord ||
      record instanceof AltiumSchPolygonRecord ||
      record instanceof AltiumSchPolylineRecord,
  ).length
  const hasFilledPolygon = records.some(
    (record) =>
      record instanceof AltiumSchPolygonRecord &&
      record.getBoolean("ISSOLID") === true,
  )
  const hasCircularShape = records.some(
    (record) =>
      record instanceof AltiumSchEllipseRecord ||
      getRoundedRectangleCircle(record) !== undefined,
  )
  const hasOtherBodyShape = records.some(
    (record) =>
      record instanceof AltiumSchRectangleRecord ||
      (record instanceof AltiumSchRoundedRectangleRecord &&
        getRoundedRectangleCircle(record) === undefined) ||
      record instanceof AltiumSchArcRecord ||
      record instanceof AltiumSchEllipticalArcRecord ||
      record instanceof AltiumSchLineRecord ||
      record instanceof AltiumSchPolygonRecord ||
      record instanceof AltiumSchPolylineRecord,
  )
  // A closed ellipse can be the complete body of a one-pin connector or
  // mounting hole. Do not mistake a circle decorating a rectangular IC for
  // its body. Keep the existing evidence threshold for other custom graphics.
  const hasSimpleCircularBody = hasCircularShape && !hasOtherBodyShape
  // A lone line or shape can be a decoration on an otherwise rectangular IC.
  // Multiple primitive kinds or a filled polygon with supporting strokes are
  // evidence of a complete body rather than a lone decoration.
  if (
    !hasSimpleCircularBody &&
    (bodyPrimitiveCount < 3 ||
      (bodyPrimitiveKinds.size < 2 && !hasFilledPolygon))
  ) {
    return undefined
  }

  const ownedElements = convertOwnedComponentRecords(
    {
      ownedRecords: records,
      schematicComponentId: identity.schematicComponentId,
    },
    context,
  )
  return prepareOwnedComponentBodyElements(ownedElements)
}
