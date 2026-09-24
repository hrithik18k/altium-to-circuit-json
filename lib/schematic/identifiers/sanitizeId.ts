export function sanitizeId(sourceText: string): string {
  const sanitized = sourceText
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "_")
    .replace(/^_+|_+$/gu, "")
  return sanitized || "unnamed"
}
