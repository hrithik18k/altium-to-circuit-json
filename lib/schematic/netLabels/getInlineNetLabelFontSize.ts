import type { AltiumRecord, AltiumSchDoc } from "altiumts"
import { scaleLength, unscaleLength } from "../geometry"
import {
  DEFAULT_INLINE_NET_LABEL_FONT_SIZE,
  MIN_INLINE_NET_LABEL_FONT_SIZE,
} from "./constants"

export function getInlineNetLabelFontSize({
  record,
  document,
  altiumUnitsToMillimetersScale,
}: {
  record: AltiumRecord
  document: AltiumSchDoc
  altiumUnitsToMillimetersScale: number
}): number {
  const fontId = Math.max(
    Math.round(Number(record.getCaseInsensitive("FONTID") ?? 1)),
    1,
  )
  const sheetRecord = document.records.find(
    (candidate) => candidate.recordKind === "31",
  )
  const sourceFontSize = Number(
    sheetRecord?.getCaseInsensitive(`SIZE${fontId}`) ??
      unscaleLength(
        DEFAULT_INLINE_NET_LABEL_FONT_SIZE,
        altiumUnitsToMillimetersScale,
      ),
  )
  return Math.min(
    DEFAULT_INLINE_NET_LABEL_FONT_SIZE,
    Math.max(
      MIN_INLINE_NET_LABEL_FONT_SIZE,
      scaleLength(sourceFontSize, altiumUnitsToMillimetersScale),
    ),
  )
}
