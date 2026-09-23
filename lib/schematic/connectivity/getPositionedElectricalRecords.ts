import {
  type AltiumSchDoc,
  AltiumSchJunctionRecord,
  AltiumSchLabelRecord,
  AltiumSchNetLabelRecord,
  AltiumSchPortRecord,
  AltiumSchPowerPortRecord,
} from "altiumts"
import { getLocation } from "../geometry"
import type { SchematicSegment } from "../model"
import { getPortConnectionGeometry } from "./getPortConnectionGeometry"
import type { PositionedElectricalRecord } from "./types"

export function getPositionedElectricalRecords(
  document: AltiumSchDoc,
  segments: SchematicSegment[],
): PositionedElectricalRecord[] {
  return document.records.flatMap((record) => {
    if (
      !(record instanceof AltiumSchLabelRecord) &&
      !(record instanceof AltiumSchNetLabelRecord) &&
      !(record instanceof AltiumSchPortRecord) &&
      !(record instanceof AltiumSchPowerPortRecord) &&
      !(record instanceof AltiumSchJunctionRecord)
    ) {
      return []
    }
    const point =
      record instanceof AltiumSchPortRecord
        ? getPortConnectionGeometry(record, segments)?.anchor
        : getLocation(record)
    return point ? [{ point, record }] : []
  })
}
