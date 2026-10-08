import type { Point3 } from "circuit-json"
import { normalizeRotationDegrees } from "./normalizeRotationDegrees"
import type { Matrix3 } from "./types"

export function decomposeCircuitJsonRotation(matrix: Matrix3): Point3 {
  const sineY = Math.min(1, Math.max(-1, -matrix[0][1]))
  const sceneY = Math.asin(sineY)
  const cosineY = Math.cos(sceneY)
  let sceneX: number
  let sceneZ: number

  if (Math.abs(cosineY) > 1e-8) {
    sceneX = Math.atan2(matrix[2][1], matrix[1][1])
    sceneZ = Math.atan2(matrix[0][2], matrix[0][0])
  } else if (sineY > 0) {
    sceneX = Math.atan2(matrix[2][0], matrix[1][0])
    sceneZ = 0
  } else {
    sceneX = Math.atan2(-matrix[2][0], -matrix[1][0])
    sceneZ = 0
  }

  const radiansToDegrees = 180 / Math.PI
  return {
    x: normalizeRotationDegrees(-sceneX * radiansToDegrees),
    y: normalizeRotationDegrees(-sceneY * radiansToDegrees),
    z: normalizeRotationDegrees(-sceneZ * radiansToDegrees),
  }
}
