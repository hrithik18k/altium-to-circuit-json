import {
  AltiumArcRecord,
  type AltiumPcbDocument,
  type AltiumPoint,
  AltiumRegionRecord,
  AltiumTrackRecord,
  getAltiumBounds,
  getPcbRegionGeometry,
} from "altiumts"
import { removeClosingPoint, stitchConnectedAltiumPaths } from "../geometry"
import { isKeepoutLayer } from "../layers"
import { boundsContainWithTolerance } from "./boundsContainWithTolerance"
import { MAX_ENDPOINT_GAP_MILS, MAX_PLACEMENT_OVERHANG_MILS } from "./constants"
import { getArcPoints } from "./getArcPoints"
import { getBoundsArea } from "./getBoundsArea"
import { getPlacedContentBounds } from "./getPlacedContentBounds"
import { isClosedPath } from "./isClosedPath"

export function getTightestEnclosingKeepoutOutline(
  document: AltiumPcbDocument,
): AltiumPoint[] | undefined {
  const closedOutlines: AltiumPoint[][] = []
  const openPaths: AltiumPoint[][] = []

  for (const record of document.records) {
    if (!isKeepoutLayer(record.getDecoded("LAYER"))) continue
    if (document.getComponentForRecord(record)) continue

    if (record instanceof AltiumRegionRecord) {
      const outline = getPcbRegionGeometry(record).outline.points
      if (outline.length >= 3) {
        closedOutlines.push(
          removeClosingPoint({
            points: outline,
            maxEndpointGapMils: MAX_ENDPOINT_GAP_MILS,
          }),
        )
      }
      continue
    }

    if (record instanceof AltiumTrackRecord && record.start && record.end) {
      openPaths.push([record.start, record.end])
      continue
    }

    if (record instanceof AltiumArcRecord) {
      const points = getArcPoints(record)
      if (points.length >= 2) openPaths.push(points)
    }
  }

  for (const path of stitchConnectedAltiumPaths({
    paths: openPaths,
    maxEndpointGapMils: MAX_ENDPOINT_GAP_MILS,
  })) {
    if (!isClosedPath(path)) continue
    closedOutlines.push(
      removeClosingPoint({
        points: path,
        maxEndpointGapMils: MAX_ENDPOINT_GAP_MILS,
      }),
    )
  }

  const placedBounds = getPlacedContentBounds(document)
  const candidates = closedOutlines.flatMap((outline) => {
    const bounds = getAltiumBounds(outline)
    if (!bounds || outline.length < 3) return []
    if (
      placedBounds &&
      !boundsContainWithTolerance({
        container: bounds,
        contained: placedBounds,
        tolerance: MAX_PLACEMENT_OVERHANG_MILS,
      })
    ) {
      return []
    }
    return [{ bounds, outline }]
  })

  candidates.sort((left, right) => {
    const areaDifference =
      getBoundsArea(left.bounds) - getBoundsArea(right.bounds)
    return placedBounds ? areaDifference : -areaDifference
  })
  return candidates[0]?.outline
}
