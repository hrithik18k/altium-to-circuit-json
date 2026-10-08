import { estimateSchematicTextWidth } from "./estimateSchematicTextWidth"

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
        estimateSchematicTextWidth({
          text: line ? `${line} ${word}` : word,
          fontSize,
          fontFamily,
        }) <= maximumWidth
      ) {
        line = line ? `${line} ${word}` : word
        continue
      }
      if (line) {
        lines.push(line)
        line = ""
      }
      for (const character of word) {
        if (
          line &&
          estimateSchematicTextWidth({
            text: line + character,
            fontSize,
            fontFamily,
          }) > maximumWidth
        ) {
          lines.push(line)
          line = ""
        }
        line += character
      }
    }
    if (line) lines.push(line)
    return lines.length > 0 ? lines : [paragraph]
  })
}
