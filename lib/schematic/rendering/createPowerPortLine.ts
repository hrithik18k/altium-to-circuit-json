import { createLine } from "../text"

export function createPowerPortLine({
  color,
  end,
  index,
  scale,
  start,
  suffix,
}: {
  color: string
  end: { x: number; y: number }
  index: number
  scale: number
  start: { x: number; y: number }
  suffix: string
}) {
  return createLine({
    color,
    end,
    index,
    scale,
    start,
    strokeWidth: 0.1,
    suffix,
  })
}
