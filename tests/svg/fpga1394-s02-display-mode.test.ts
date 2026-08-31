import { expect, test } from "bun:test"
import { readFile } from "node:fs/promises"
import type { AnyCircuitElement } from "circuit-json"
import { convertAltiumToCircuitJson } from "../../lib"
import { readReferenceBytes } from "../helpers/read-reference"
import { renderImportedSchematicToSvg } from "../helpers/render-imported-schematic"
import { stackSvgsHorizontally } from "stack-svgs"

const CIRCUIT_JSON_U1D_CROP = { height: 260, width: 260, x: 505, y: 110 }

type SourceComponent = Extract<AnyCircuitElement, { type: "source_component" }>
type SchematicComponent = Extract<
  AnyCircuitElement,
  { type: "schematic_component" }
>

function cropSvg(
  svg: string,
  crop: { height: number; width: number; x: number; y: number },
  title: string,
): string {
  return svg
    .replace(/<svg\b([^>]*)>/u, (_, attributes: string) => {
      const croppedAttributes = attributes.replace(
        /\s(?:height|preserveAspectRatio|viewBox|width)="[^"]*"/gu,
        "",
      )
      return `<svg${croppedAttributes} x="0" y="35" width="772" height="772" viewBox="${crop.x} ${crop.y} ${crop.width} ${crop.height}" overflow="hidden">`
    })
    .replace(
      /^/,
      `<svg xmlns="http://www.w3.org/2000/svg" width="772" height="807"><rect width="772" height="807" fill="white"/><text x="20" y="24" font-size="20">${title}</text>`,
    )
    .concat("</svg>")
}

test("FPGA1394 S02 renders the active U1D pins and connections", async () => {
  const source = await readReferenceBytes("fpga1394-s02.SchDoc")
  const circuitJson = convertAltiumToCircuitJson(source, {
    sourceType: "schematic",
    schematic: { sheetName: "FPGA1394 S02" },
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

  // Actual Altium screenshot supplied with the report. altiumts 0.0.26 also
  // ignores DISPLAYMODE, so it is not a reliable reference for this fixture.
  const reference = await readFile(
    new URL("../fixtures/fpga1394/u1d-altium-reference.png", import.meta.url),
  )
  const altiumSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="772" height="807"><rect width="772" height="807" fill="white"/><text x="20" y="24" font-size="20">Altium — supplied reference (38 pins)</text><image y="35" width="772" height="772" href="data:image/png;base64,${reference.toString("base64")}"/></svg>`
  const circuitJsonSvg = cropSvg(
    renderImportedSchematicToSvg(circuitJson),
    CIRCUIT_JSON_U1D_CROP,
    "Circuit JSON — after fix (38 pins)",
  )
  const before: AnyCircuitElement[] = JSON.parse(
    await readFile(
      new URL("../fixtures/fpga1394/s02-before.circuit.json", import.meta.url),
      "utf8",
    ),
  )
  expect(
    before.filter(
      (element) =>
        element.type === "schematic_port" &&
        element.schematic_component_id === u1d?.schematic_component_id,
    ),
  ).toHaveLength(88)
  const beforeSvg = cropSvg(
    renderImportedSchematicToSvg(before),
    { ...CIRCUIT_JSON_U1D_CROP, height: 340 },
    "Circuit JSON — supplied before fix (88 pins)",
  )
  const comparisonSvg = stackSvgsHorizontally(
    [altiumSvg, beforeSvg, circuitJsonSvg],
    { gap: 24 },
  )

  await expect(comparisonSvg).toMatchSvgSnapshot(import.meta.path)
}, 30_000)
