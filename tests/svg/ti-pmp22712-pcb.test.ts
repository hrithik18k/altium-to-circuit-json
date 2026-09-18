import { expect, test } from "bun:test"
import { TI_POWER_REFERENCE_PCB_FILENAMES } from "../../scripts/references/reference-manifest"
import { createOpenSourcePcbComparison } from "../helpers/create-open-source-pcb-comparison"
import { expectValidImportedPcb } from "../helpers/expect-valid-imported-pcb"

test(
  "TI PMP22712 PCB: altiumts SVG on the left, Circuit JSON SVG on the right",
  async () => {
    const { circuitJson, circuitJsonSvg, comparisonSvg } =
      await createOpenSourcePcbComparison({
        filename: TI_POWER_REFERENCE_PCB_FILENAMES.pmp22712,
        focusOnBoard: true,
        pcbName: "TI PMP22712",
      })

    expectValidImportedPcb({ circuitJson, circuitJsonSvg })
    const wrappedQuarterCircle = circuitJson.find(
      (element) =>
        element.type === "pcb_silkscreen_path" &&
        element.pcb_silkscreen_path_id === "pcb_silkscreen_path_altium_274",
    )
    expect(wrappedQuarterCircle?.type).toBe("pcb_silkscreen_path")
    if (wrappedQuarterCircle?.type === "pcb_silkscreen_path") {
      expect(wrappedQuarterCircle.route).toHaveLength(13)
    }
    await expect(comparisonSvg).toMatchSvgSnapshot(import.meta.path)
  },
  { timeout: 40_000 },
)
