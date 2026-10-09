export function isProtectionDiode({
  libraryReference,
  description,
}: {
  libraryReference: string
  description?: string
}): boolean {
  return /(?:^|[^a-z])(?:zener|tvs)(?:[^a-z]|$)|transient[\s_-]+voltage[\s_-]+suppress/iu.test(
    `${libraryReference} ${description ?? ""}`,
  )
}
