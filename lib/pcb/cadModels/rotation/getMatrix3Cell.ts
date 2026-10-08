import type { Matrix3 } from "./types"

export function getMatrix3Cell({
  column,
  left,
  right,
  row,
}: {
  column: 0 | 1 | 2
  left: Matrix3
  right: Matrix3
  row: 0 | 1 | 2
}): number {
  return (
    left[row][0] * right[0][column] +
    left[row][1] * right[1][column] +
    left[row][2] * right[2][column]
  )
}
