import { expect } from "bun:test"
import {
  AltiumComponentBodyRecord,
  type AltiumPcbSide,
  parseAltiumBinaryPcbDoc,
} from "altiumts"
import type { CadComponent, CircuitJson } from "circuit-json"
import { convertAltiumPcbDocToCircuitJson } from "../../lib"
import { toMillimeterPoint } from "../../lib/pcb/geometry"
import { expectCadModelRotationMatchesAltium } from "./expect-cad-model-rotation-matches-altium"
import { expectTiEvmConversion3dSnapshot } from "./expect-ti-evm-conversion-3d-snapshot"
import { readReferenceBytes } from "./read-reference"

interface EmbeddedModelPlacement {
  body: AltiumComponentBodyRecord
  bodyIndex: number
  componentIndex: number
  componentSide: AltiumPcbSide
  modelIndex: number
}

const getEmbeddedModelLayer = ({
  body,
  componentSide,
}: Pick<EmbeddedModelPlacement, "body" | "componentSide">):
  | "bottom"
  | "top" => {
  const bodyProjection = body.getNumber("BODYPROJECTION")
  if (bodyProjection === 1) return "bottom"
  if (bodyProjection === 0) return "top"
  return componentSide === "bottom" ? "bottom" : "top"
}

const getEmbeddedModelPlacements = (
  document: ReturnType<typeof parseAltiumBinaryPcbDoc>,
): EmbeddedModelPlacement[] =>
  document.componentBodies.flatMap(
    (componentBody, bodyIndex): EmbeddedModelPlacement[] => {
      if (!(componentBody instanceof AltiumComponentBodyRecord)) return []
      const componentIndex = componentBody.componentIndex
      if (
        componentBody.modelPosition === undefined ||
        componentIndex === undefined
      ) {
        return []
      }
      const embeddedModel =
        document.getEmbeddedModelForComponentBody(componentBody)
      const component = document.getComponentForRecord(componentBody)
      if (!embeddedModel || !component) return []

      return [
        {
          body: componentBody,
          bodyIndex,
          componentIndex,
          componentSide: component.side,
          modelIndex: embeddedModel.index,
        },
      ]
    },
  )

const getCadComponentForBody = ({
  bodyIndex,
  circuitJson,
}: {
  bodyIndex: number
  circuitJson: CircuitJson
}): CadComponent | undefined =>
  circuitJson.find(
    (element): element is CadComponent =>
      element.type === "cad_component" &&
      element.cad_component_id === `cad_component_altium_${bodyIndex}`,
  )

export const expectTiEvmEmbeddedCadModelImport = async ({
  pcbFilename,
  testPath,
}: {
  pcbFilename: string
  testPath: string
}): Promise<{ importedCadModelCount: number }> => {
  const document = parseAltiumBinaryPcbDoc(
    await readReferenceBytes(pcbFilename),
  )
  const embeddedModelPlacements = getEmbeddedModelPlacements(document)
  const circuitJson = convertAltiumPcbDocToCircuitJson(document, {
    resolveEmbeddedModelUrl: ({ embeddedModel }) =>
      `/cad-models/${pcbFilename}/${embeddedModel.index}.step`,
  })
  const importedCadModels = circuitJson.filter(
    (element): element is CadComponent => element.type === "cad_component",
  )
  const pcbBoard = circuitJson.find((element) => element.type === "pcb_board")
  if (!pcbBoard) throw new Error(`${pcbFilename} has no converted PCB board`)

  expect(embeddedModelPlacements.length).toBeGreaterThan(0)
  expect(importedCadModels).toHaveLength(embeddedModelPlacements.length)

  for (const placement of embeddedModelPlacements) {
    const cadComponent = getCadComponentForBody({
      bodyIndex: placement.bodyIndex,
      circuitJson,
    })
    if (!cadComponent) {
      throw new Error(
        `${pcbFilename} is missing CAD model for body ${placement.bodyIndex}`,
      )
    }

    const layer = getEmbeddedModelLayer(placement)
    const modelPosition = placement.body.modelPosition
    if (!modelPosition) throw new Error("Embedded model has no position")
    const expectedPosition = toMillimeterPoint(modelPosition)
    const modelZOffsetMillimeters =
      placement.body.getAltiumMeasurement("MODEL.3D.DZ")?.toMillimeters() ?? 0
    const boardSurfaceZ = pcbBoard.thickness / 2
    const expectedPositionZ =
      layer === "bottom"
        ? -boardSurfaceZ - modelZOffsetMillimeters
        : boardSurfaceZ + modelZOffsetMillimeters

    expect(cadComponent.pcb_component_id).toBe(
      `pcb_component_altium_${placement.componentIndex}`,
    )
    expect(cadComponent.source_component_id).toBe(
      `source_component_altium_${placement.componentIndex}`,
    )
    expect(cadComponent.model_step_url).toBe(
      `/cad-models/${pcbFilename}/${placement.modelIndex}.step`,
    )
    expect(cadComponent.layer).toBe(layer)
    expect(cadComponent.position.x).toBeCloseTo(expectedPosition.x, 8)
    expect(cadComponent.position.y).toBeCloseTo(expectedPosition.y, 8)
    expect(cadComponent.position.z).toBeCloseTo(expectedPositionZ, 8)
    if (!cadComponent.rotation) {
      throw new Error(
        `${pcbFilename} CAD model ${placement.bodyIndex} has no rotation`,
      )
    }
    expectCadModelRotationMatchesAltium({
      body: placement.body,
      layer,
      rotation: cadComponent.rotation,
    })
    expect(cadComponent.model_unit_to_mm_scale_factor).toBe(1)
    expect(cadComponent.model_board_normal_direction).toBe("z+")
    expect(cadComponent.model_origin_position).toEqual({ x: 0, y: 0, z: 0 })
  }

  await expectTiEvmConversion3dSnapshot({
    circuitJson,
    pcbFilename,
    testPath,
  })

  return { importedCadModelCount: importedCadModels.length }
}
