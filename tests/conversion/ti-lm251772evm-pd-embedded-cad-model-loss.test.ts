import { expect, test } from "bun:test"
import { TI_EVM_REFERENCE_FILENAMES } from "../../scripts/references/reference-manifest"
import { expectTiEvmEmbeddedCadModelImport } from "../helpers/expect-ti-evm-embedded-cad-model-import"

test("LM251772EVM-PD preserves embedded CAD models", async () => {
  const importResult = await expectTiEvmEmbeddedCadModelImport({
    pcbFilename: TI_EVM_REFERENCE_FILENAMES.lm251772EvmPd.pcb,
    testPath: import.meta.path,
  })
  expect(importResult).toEqual({ importedCadModelCount: 94 })
}, 40_000)
