import { estimateSchematicTextWidth } from "./estimateSchematicTextWidth"
import { wrapSchematicText } from "./wrapSchematicText"

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
  const getLines = (size: number) =>
    wordWrap
      ? wrapSchematicText({
          text,
          maximumWidth,
          fontSize: size,
          fontFamily,
        })
      : text.split("\n")
  const lines = getLines(fontSize)
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
    lines.length * fontSize <= maximumHeight
  ) {
    return { lines, fontSize }
  }
  // Prefer the source font; let frame clipping handle text that cannot fit legibly.
  let lower = fontSize * 0.7
  let upper = fontSize
  for (let attempt = 0; attempt < 12; attempt++) {
    const candidate = (lower + upper) / 2
    const candidateLines = getLines(candidate)
    if (candidateLines.length * candidate <= maximumHeight) {
      lower = candidate
    } else {
      upper = candidate
    }
  }
  return { lines: getLines(lower), fontSize: lower }
}
