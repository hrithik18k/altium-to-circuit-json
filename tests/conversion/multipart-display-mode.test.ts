import { expect, test } from "bun:test"
import { createOpenSourceSchematicComparison } from "../helpers/create-open-source-schematic-comparison"

test("S02 multipart units use their active display mode and unit suffix", async () => {
  const { circuitJson, comparisonSvg } =
    await createOpenSourceSchematicComparison({
      filename: "fpga1394-s02.SchDoc",
      schematicName: "FPGA1394 S02",
    })
  const u1Source = circuitJson
    .filter((element) => element.type === "source_component")
    .find((element) => element.name === "U1")
  const u1d = circuitJson
    .filter((element) => element.type === "schematic_component")
    .find(
      (element) =>
        element.source_component_id === u1Source?.source_component_id &&
        element.schematic_component_id === "schematic_component_altium_2542",
    )

  expect(
    circuitJson.filter(
      (element) =>
        element.type === "schematic_port" &&
        element.schematic_component_id === u1d?.schematic_component_id,
    ),
  ).toHaveLength(38)
  expect(
    circuitJson.find(
      (element) =>
        element.type === "schematic_text" &&
        element.schematic_component_id === u1d?.schematic_component_id &&
        element.text === "U1D",
    ),
  ).toBeDefined()
  expect(
    circuitJson.find(
      (element) => element.type === "schematic_text" && element.text === "Q5B",
    ),
  ).toBeDefined()
  expect(
    circuitJson.some(
      (element) =>
        element.type === "schematic_text" &&
        ["SW1A", "U6A", "C109A"].includes(element.text),
    ),
  ).toBe(false)

  await expect(comparisonSvg).toMatchSvgSnapshot(import.meta.path)
}, 30_000)
