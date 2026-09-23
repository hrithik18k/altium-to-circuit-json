import { expect, test } from "bun:test"
import { TI_POWER_REFERENCE_PCB_FILENAMES } from "../../scripts/references/reference-manifest"
import { getImportedPcbBoard } from "../helpers/get-imported-pcb-board"

test("imports copper layer counts from modern Altium layer stacks", async () => {
  const [customNamedStack, conventionalStack] = await Promise.all([
    getImportedPcbBoard({
      filename: TI_POWER_REFERENCE_PCB_FILENAMES.pmp23653PlanarTransformer,
    }),
    getImportedPcbBoard({ filename: "ebaz4205.PcbDoc" }),
  ])

  expect(customNamedStack.num_layers).toBe(6)
  expect(conventionalStack.num_layers).toBe(4)
})

test("defaults to two copper layers when stack data is unavailable", async () => {
  const board = await getImportedPcbBoard({
    filename: "simplefocmini-2024-04-26.PcbDoc",
  })

  expect(board.num_layers).toBe(2)
})
