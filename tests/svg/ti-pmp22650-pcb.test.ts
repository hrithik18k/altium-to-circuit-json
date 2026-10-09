import { expect, test } from "bun:test"
import { TI_POWER_REFERENCE_PCB_FILENAMES } from "../../scripts/references/reference-manifest"
import { createOpenSourcePcbComparison } from "../helpers/create-open-source-pcb-comparison"
import { createRoutingConstraintsComparisonSvg } from "../helpers/create-routing-constraints-comparison-svg"
import { expectImportedPcbConnections } from "../helpers/expect-imported-pcb-connections"
import { expectValidImportedPcb } from "../helpers/expect-valid-imported-pcb"

test(
  "TI PMP22650 PCB: compare Altium, Circuit JSON, and routing constraints",
  async () => {
    const { circuitJson, circuitJsonSvg, comparisonSvg, document } =
      await createOpenSourcePcbComparison({
        filename: TI_POWER_REFERENCE_PCB_FILENAMES.pmp22650,
        focusOnBoard: true,
        pcbName: "TI PMP22650",
      })

    expectValidImportedPcb({ circuitJson, circuitJsonSvg })
    expectImportedPcbConnections({
      circuitJson,
      document,
      expectedConnectionCount: 410,
      expectedInheritedCopperAreaCount: 395,
    })
    expect(
      circuitJson.filter(
        (element) =>
          element.type === "pcb_trace" && !("source_trace_id" in element),
      ),
    ).toHaveLength(0)

    const layerSpecificKeepoutArcs = circuitJson.filter(
      (element) =>
        element.type === "pcb_keepout" && element.shape === "outline",
    )
    expect(layerSpecificKeepoutArcs).toHaveLength(159)
    expect(layerSpecificKeepoutArcs).toContainEqual(
      expect.objectContaining({
        pcb_keepout_id: "pcb_keepout_altium_arc_4291",
        layers: ["top"],
        stroke_width: 0.0254,
      }),
    )
    const board = circuitJson.find((element) => element.type === "pcb_board")
    if (!board) throw new Error("PMP22650 conversion did not emit a pcb_board")
    const sourceNets = circuitJson.filter(
      (element) => element.type === "source_net",
    )
    expect(board).toMatchObject({
      allow_blind_and_buried_vias: true,
      is_via_in_pad_allowed: true,
      min_via_hole_diameter: 0.1016,
      min_via_pad_diameter: 0.2032,
    })
    expect(board.min_trace_width).toBeCloseTo(0.1524)
    expect(sourceNets.every(({ trace_width }) => trace_width === 0.254)).toBe(
      true,
    )
    const routingConstraintsComparisonSvg =
      createRoutingConstraintsComparisonSvg({
        board,
        boardComparisonSvg: comparisonSvg,
        sourceNets,
      })

    await expect(routingConstraintsComparisonSvg).toMatchSvgSnapshot(
      import.meta.path,
    )
  },
  { timeout: 180_000 },
)
