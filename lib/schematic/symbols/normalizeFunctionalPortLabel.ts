export function normalizeFunctionalPortLabel(
  portLabel: string,
): string | undefined {
  const normalized = portLabel.toLowerCase().replace(/[^a-z]/gu, "")
  if (normalized === "b" || normalized === "base") return "base"
  if (normalized === "c" || normalized === "collector") return "collector"
  if (normalized === "e" || normalized === "emitter") return "emitter"
  if (normalized === "w" || normalized === "wiper") return "wiper"
  if (normalized === "cw" || normalized === "ccw") return normalized
  if (normalized === "g" || normalized === "gate") return "gate"
  if (normalized === "d" || normalized === "drain") return "drain"
  if (normalized === "s" || normalized === "source") return "source"
  return undefined
}
