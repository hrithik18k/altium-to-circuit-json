import { expect, test } from "bun:test"
import { TI_POWER_REFERENCE_PCB_FILENAMES } from "../../scripts/references/reference-manifest"
import { createOpenSourcePcbComparison } from "../helpers/create-open-source-pcb-comparison"
import { expectValidImportedPcb } from "../helpers/expect-valid-imported-pcb"

test(
  "TI PMP22773 PCB: altiumts SVG on the left, Circuit JSON SVG on the right",
  async () => {
    const { circuitJson, circuitJsonSvg, comparisonSvg } =
      await createOpenSourcePcbComparison({
        filename: TI_POWER_REFERENCE_PCB_FILENAMES.pmp22773,
        focusOnBoard: true,
        pcbName: "TI PMP22773",
      })

    expectValidImportedPcb({ circuitJson, circuitJsonSvg })
    const components = circuitJson.filter(
      (element) => element.type === "pcb_component",
    )
    const componentIds = new Set(
      components.map((component) => component.pcb_component_id),
    )
    const padsAndHoles = circuitJson.filter(
      (element) =>
        element.type === "pcb_smtpad" ||
        element.type === "pcb_plated_hole" ||
        element.type === "pcb_hole",
    )
    expect(padsAndHoles.length).toBeGreaterThan(0)
    expect(
      padsAndHoles.every(
        (element) =>
          element.pcb_component_id !== undefined &&
          componentIds.has(element.pcb_component_id),
      ),
    ).toBe(true)
    await expect(comparisonSvg).toMatchSvgSnapshot(import.meta.path)
  },
  { timeout: 40_000 },
)
