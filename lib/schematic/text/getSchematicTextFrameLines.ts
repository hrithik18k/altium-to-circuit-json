import { wrapSchematicText } from "./wrapSchematicText"

export function getSchematicTextFrameLines({
  text,
  maximumWidth,
  fontSize,
  fontFamily,
  wordWrap,
}: {
  text: string
  maximumWidth: number
  fontSize: number
  fontFamily: string
  wordWrap: boolean
}): string[] {
  return wordWrap
    ? wrapSchematicText({ text, maximumWidth, fontSize, fontFamily })
    : text.split("\n")
}
