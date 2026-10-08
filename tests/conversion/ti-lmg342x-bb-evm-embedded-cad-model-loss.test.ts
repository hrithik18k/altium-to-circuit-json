import { expect, test } from "bun:test"
import { TI_EVM_REFERENCE_FILENAMES } from "../../scripts/references/reference-manifest"
import { expectTiEvmEmbeddedCadModelImport } from "../helpers/expect-ti-evm-embedded-cad-model-import"

test("LMG342X-BB-EVM preserves embedded CAD models", async () => {
  const importResult = await expectTiEvmEmbeddedCadModelImport({
    pcbFilename: TI_EVM_REFERENCE_FILENAMES.lmg342xBbEvm.pcb,
    testPath: import.meta.path,
  })
  expect(importResult).toEqual({ importedCadModelCount: 77 })
}, 40_000)
