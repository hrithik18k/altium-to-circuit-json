import {
  type AltiumPoint,
  type AltiumSchDoc,
  getSchematicRecordPoints,
} from "altiumts"
import { pointKey, type SchematicPointKey } from "../geometry"
import type {
  ConvertedPort,
  SchematicSegment,
  SemanticNet,
  SemanticNetGraph,
} from "../model"
import { addGraphPoint } from "./addGraphPoint"
import { createConnectedWiresByRecord } from "./createConnectedWiresByRecord"
import { getElectricalRecordName } from "./getElectricalRecordName"
import { getOrCreateSemanticNetGroup } from "./getOrCreateSemanticNetGroup"
import { getPositionedElectricalRecords } from "./getPositionedElectricalRecords"
import { isPointOnSegment } from "./isPointOnSegment"
import { mergeSemanticNetGroups } from "./mergeSemanticNetGroups"
import { PointDisjointSet } from "./PointDisjointSet"
import type { MutableSemanticNet } from "./types"

/**
 * Altium permits labels and pin hot spots to land anywhere on a wire segment,
 * not only on declared polyline vertices. Build the electrical graph with
 * those geometric joins so Circuit JSON source traces carry the real ports and
 * net names. Mid-segment crossings remain disconnected unless one wire has a
 * vertex there or Altium emits an explicit junction record.
 */
export function buildSemanticNetGraph(
  document: AltiumSchDoc,
  convertedPorts: ConvertedPort[],
): SemanticNetGraph {
  const disjointSet = new PointDisjointSet()
  const pointsByKey = new Map<SchematicPointKey, AltiumPoint>()
  const wireRecords = document.wires
  const segments: SchematicSegment[] = []

  for (const wire of wireRecords) {
    const points = getSchematicRecordPoints(wire)
    for (const point of points) {
      addGraphPoint({ disjointSet, pointsByKey, point })
    }
    for (let index = 1; index < points.length; index++) {
      const start = points[index - 1]
      const end = points[index]
      if (!start || !end) continue
      disjointSet.union(pointKey(start), pointKey(end))
      segments.push({ end, start })
    }
  }

  const positionedRecords = getPositionedElectricalRecords(document, segments)
  const positionedPins = convertedPorts.map(({ point, record }) => ({
    point,
    record,
  }))
  const joinPoints = [
    ...new Map(
      wireRecords
        .flatMap((wire) => getSchematicRecordPoints(wire))
        .map((point) => [pointKey(point), point]),
    ).values(),
    ...positionedRecords.map(({ point }) => point),
    ...positionedPins.map(({ point }) => point),
  ]

  for (const point of joinPoints) {
    addGraphPoint({ disjointSet, pointsByKey, point })
    for (const segment of segments) {
      if (isPointOnSegment({ point, start: segment.start, end: segment.end })) {
        disjointSet.union(pointKey(point), pointKey(segment.start))
      }
    }
  }

  const groupedByRoot = new Map<SchematicPointKey, MutableSemanticNet>()

  for (const point of pointsByKey.values()) {
    getOrCreateSemanticNetGroup({
      disjointSet,
      groupedByRoot,
      point,
    }).points.set(pointKey(point), point)
  }
  for (const wire of wireRecords) {
    const firstPoint = getSchematicRecordPoints(wire)[0]
    if (firstPoint) {
      getOrCreateSemanticNetGroup({
        disjointSet,
        groupedByRoot,
        point: firstPoint,
      }).records.add(wire)
    }
  }
  for (const { point, record } of [...positionedRecords, ...positionedPins]) {
    const group = getOrCreateSemanticNetGroup({
      disjointSet,
      groupedByRoot,
      point,
    })
    group.records.add(record)
    const name = getElectricalRecordName(record)
    if (name) group.names.add(name)
  }

  const connectedWiresByRecord = createConnectedWiresByRecord(groupedByRoot)
  const mergedGroups = mergeSemanticNetGroups(groupedByRoot)
  const nets: SemanticNet[] = mergedGroups.map((group) => ({
    id: group.id,
    names: [...group.names],
    points: [...group.points.values()],
    records: [...group.records],
  }))
  return {
    getConnectedWiresForRecord: (record) =>
      connectedWiresByRecord.get(record) ?? [],
    nets,
  }
}
