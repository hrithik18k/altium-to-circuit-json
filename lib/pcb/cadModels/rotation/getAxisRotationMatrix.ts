import type { Matrix3 } from "./types"

export function getAxisRotationMatrix({
  angleDegrees,
  axis,
}: {
  angleDegrees: number
  axis: "x" | "y" | "z"
}): Matrix3 {
  const angleRadians = (angleDegrees * Math.PI) / 180
  const cosine = Math.cos(angleRadians)
  const sine = Math.sin(angleRadians)

  if (axis === "x") {
    return [
      [1, 0, 0],
      [0, cosine, -sine],
      [0, sine, cosine],
    ]
  }
  if (axis === "y") {
    return [
      [cosine, 0, sine],
      [0, 1, 0],
      [-sine, 0, cosine],
    ]
  }
  return [
    [cosine, -sine, 0],
    [sine, cosine, 0],
    [0, 0, 1],
  ]
}
