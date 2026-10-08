import { getMatrix3Cell } from "./getMatrix3Cell"
import type { Matrix3 } from "./types"

export function multiplyMatrix3({
  left,
  right,
}: {
  left: Matrix3
  right: Matrix3
}): Matrix3 {
  return [
    [
      getMatrix3Cell({ column: 0, left, right, row: 0 }),
      getMatrix3Cell({ column: 1, left, right, row: 0 }),
      getMatrix3Cell({ column: 2, left, right, row: 0 }),
    ],
    [
      getMatrix3Cell({ column: 0, left, right, row: 1 }),
      getMatrix3Cell({ column: 1, left, right, row: 1 }),
      getMatrix3Cell({ column: 2, left, right, row: 1 }),
    ],
    [
      getMatrix3Cell({ column: 0, left, right, row: 2 }),
      getMatrix3Cell({ column: 1, left, right, row: 2 }),
      getMatrix3Cell({ column: 2, left, right, row: 2 }),
    ],
  ]
}
