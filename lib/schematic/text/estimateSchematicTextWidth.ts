export function estimateSchematicTextWidth({
  text,
  fontSize,
  fontFamily,
}: {
  text: string
  fontSize: number
  fontFamily: string
}): number {
  if (/courier|mono/iu.test(fontFamily)) return text.length * fontSize * 0.6
  if (!/times|cambria|serif/iu.test(fontFamily)) {
    return text.length * fontSize * 0.52
  }
  return [...text].reduce((width, character) => {
    const emWidth =
      character === " "
        ? 0.23
        : /[ilI1.,:;!'`|]/u.test(character)
          ? 0.2
          : /[mwMW@%]/u.test(character)
            ? 0.7
            : /[A-Z0-9]/u.test(character)
              ? 0.5
              : 0.4
    return width + emWidth * fontSize
  }, 0)
}
