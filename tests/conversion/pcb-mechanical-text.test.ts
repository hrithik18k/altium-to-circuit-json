import { expect, test } from "bun:test"
import type { PcbFabricationNoteText } from "circuit-json"
import { convertAltiumToCircuitJson } from "../../lib"
import { TI_POWER_REFERENCE_PCB_FILENAMES } from "../../scripts/references/reference-manifest"
import { readReferenceBytes } from "../helpers/read-reference"

test("imports visible mechanical assembly text", async () => {
  const source = await readReferenceBytes(
    TI_POWER_REFERENCE_PCB_FILENAMES.pmp23653PlanarTransformer,
  )
  const fabricationNoteTexts = convertAltiumToCircuitJson(source, {
    sourceType: "pcb",
  }).filter(
    (element): element is PcbFabricationNoteText =>
      element.type === "pcb_fabrication_note_text",
  )

  expect(
    fabricationNoteTexts.map(({ text, layer }) => ({ text, layer })),
  ).toEqual([
    { text: "J3", layer: "bottom" },
    { text: "J7", layer: "bottom" },
    { text: "J5", layer: "bottom" },
  ])
})
