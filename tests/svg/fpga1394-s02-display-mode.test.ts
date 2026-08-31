import { expect, test } from "bun:test"
import type { AnyCircuitElement } from "circuit-json"
import { createOpenSourceSchematicComparison } from "../helpers/create-open-source-schematic-comparison"

type SourceComponent = Extract<AnyCircuitElement, { type: "source_component" }>
type SchematicComponent = Extract<
  AnyCircuitElement,
  { type: "schematic_component" }
>

test("FPGA1394 S02 renders the active U1D pins and connections", async () => {
  const { circuitJson, comparisonSvg } =
    await createOpenSourceSchematicComparison({
      filename: "fpga1394-s02.SchDoc",
      schematicName: "FPGA1394 S02",
    })
  const sourceComponent = circuitJson.find(
    (element): element is SourceComponent =>
      element.type === "source_component" && element.name === "U1",
  )
  const schematicComponents = circuitJson.filter(
    (element): element is SchematicComponent =>
      element.type === "schematic_component" &&
      element.source_component_id === sourceComponent?.source_component_id,
  )
  const portCounts = schematicComponents.map(
    (component) =>
      circuitJson.filter(
        (element) =>
          element.type === "schematic_port" &&
          element.schematic_component_id === component.schematic_component_id,
      ).length,
  )
  // Stable record identity in the checksum-pinned source, not selected by the
  // expected pin count (which would hide a regression).
  const u1d = schematicComponents.find(
    (component) =>
      component.schematic_component_id === "schematic_component_altium_2542",
  )
  const u1dPortIds = new Set(
    circuitJson.flatMap((element) =>
      element.type === "schematic_port" &&
      element.schematic_component_id === u1d?.schematic_component_id
        ? [element.schematic_port_id]
        : [],
    ),
  )
  const connectedU1dPortIds = new Set(
    circuitJson.flatMap((element) =>
      element.type === "schematic_trace"
        ? element.edges.flatMap((edge) =>
            [edge.from_schematic_port_id, edge.to_schematic_port_id].filter(
              (portId): portId is string =>
                portId !== undefined && u1dPortIds.has(portId),
            ),
          )
        : [],
    ),
  )

  expect(portCounts).toEqual([66, 38])
  expect(connectedU1dPortIds.size).toBe(38)

  await expect(comparisonSvg).toMatchSvgSnapshot(import.meta.path)
}, 30_000)
