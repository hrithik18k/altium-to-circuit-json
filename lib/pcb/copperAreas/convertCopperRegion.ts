import { type AltiumRegionRecord, getPcbRegionGeometry } from "altiumts"
import type { PcbCopperPour } from "circuit-json"
import { mapAltiumCopperLayer } from "../layers"
import { contourToPoints } from "./contourToPoints"

export function convertCopperRegion({
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
