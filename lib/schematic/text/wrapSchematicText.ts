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
      if (!line) line = word
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
