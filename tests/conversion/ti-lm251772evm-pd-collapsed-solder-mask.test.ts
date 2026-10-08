import { expect, test } from "bun:test"
import { parseAltiumBinaryPcbDoc } from "altiumts"
import type { PcbSmtPad } from "circuit-json"
import { convertAltiumPcbDocToCircuitJson } from "../../lib"
import { TI_EVM_REFERENCE_FILENAMES } from "../../scripts/references/reference-manifest"
import { readReferenceBytes } from "../helpers/read-reference"

test("LM251772EVM-PD preserves fully closed solder-mask openings", async () => {
  const document = parseAltiumBinaryPcbDoc(
    await readReferenceBytes(TI_EVM_REFERENCE_FILENAMES.lm251772EvmPd.pcb),
  )
  const circuitJson = convertAltiumPcbDocToCircuitJson(document)
  const smtPads = circuitJson.filter(
    (element): element is PcbSmtPad => element.type === "pcb_smtpad",
  )
  const coveredPads = smtPads.filter((pad) => pad.is_covered_with_solder_mask)

  expect(coveredPads).toHaveLength(13)
  expect(coveredPads.every((pad) => pad.soldermask_margin === undefined)).toBe(
    true,
  )
  expect(
    smtPads.every((pad) => {
      const margin = pad.soldermask_margin
      if (margin === undefined || margin >= 0) return true
      if (pad.shape === "circle") return pad.radius + margin > 0
      if (pad.shape === "polygon") return true
      return pad.width + 2 * margin > 0 && pad.height + 2 * margin > 0
    }),
  ).toBe(true)
}, 40_000)
