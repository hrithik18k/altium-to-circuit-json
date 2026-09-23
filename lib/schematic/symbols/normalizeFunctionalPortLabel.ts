export function normalizeFunctionalPortLabel(
  portLabel: string,
): string | undefined {
  const normalized = portLabel.toLowerCase().replace(/[^a-z]/gu, "")
  if (normalized === "g" || normalized === "gate") return "gate"
  if (normalized === "d" || normalized === "drain") return "drain"
  if (normalized === "s" || normalized === "source") return "source"
  return undefined
}
