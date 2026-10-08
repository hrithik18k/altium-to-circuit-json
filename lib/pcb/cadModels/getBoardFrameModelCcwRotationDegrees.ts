import type { AltiumComponentBodyRecord } from "altiumts"
import type { Point3 } from "circuit-json"
import { SWAP_Y_AND_Z } from "./rotation/constants"
import { decomposeCircuitJsonRotation } from "./rotation/decomposeCircuitJsonRotation"
import { getAxisRotationMatrix } from "./rotation/getAxisRotationMatrix"
import { multiplyMatrix3 } from "./rotation/multiplyMatrix3"

export function getBoardFrameModelCcwRotationDegrees({
  body,
  layer,
}: {
  body: AltiumComponentBodyRecord
  layer: "bottom" | "top"
}): Point3 {
  const modelRotation = body.modelRotation3d
  const modelRotationMatrix = multiplyMatrix3({
    left: getAxisRotationMatrix({ axis: "z", angleDegrees: modelRotation.z }),
    right: multiplyMatrix3({
      left: getAxisRotationMatrix({ axis: "y", angleDegrees: modelRotation.y }),
      right: getAxisRotationMatrix({
        axis: "x",
        angleDegrees: modelRotation.x,
      }),
    }),
  })
  const boardSideModelRotation =
    layer === "bottom"
      ? multiplyMatrix3({
          left: getAxisRotationMatrix({ axis: "x", angleDegrees: 180 }),
          right: modelRotationMatrix,
        })
      : modelRotationMatrix
  // MODEL.2D.ROTATION is the body's board-plane rotation. Its direction is
  // opposite to MODEL.3D.ROTZ after converting the STEP axes.
  const boardFrameRotation = multiplyMatrix3({
    left: getAxisRotationMatrix({
      axis: "z",
      angleDegrees: -body.modelRotation2d,
    }),
    right: boardSideModelRotation,
  })

  // Altium applies MODEL.3D rotations in model X/Y/Z order. Circuit JSON's
  // Euler angles are consumed in board Z/Y/X order. Conjugating by the STEP
  // Y/Z axis conversion and decomposing avoids changing the rotation order.
  const sceneRotation = multiplyMatrix3({
    left: SWAP_Y_AND_Z,
    right: multiplyMatrix3({
      left: boardFrameRotation,
      right: SWAP_Y_AND_Z,
    }),
  })

  return decomposeCircuitJsonRotation(sceneRotation)
}
