import type { ConvertedPort } from "../model"

export function compareConvertedPorts(
  left: ConvertedPort,
  right: ConvertedPort,
): number {
  const leftPinNumber = left.schematicPort.pin_number
  const rightPinNumber = right.schematicPort.pin_number
  if (leftPinNumber !== undefined && rightPinNumber !== undefined) {
    return leftPinNumber - rightPinNumber
  }
  return (
    (left.schematicPort.true_ccw_index ?? 0) -
    (right.schematicPort.true_ccw_index ?? 0)
  )
}
