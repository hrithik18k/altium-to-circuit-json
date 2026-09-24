export function isPolarizedCapacitor(libraryReference: string): boolean {
  return /(?:^|[_-])cap(?:acitor)?[_-]?pol(?:arized)?(?:[_-]|$)/iu.test(
    libraryReference,
  )
}
