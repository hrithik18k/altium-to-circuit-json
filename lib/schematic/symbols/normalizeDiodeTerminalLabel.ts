export function normalizeDiodeTerminalLabel(
  portLabel: string,
): "pos" | "neg" | undefined {
  const normalized = portLabel.toLowerCase().replace(/[^a-z]/gu, "")
  if (
    normalized === "a" ||
    normalized === "anode" ||
    normalized === "pos" ||
    normalized === "positive"
  )
    return "pos"
  if (
    normalized === "k" ||
    normalized === "cathode" ||
    normalized === "neg" ||
    normalized === "negative"
  )
    return "neg"
  return undefined
}
