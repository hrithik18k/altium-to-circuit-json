export function isAllScope(expression: string | undefined): boolean {
  return (
    expression === undefined ||
    expression.replace(/[\s()]/gu, "").toUpperCase() === "ALL"
  )
}
