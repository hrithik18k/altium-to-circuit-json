import { estimateSchematicTextWidth } from "./estimateSchematicTextWidth"
import { splitLongSchematicWord } from "./splitLongSchematicWord"

export function wrapSchematicText({
  text,
  maximumWidth,
  fontSize,
  fontFamily,
}: {
  text: string
  maximumWidth: number
  fontSize: number
  fontFamily: string
}): string[] {
  return text.split("\n").flatMap((paragraph) => {
    if (
      estimateSchematicTextWidth({ text: paragraph, fontSize, fontFamily }) <=
      maximumWidth
    ) {
      return [paragraph]
    }
    const lines: string[] = []
    let line = ""
    for (const word of paragraph.split(/\s+/u)) {
      if (
        /^https?:\/\//u.test(word) &&
        estimateSchematicTextWidth({ text: word, fontSize, fontFamily }) >
          maximumWidth
      ) {
        if (line) lines.push(line)
        const chunks = splitLongSchematicWord({
          word,
          maximumWidth,
          fontSize,
          fontFamily,
        })
        lines.push(...chunks.slice(0, -1))
        line = chunks.at(-1) ?? ""
      } else if (!line) line = word
      else if (
        estimateSchematicTextWidth({
          text: `${line} ${word}`,
          fontSize,
          fontFamily,
        }) <= maximumWidth
      ) {
        line = `${line} ${word}`
      } else {
        lines.push(line)
        line = word
      }
    }
    if (line) lines.push(line)
    return lines.length > 0 ? lines : [paragraph]
  })
}
