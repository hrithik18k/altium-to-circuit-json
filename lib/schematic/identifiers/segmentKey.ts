import type { SchematicSegmentKey } from "./types"

export function segmentKey(
  start: { x: number; y: number },
  end: { x: number; y: number },
): SchematicSegmentKey {
  const startKey = `${start.x.toFixed(6)},${start.y.toFixed(6)}`
  const endKey = `${end.x.toFixed(6)},${end.y.toFixed(6)}`
  return (
    startKey < endKey ? `${startKey}|${endKey}` : `${endKey}|${startKey}`
  ) as SchematicSegmentKey
}
