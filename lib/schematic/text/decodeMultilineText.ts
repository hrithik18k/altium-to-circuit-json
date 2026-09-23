export function decodeMultilineText(text: string): string {
  return text.replaceAll("~1", "\n").replaceAll("\\n", "\n")
}
