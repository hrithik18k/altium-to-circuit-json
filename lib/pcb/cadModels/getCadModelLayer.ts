import type { AltiumComponentBodyRecord } from "altiumts"

export function getCadModelLayer({
  body,
  componentSide,
}: {
  body: AltiumComponentBodyRecord
  componentSide: "bottom" | "top" | "unknown"
}): "bottom" | "top" {
  const bodyProjection = body.getNumber("BODYPROJECTION")
  if (bodyProjection === 1) return "bottom"
  if (bodyProjection === 0) return "top"
  return componentSide === "bottom" ? "bottom" : "top"
}
