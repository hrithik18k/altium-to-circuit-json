import {
  AltiumArcRecord,
  type AltiumPcbDocument,
  AltiumTrackRecord,
} from "altiumts"
import type { PcbCourtyardOutline } from "circuit-json"
import { removeClosingPoint, toMillimeterPoint } from "../geometry"
import { getPcbComponentId } from "../identifiers"
import { getRecordLayer, isCourtyardLayer, mapCourtyardLayer } from "../layers"
import { getCourtyardRecordPoints } from "./getCourtyardRecordPoints"
import { isClosedAltiumPath } from "./isClosedAltiumPath"
import { stitchCourtyardPaths } from "./stitchCourtyardPaths"
import type { CourtyardPath } from "./types"

export function convertPcbCourtyards(
  document: AltiumPcbDocument,
): PcbCourtyardOutline[] {
  const componentIds = new Map(
    document.components.flatMap((component, index) =>
      component.position
        ? [[component, getPcbComponentId(index)] as const]
        : [],
    ),
  )
  const paths: CourtyardPath[] = []

  for (const record of document.records) {
    const layer = getRecordLayer(record)
    if (!isCourtyardLayer(layer)) continue
    const component = document.getComponentForRecord(record)
    const componentId = component ? componentIds.get(component) : undefined
    if (!componentId) continue
    const points = getCourtyardRecordPoints(record)
    if (points.length < 2) continue
    paths.push({
      componentId,
      layer: mapCourtyardLayer(layer),
      points,
      strokeWidthMils:
        record instanceof AltiumTrackRecord || record instanceof AltiumArcRecord
          ? (record.widthMils ?? 4)
          : 0,
    })
  }

  const courtyards: PcbCourtyardOutline[] = []
  for (const path of stitchCourtyardPaths(paths)) {
    if (!isClosedAltiumPath(path.points)) continue
    const outline = removeClosingPoint({
      points: path.points,
      maxEndpointGapMils: 0.01,
    }).map(toMillimeterPoint)
    if (outline.length < 3) continue
    courtyards.push({
      type: "pcb_courtyard_outline",
      pcb_courtyard_outline_id: `pcb_courtyard_outline_altium_${courtyards.length}`,
      pcb_component_id: path.componentId,
      layer: path.layer,
      outline,
    })
  }
  return courtyards
}
