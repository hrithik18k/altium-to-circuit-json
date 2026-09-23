import { VECTOR_BY_DIRECTION } from "../connectivity"
import { getVectorDifference, subtractPoints } from "../geometry"
import type { SymbolSelection } from "../model"

export function getSymbolDirectionScore(selection: SymbolSelection): number {
  const [first, second] = selection.assignments
  if (!first) return Number.POSITIVE_INFINITY
  if (!second) {
    const expectedDirection =
      VECTOR_BY_DIRECTION[
        first.convertedPort.schematicPort.facing_direction ?? "right"
      ]
    return getVectorDifference(
      expectedDirection,
      subtractPoints(first.symbolPort, selection.symbol.center),
    )
  }
  let difference = 0
  let comparisonCount = 0
  for (
    let firstIndex = 0;
    firstIndex < selection.assignments.length;
    firstIndex++
  ) {
    for (
      let secondIndex = firstIndex + 1;
      secondIndex < selection.assignments.length;
      secondIndex++
    ) {
      const firstAssignment = selection.assignments[firstIndex]
      const secondAssignment = selection.assignments[secondIndex]
      if (!firstAssignment || !secondAssignment) continue
      const pairDifference = getVectorDifference(
        subtractPoints(
          secondAssignment.convertedPort.point,
          firstAssignment.convertedPort.point,
        ),
        subtractPoints(secondAssignment.symbolPort, firstAssignment.symbolPort),
      )
      if (!Number.isFinite(pairDifference)) continue
      difference += pairDifference
      comparisonCount++
    }
  }
  return comparisonCount > 0
    ? difference / comparisonCount
    : Number.POSITIVE_INFINITY
}
