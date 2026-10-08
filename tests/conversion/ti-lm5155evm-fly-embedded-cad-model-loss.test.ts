import { expect, test } from "bun:test"
import { TI_EVM_REFERENCE_FILENAMES } from "../../scripts/references/reference-manifest"
import { expectTiEvmEmbeddedCadModelImport } from "../helpers/expect-ti-evm-embedded-cad-model-import"

test("LM5155EVM-FLY preserves embedded CAD models", async () => {
  const importResult = await expectTiEvmEmbeddedCadModelImport({
    pcbFilename: TI_EVM_REFERENCE_FILENAMES.lm5155EvmFly.pcb,
    testPath: import.meta.path,
  })
  expect(importResult).toEqual({ importedCadModelCount: 24 })
}, 40_000)
