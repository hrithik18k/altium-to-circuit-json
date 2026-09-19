import {
  AltiumFillRecord,
  type AltiumPcbContour,
  type AltiumPcbDocument,
  AltiumPolygonRecord,
  type AltiumRecord,
  AltiumRegionRecord,
  getPcbContour,
  getPcbRecordPolygonIndex,
  getPcbRegionGeometry,
} from "altiumts"
import type { PcbCopperPour, Point } from "circuit-json"
import { mapAltiumCopperLayer } from "./map-altium-copper-layer"

const MILS_TO_MILLIMETERS = 0.0254

export function convertAltiumCopperAreas(
  document: AltiumPcbDocument,
  {
    getSourceNetId = () => undefined,
  }: {
    getSourceNetId?: (record: AltiumRecord) => string | undefined
  } = {},
): PcbCopperPour[] {
  const polygonIndexesWithRegions = new Set(
    document.records.flatMap((record) => {
      if (
        !(record instanceof AltiumRegionRecord) ||
        record.recordKind !== "Region"
      ) {
        return []
      }
      const polygonIndex = getPcbRecordPolygonIndex(document, record)
      return polygonIndex === undefined ? [] : [polygonIndex]
    }),
  )
  const polygonIndexes = new Map(
    document.polygons.map((polygon, index) => [polygon, index]),
  )

  return document.records.flatMap((record, recordIndex) => {
    if (record instanceof AltiumRegionRecord) {
      return convertCopperRegion({
        record,
        recordIndex,
        sourceNetId: getSourceNetId(record),
      })
    }
    if (record instanceof AltiumPolygonRecord) {
      const polygonIndex = polygonIndexes.get(record)
      if (
        record.shelved === true ||
        polygonIndex === undefined ||
        polygonIndexesWithRegions.has(polygonIndex)
      ) {
        return []
      }
      return convertCopperPolygon({
        polygonIndex,
        record,
        sourceNetId: getSourceNetId(record),
      })
    }
    if (record instanceof AltiumFillRecord) {
      return convertCopperFill({
        record,
        recordIndex,
        sourceNetId: getSourceNetId(record),
      })
    }
    return []
  })
}

function convertCopperRegion({
  record,
  recordIndex,
  sourceNetId,
}: {
  record: AltiumRegionRecord
  recordIndex: number
  sourceNetId: string | undefined
}): PcbCopperPour[] {
  if (record.recordKind !== "Region" || record.regionKind !== "COPPER") {
    return []
  }
  const layer = mapAltiumCopperLayer(record.layer)
  if (!layer) return []

  const geometry = getPcbRegionGeometry(record)
  const outerVertices = contourToPoints(geometry.outline)
  if (outerVertices.length < 3) return []

  const innerRings = geometry.holes
    .map((hole) => ({ vertices: contourToPoints(hole) }))
    .filter((ring) => ring.vertices.length >= 3)
  if (innerRings.length === 0) {
    return [
      {
        type: "pcb_copper_pour",
        pcb_copper_pour_id: `pcb_copper_pour_altium_region_${recordIndex}`,
        ...(sourceNetId ? { source_net_id: sourceNetId } : {}),
        covered_with_solder_mask: true,
        layer,
        shape: "polygon",
        points: outerVertices,
      },
    ]
  }

  return [
    {
      type: "pcb_copper_pour",
      pcb_copper_pour_id: `pcb_copper_pour_altium_region_${recordIndex}`,
      ...(sourceNetId ? { source_net_id: sourceNetId } : {}),
      covered_with_solder_mask: true,
      layer,
      shape: "brep",
      brep_shape: {
        outer_ring: { vertices: outerVertices },
        inner_rings: innerRings,
      },
    },
  ]
}

function convertCopperPolygon({
  polygonIndex,
  record,
  sourceNetId,
}: {
  polygonIndex: number
  record: AltiumPolygonRecord
  sourceNetId: string | undefined
}): PcbCopperPour[] {
  const layer = mapAltiumCopperLayer(record.layer)
  if (!layer) return []
  const points = contourToPoints(getPcbContour(record))
  if (points.length < 3) return []

  return [
    {
      type: "pcb_copper_pour",
      pcb_copper_pour_id: `pcb_copper_pour_altium_polygon_${polygonIndex}`,
      ...(sourceNetId ? { source_net_id: sourceNetId } : {}),
      covered_with_solder_mask: true,
      layer,
      shape: "polygon",
      points,
    },
  ]
}

function convertCopperFill({
  record,
  recordIndex,
  sourceNetId,
}: {
  record: AltiumFillRecord
  recordIndex: number
  sourceNetId: string | undefined
}): PcbCopperPour[] {
  const layer = mapAltiumCopperLayer(record.layer)
  if (!layer || !record.bounds) return []

  const width = milsToMillimeters(record.bounds.maxX - record.bounds.minX)
  const height = milsToMillimeters(record.bounds.maxY - record.bounds.minY)
  if (width <= 0 || height <= 0) return []

  return [
    {
      type: "pcb_copper_pour",
      pcb_copper_pour_id: `pcb_copper_pour_altium_fill_${recordIndex}`,
      ...(sourceNetId ? { source_net_id: sourceNetId } : {}),
      covered_with_solder_mask: true,
      layer,
      shape: "rect",
      center: {
        x: milsToMillimeters((record.bounds.minX + record.bounds.maxX) / 2),
        y: milsToMillimeters((record.bounds.minY + record.bounds.maxY) / 2),
      },
      width,
      height,
      rotation: record.rotation,
    },
  ]
}

function contourToPoints(contour: AltiumPcbContour): Point[] {
  const points = contour.points.map((point) => ({
    x: milsToMillimeters(point.x),
    y: milsToMillimeters(point.y),
  }))
  return contour.isExplicitlyClosed ? points.slice(0, -1) : points
}

function milsToMillimeters(value: number): number {
  return value * MILS_TO_MILLIMETERS
}
