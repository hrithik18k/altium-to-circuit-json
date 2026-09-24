export function uniqueStrings(strings: Array<string | undefined>): string[] {
  return [
    ...new Set(
      strings.filter((candidate): candidate is string => Boolean(candidate)),
    ),
  ]
}
