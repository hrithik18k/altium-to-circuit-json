import { expect, test } from "bun:test"
import { parseAltiumBinaryPcbDoc } from "altiumts"
import type { CadComponent } from "circuit-json"
import { convertAltiumPcbDocToCircuitJson } from "../../lib"
import { readReferenceBytes } from "../helpers/read-reference"

const PCB_FILENAME = "ti-dp83825evm.PcbDoc"

test("converts composed Altium CAD model rotations into board coordinates", async () => {
  const document = parseAltiumBinaryPcbDoc(
    await readReferenceBytes(PCB_FILENAME),
  )
  const circuitJson = convertAltiumPcbDocToCircuitJson(document, {
    resolveEmbeddedModelUrl: ({ embeddedModel }) =>
      `/cad-models/${embeddedModel.index}.step`,
  })
  const cadComponents = circuitJson.filter(
    (element): element is CadComponent => element.type === "cad_component",
  )
  const topModel = cadComponents.find(
    (model) => model.cad_component_id === "cad_component_altium_416",
  )
  const bottomModel = cadComponents.find(
    (model) => model.cad_component_id === "cad_component_altium_423",
  )

  expect(topModel?.layer).toBe("top")
  expect(topModel?.rotation).toEqual({ x: 270, y: 90, z: 0 })
  expect(bottomModel?.layer).toBe("bottom")
  expect(bottomModel?.rotation).toEqual({ x: 270, y: 270, z: 0 })
})
