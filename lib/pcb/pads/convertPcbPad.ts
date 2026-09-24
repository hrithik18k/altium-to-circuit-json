import { type AltiumPadRecord, getAltiumPcbPadGeometry } from "altiumts"
import type { PcbHole, PcbPlatedHole, PcbSmtPad } from "circuit-json"
import { createOctagonPoints, milsToMillimeters } from "../geometry"
import { mapAltiumCopperLayer } from "../layers"
import { convertThroughHolePad } from "./convertThroughHolePad"
import { normalizeShape } from "./normalizeShape"

export function convertPcbPad({
  record,
  recordIndex,
}: {
  record: AltiumPadRecord
  recordIndex: number
}): PcbSmtPad | PcbPlatedHole | PcbHole | undefined {
  const position = record.position
  if (!position) return undefined
  const geometry = getAltiumPcbPadGeometry({
    record,
    useRequestedLayerGeometry: true,
  })
  const x = milsToMillimeters(position.x)
  const y = milsToMillimeters(position.y)
  const width = milsToMillimeters(geometry.widthMils)
  const height = milsToMillimeters(geometry.heightMils)
  const cornerRadius =
    geometry.cornerRadiusMils === 0
      ? undefined
      : milsToMillimeters(geometry.cornerRadiusMils)
  const holeDiameter = milsToMillimeters(geometry.holeSizeMils)
  const shape = normalizeShape(geometry.shape)
  const id = `altium_${recordIndex}`

  if (!geometry.plated && holeDiameter > 0) {
    return {
      type: "pcb_hole",
      pcb_hole_id: `pcb_hole_${id}`,
      hole_shape: "circle",
      hole_diameter: holeDiameter,
      x,
      y,
    }
  }

  if (record.behavior === "through-hole" || holeDiameter > 0) {
    return convertThroughHolePad({
      cornerRadius,
      geometry,
      height,
      holeDiameter,
      id,
      record,
      shape,
      width,
      x,
      y,
    })
  }

  const layer = mapAltiumCopperLayer(record.layer)
  if (!layer) return undefined
  const base = {
    type: "pcb_smtpad" as const,
    pcb_smtpad_id: `pcb_smtpad_${id}`,
    x,
    y,
    layer,
    soldermask_margin:
      record.solderMaskExpansionMils === undefined
        ? undefined
        : milsToMillimeters(record.solderMaskExpansionMils),
  }

  if (shape.includes("OCTAGON")) {
    return {
      ...base,
      shape: "polygon",
      points: createOctagonPoints({
        x,
        y,
        width,
        height,
        ccwRotationDegrees: geometry.ccwRotationDegrees,
      }),
    }
  }
  if (shape === "ROUND" || shape === "CIRCLE" || shape === "OVAL") {
    if (Math.abs(width - height) < 0.0001) {
      return { ...base, shape: "circle", radius: width / 2 }
    }
    return geometry.ccwRotationDegrees === 0
      ? {
          ...base,
          shape: "pill",
          width,
          height,
          radius: Math.min(width, height) / 2,
        }
      : {
          ...base,
          shape: "rotated_pill",
          width,
          height,
          radius: Math.min(width, height) / 2,
          ccw_rotation: geometry.ccwRotationDegrees,
        }
  }

  return geometry.ccwRotationDegrees === 0
    ? { ...base, shape: "rect", width, height, corner_radius: cornerRadius }
    : {
        ...base,
        shape: "rotated_rect",
        width,
        height,
        corner_radius: cornerRadius,
        ccw_rotation: geometry.ccwRotationDegrees,
      }
}
