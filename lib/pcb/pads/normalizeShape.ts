export function normalizeShape(shape: string | undefined): string {
  return (shape ?? "ROUND").replace(/[\s_-]+/gu, "").toUpperCase()
}
