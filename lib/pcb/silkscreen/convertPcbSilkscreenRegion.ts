import { type AltiumRegionRecord, getPcbRegionGeometry } from "altiumts"
import type { PcbSilkscreenGraphic } from "circuit-json"
import { toMillimeterPoint } from "../geometry"
import { getPcbComponentIdForRecord } from "../identifiers"
import { mapOverlayLayer } from "../layers"

export function convertPcbSilkscreenRegion({
  record,
  recordIndex,
}: {
  record: AltiumRegionRecord
  recordIndex: number
}): PcbSilkscreenGraphic | undefined {
  const geometry = getPcbRegionGeometry(record)
  const outerVertices = geometry.outline.points.map(toMillimeterPoint)
  if (outerVertices.length < 3) return undefined

  const innerRings = geometry.holes
    .map((hole) => ({ vertices: hole.points.map(toMillimeterPoint) }))
    .filter((ring) => ring.vertices.length >= 3)

  return {
    type: "pcb_silkscreen_graphic",
    pcb_silkscreen_graphic_id: `pcb_silkscreen_graphic_altium_region_${recordIndex}`,
    pcb_component_id: getPcbComponentIdForRecord(record),
    shape: "brep",
    brep_shape: {
      outer_ring: { vertices: outerVertices },
      inner_rings: innerRings,
    },
    layer: mapOverlayLayer(record.layer),
  }
}
