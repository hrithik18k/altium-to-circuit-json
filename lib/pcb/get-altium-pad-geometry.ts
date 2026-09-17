import { type AltiumPadRecord, parseAltiumMeasurementToMils } from "altiumts"

export interface AltiumPadGeometry {
  cornerRadiusMils: number | undefined
  heightMils: number
  shape: string
  widthMils: number
}

export function getAltiumPadGeometry(
  record: AltiumPadRecord,
): AltiumPadGeometry | undefined {
  const normalizedLayer = record.layer?.replaceAll(" ", "").toUpperCase()
  const isBottomLayer =
    normalizedLayer === "BOTTOM" || normalizedLayer === "BOTTOMLAYER"
  const layerOrdinal = isBottomLayer ? 31 : 0
  const size = isBottomLayer ? (record.bottomSize ?? record.size) : record.size
  if (!size) return undefined

  const defaultShape = isBottomLayer
    ? (record.bottomShape ?? record.shape)
    : record.shape
  const alternateShape = record
    .getCaseInsensitive(`LAYER${layerOrdinal}ALTSHAPE`)
    ?.toUpperCase()
  const shape = alternateShape === "ROUNDRECT" ? alternateShape : defaultShape
  const cornerRadiusPercent = Number(
    record.getCaseInsensitive(`LAYER${layerOrdinal}CORNERRADIUS`),
  )
  const cornerRadiusMils =
    shape === "ROUNDRECT" && Number.isFinite(cornerRadiusPercent)
      ? (Math.min(size.width, size.height) * cornerRadiusPercent) / 200
      : undefined

  return {
    cornerRadiusMils,
    heightMils: size.height,
    shape: shape ?? "ROUND",
    widthMils: size.width,
  }
}

export function getAltiumSlotHoleSize(record: AltiumPadRecord): {
  heightMils: number
  widthMils: number
} {
  const holeSizeMils = Math.max(record.holeSizeMils ?? 1, 1)
  const slotWidthMils =
    parseAltiumMeasurementToMils(record.getCaseInsensitive("SLOTLENGTH")) ??
    record.holeWidthMils ??
    holeSizeMils
  return {
    heightMils: holeSizeMils,
    widthMils: Math.max(slotWidthMils, 1),
  }
}
