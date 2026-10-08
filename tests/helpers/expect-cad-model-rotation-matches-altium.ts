import { expect } from "bun:test"
import type { AltiumComponentBodyRecord } from "altiumts"
import type { Point3 } from "circuit-json"

type OrientationMatrix = [
  [number, number, number],
  [number, number, number],
  [number, number, number],
]

const getAltiumModelOrientationMatrix = ({
  body,
  layer,
}: {
  body: AltiumComponentBodyRecord
  layer: "bottom" | "top"
}): OrientationMatrix => {
  const rotation = body.modelRotation3d
  const xRadians = (rotation.x * Math.PI) / 180
  const yRadians = (rotation.y * Math.PI) / 180
  const zRadians = (rotation.z * Math.PI) / 180
  const cosineX = Math.cos(xRadians)
  const cosineY = Math.cos(yRadians)
  const cosineZ = Math.cos(zRadians)
  const sineX = Math.sin(xRadians)
  const sineY = Math.sin(yRadians)
  const sineZ = Math.sin(zRadians)
  const bottomRowSign = layer === "bottom" ? -1 : 1

  // Altium composes model rotations as Rz * Ry * Rx. The returned matrix also
  // applies the STEP Y/Z axis swap and the bottom-side X-axis flip directly.
  return [
    [
      cosineZ * cosineY,
      cosineZ * sineY * cosineX + sineZ * sineX,
      cosineZ * sineY * sineX - sineZ * cosineX,
    ],
    [
      -bottomRowSign * sineY,
      bottomRowSign * cosineY * cosineX,
      bottomRowSign * cosineY * sineX,
    ],
    [
      bottomRowSign * sineZ * cosineY,
      bottomRowSign * (sineZ * sineY * cosineX - cosineZ * sineX),
      bottomRowSign * (sineZ * sineY * sineX + cosineZ * cosineX),
    ],
  ]
}

const getCircuitJsonModelOrientationMatrix = (
  rotation: Point3,
): OrientationMatrix => {
  const xRadians = (-rotation.x * Math.PI) / 180
  const yRadians = (-rotation.y * Math.PI) / 180
  const zRadians = (-rotation.z * Math.PI) / 180
  const cosineX = Math.cos(xRadians)
  const cosineY = Math.cos(yRadians)
  const cosineZ = Math.cos(zRadians)
  const sineX = Math.sin(xRadians)
  const sineY = Math.sin(yRadians)
  const sineZ = Math.sin(zRadians)

  // Circuit JSON consumes CAD Euler angles as Rx * Rz * Ry after negating
  // counter-clockwise degrees into the viewer's scene convention.
  return [
    [cosineY * cosineZ, -sineY, cosineY * sineZ],
    [
      cosineX * sineY * cosineZ + sineX * sineZ,
      cosineX * cosineY,
      cosineX * sineY * sineZ - sineX * cosineZ,
    ],
    [
      sineX * sineY * cosineZ - cosineX * sineZ,
      sineX * cosineY,
      sineX * sineY * sineZ + cosineX * cosineZ,
    ],
  ]
}

export const expectCadModelRotationMatchesAltium = ({
  body,
  layer,
  rotation,
}: {
  body: AltiumComponentBodyRecord
  layer: "bottom" | "top"
  rotation: Point3
}): void => {
  const expectedOrientation = getAltiumModelOrientationMatrix({ body, layer })
  const actualOrientation = getCircuitJsonModelOrientationMatrix(rotation)

  for (const row of [0, 1, 2] as const) {
    for (const column of [0, 1, 2] as const) {
      expect(actualOrientation[row][column]).toBeCloseTo(
        expectedOrientation[row][column],
        8,
      )
    }
  }
}
