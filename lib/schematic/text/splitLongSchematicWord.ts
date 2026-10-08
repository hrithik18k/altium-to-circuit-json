import { estimateSchematicTextWidth } from "./estimateSchematicTextWidth"

export function splitLongSchematicWord({
  word,
  maximumWidth,
  fontSize,
  fontFamily,
}: {
  word: string
  maximumWidth: number
  fontSize: number
  fontFamily: string
}): string[] {
  const chunks: string[] = []
  let remaining = word
  while (remaining) {
    let end = 0
    let preferredEnd = 0
    for (const character of remaining) {
      const next = end + character.length
      if (
        end > 0 &&
        estimateSchematicTextWidth({
          text: remaining.slice(0, next),
          fontSize,
          fontFamily,
        }) > maximumWidth
      )
        break
      end = next
      if (/[/?&=_.-]/u.test(character)) preferredEnd = end
    }
    if (end === remaining.length) {
      chunks.push(remaining)
      break
    }
    const splitAt = preferredEnd >= end * 0.6 ? preferredEnd : Math.max(end, 1)
    chunks.push(remaining.slice(0, splitAt))
    remaining = remaining.slice(splitAt)
  }
  return chunks
}
