import { expect, test } from "bun:test"
import { parseAltiumSchDoc } from "altiumts"
import { symbols } from "schematic-symbols"
import { applyToPoint, rotateDEG } from "transformation-matrix"
import { convertAltiumSchDocToCircuitJson } from "../../lib"
import { findDetachedSymbolPortIds } from "../helpers/find-detached-symbol-ports"
import { renderImportedSchematicToSvg } from "../helpers/render-imported-schematic"
import { readReferenceBytes } from "../helpers/read-reference"

function capacitor({ angle = 0, evidence = "curve" } = {}) {
  const point = (x: number, y: number) => {
    const p = applyToPoint(rotateDEG(angle), { x, y })
    return { x: Math.round(p.x) + 100, y: Math.round(p.y) + 100 }
  }
  const positive = point(0, 10),
    negative = point(0, -10)
  const start = point(-10, 0),
    end = point(10, 0),
    arc = point(0, -20),
    mark = point(2, 8)
  const records = [
    "|RECORD=31",
    `|RECORD=1|LibReference=${evidence === "curve" ? "CAP_POLARIZED" : "ManufacturerPart"}|Designator=C1|CurrentPartId=1`,
    `|RECORD=2|OwnerIndex=1|OwnerPartId=1|Location.X=${positive.x}|Location.Y=${positive.y}|Name=${evidence === "names" ? "+" : "2"}|Designator=2|PinLength=10|Orientation=${(1 + angle / 90) % 4}`,
    `|RECORD=2|OwnerIndex=1|OwnerPartId=1|Location.X=${negative.x}|Location.Y=${negative.y}|Name=${evidence === "names" ? "-" : "1"}|Designator=1|PinLength=10|Orientation=${(3 + angle / 90) % 4}`,
    `|RECORD=13|OwnerIndex=1|OwnerPartId=1|Location.X=${start.x}|Location.Y=${start.y}|Corner.X=${end.x}|Corner.Y=${end.y}`,
    ...(evidence === "curve"
      ? [
          `|RECORD=12|OwnerIndex=1|OwnerPartId=1|Location.X=${arc.x}|Location.Y=${arc.y}|Radius=16|StartAngle=${50 + angle}|EndAngle=${130 + angle}`,
        ]
      : []),
    ...(evidence === "geometry"
      ? [
          [point(1, 8), point(3, 8)],
          [point(2, 7), point(2, 9)],
        ].map(
          ([a, b]) =>
            `|RECORD=13|OwnerIndex=1|OwnerPartId=1|Location.X=${a!.x}|Location.Y=${a!.y}|Corner.X=${b!.x}|Corner.Y=${b!.y}`,
        )
      : []),
    ...(evidence === "mark"
      ? [
          `|RECORD=4|OwnerIndex=1|OwnerPartId=1|Location.X=${mark.x}|Location.Y=${mark.y}|Text=+`,
        ]
      : []),
  ]
  return convertAltiumSchDocToCircuitJson(
    parseAltiumSchDoc(records.join("\n")),
    { schematicUnitScale: 0.02, centerOnSchematicSheet: false },
  )
}

for (const evidence of ["curve", "mark", "names", "geometry"]) {
  test.each([0, 90, 180, 270])(
    `maps physical pin 2 to the native positive terminal from ${evidence}, angle=%s`,
    (angle) => {
      const circuitJson = capacitor({ angle, evidence })
      const component = circuitJson.find(
        (e) => e.type === "schematic_component",
      )!
      expect(component.symbol_name).toMatch(/^capacitor_polarized_/)
      const symbol = symbols[component.symbol_name as keyof typeof symbols]!
      const positive = symbol.ports.find((p) => p.labels.includes("pos"))!
      const port = circuitJson.find(
        (e) => e.type === "schematic_port" && e.pin_number === 2,
      )
      expect(port?.type === "schematic_port" && port.center).toEqual({
        x: component.center.x + positive.x - symbol.center.x,
        y: component.center.y + positive.y - symbol.center.y,
      })
      expect(findDetachedSymbolPortIds(circuitJson)).toEqual([])
      expect(
        renderImportedSchematicToSvg(circuitJson).includes(
          "Could not match ports",
        ),
      ).toBe(false)
    },
  )
}

test("four-terminal capacitor networks do not become two-terminal native capacitors", async () => {
  const circuitJson = convertAltiumSchDocToCircuitJson(
    parseAltiumSchDoc(
      await readReferenceBytes("ti-tmds62levm-rev-b/20.SchDoc"),
    ),
  )
  const components = circuitJson.filter((e) => e.type === "schematic_component")
  const networks = components.filter(
    (c) =>
      circuitJson.filter(
        (e) =>
          e.type === "schematic_port" &&
          e.schematic_component_id === c.schematic_component_id,
      ).length === 4 &&
      circuitJson.some(
        (e) =>
          e.type === "source_component" &&
          e.source_component_id === c.source_component_id &&
          [
            "U31",
            "U37",
            "U25",
            "U19",
            "U26",
            "U43",
            "U40",
            "U38",
            "U41",
            "U24",
            "U20",
            "U33",
          ].includes(e.name),
      ),
  )
  expect(networks).toHaveLength(12)
  expect(networks.every((c) => c.symbol_name === undefined)).toBe(true)
})

test("TI CAP_Dup2 ceramic capacitors keep unpolarized native symbols", async () => {
  const circuitJson = convertAltiumSchDocToCircuitJson(
    parseAltiumSchDoc(
      await readReferenceBytes("ti-tmds62levm-rev-b/14.SchDoc"),
    ),
  )
  const source = circuitJson
    .filter((e) => e.type === "source_component")
    .find((e) => e.name === "C178")
  expect(source).toMatchObject({
    ftype: "simple_capacitor",
    capacitance: 1e-7,
    manufacturer_part_number: "GRT155R71H104KE01D",
  })
  const component = circuitJson
    .filter((e) => e.type === "schematic_component")
    .find((e) => e.source_component_id === source?.source_component_id)
  expect(component?.symbol_name).toMatch(/^capacitor_(up|down|left|right)$/)
})
