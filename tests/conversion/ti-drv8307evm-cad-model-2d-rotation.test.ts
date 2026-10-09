import { expect, test } from "bun:test"
import { AltiumComponentBodyRecord, parseAltiumBinaryPcbDoc } from "altiumts"
import type { CadComponent } from "circuit-json"
import { convertAltiumPcbDocToCircuitJson } from "../../lib"
import { readReferenceBytes } from "../helpers/read-reference"

const PCB_FILENAME = "ti-drv8307evm.PcbDoc"

test("preserves Altium CAD model 2D rotation", async () => {
  const document = parseAltiumBinaryPcbDoc(
    await readReferenceBytes(PCB_FILENAME),
  )
  const bodyIndex = document.componentBodies.findIndex((body) => {
    if (!(body instanceof AltiumComponentBodyRecord)) return false
    return document.getComponentForRecord(body)?.designator === "D8"
  })
  const body = document.componentBodies[bodyIndex]
  if (!(body instanceof AltiumComponentBodyRecord)) {
    throw new Error("DRV8307EVM D8 has no component body")
  }

  body.setAngle("MODEL.2D.ROTATION", 90)

  const circuitJson = convertAltiumPcbDocToCircuitJson(document, {
    resolveEmbeddedModelUrl: ({ embeddedModel }) =>
      `/cad-models/${embeddedModel.index}.step`,
  })
  const cadComponent = circuitJson.find(
    (element): element is CadComponent =>
      element.type === "cad_component" &&
      element.cad_component_id === `cad_component_altium_${bodyIndex}`,
  )

  expect(cadComponent?.rotation).toEqual({ x: 0, y: 0, z: 90 })
})
