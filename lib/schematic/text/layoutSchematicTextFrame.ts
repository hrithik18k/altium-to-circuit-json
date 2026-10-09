import { estimateSchematicTextWidth } from "./estimateSchematicTextWidth"
import { getSchematicTextFrameLines } from "./getSchematicTextFrameLines"

export function layoutSchematicTextFrame({
  text,
  maximumWidth,
  maximumHeight,
  fontSize,
  fontFamily,
  wordWrap,
}: {
  text: string
  maximumWidth: number
  maximumHeight: number
  fontSize: number
  fontFamily: string
  wordWrap: boolean
}): { lines: string[]; fontSize: number } {
  const frameText = { text, maximumWidth, fontFamily, wordWrap }
  const lines = getSchematicTextFrameLines({ ...frameText, fontSize })
  const hasOverlongUrl = text
    .split(/\s+/u)
    .some(
      (word) =>
        /^https?:\/\//u.test(word) &&
        estimateSchematicTextWidth({ text: word, fontSize, fontFamily }) >
          maximumWidth,
    )
  if (
    !wordWrap ||
    !hasOverlongUrl ||
    lines.length * fontSize <= maximumHeight ||
    maximumHeight <= 0
  ) {
    return { lines, fontSize }
  }
  // Find a fitting lower bound before choosing the largest usable font.
  let lower = fontSize / 2
  let upper = fontSize
  while (
    lower > Number.MIN_VALUE &&
    getSchematicTextFrameLines({ ...frameText, fontSize: lower }).length *
      lower >
      maximumHeight
  ) {
    upper = lower
    lower /= 2
  }
  for (let attempt = 0; attempt < 12; attempt++) {
    const candidate = (lower + upper) / 2
    const candidateLines = getSchematicTextFrameLines({
      ...frameText,
      fontSize: candidate,
    })
    if (candidateLines.length * candidate <= maximumHeight) {
      lower = candidate
    } else {
      upper = candidate
    }
  }
  return {
    lines: getSchematicTextFrameLines({ ...frameText, fontSize: lower }),
    fontSize: lower,
  }
}
