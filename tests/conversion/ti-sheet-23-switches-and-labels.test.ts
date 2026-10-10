import { expect, test } from "bun:test"
import { parseAltiumSchDoc } from "altiumts"
import type { AnyCircuitElement } from "circuit-json"
import { convertAltiumSchDocToCircuitJson } from "../../lib"
import { readReferenceBytes } from "../helpers/read-reference"
import { renderImportedSchematicToSvg } from "../helpers/render-imported-schematic"

type SourceComponent = Extract<AnyCircuitElement, { type: "source_component" }>

function ownedByName(elements: AnyCircuitElement[], name: string) {
  const source = elements.find(
    (element): element is SourceComponent =>
      element.type === "source_component" && element.name === name,
  )
  const component = elements.find(
    (element) =>
      element.type === "schematic_component" &&
      element.source_component_id === source?.source_component_id,
  )
  if (!component || component.type !== "schematic_component")
    throw new Error(`Missing ${name}`)
  return {
    component,
    owned: elements.filter(
      (element) =>
        ("schematic_component_id" in element &&
          element.schematic_component_id ===
            component.schematic_component_id) ||
        (element.type === "schematic_text" &&
          element.schematic_text_id.startsWith(
            `${component.schematic_component_id}_label_`,
          )),
    ),
  }
}

test.each([true, false])(
  "sheet 23 retains switch actuators and resistor layout with includeText=%s",
  async (includeText) => {
    const elements = convertAltiumSchDocToCircuitJson(
      parseAltiumSchDoc(
        await readReferenceBytes("ti-tmds62levm-rev-b/23.SchDoc"),
      ),
      { schematicUnitScale: 1, centerOnSchematicSheet: false, includeText },
    )
    for (const [name, pinCount] of [
      ["SW4", 16],
      ["SW2", 8],
      ["SW3", 8],
    ] as const) {
      const { component, owned } = ownedByName(elements, name)
      expect(component.is_box_with_pins).toBe(false)
      expect(
        owned.filter((element) => element.type === "schematic_rect"),
      ).toHaveLength(9)
      const ports = owned.filter((element) => element.type === "schematic_port")
      expect(ports).toHaveLength(pinCount)
      for (const port of ports) {
        expect(port.is_connected).toBe(true)
        expect(
          owned.some(
            (element) =>
              element.type === "schematic_line" &&
              ((element.x1 === port.center.x && element.y1 === port.center.y) ||
                (element.x2 === port.center.x && element.y2 === port.center.y)),
          ),
        ).toBe(true)
      }
      expect(
        owned.some(
          (element) =>
            element.type === "schematic_text" && element.text === name,
        ),
      ).toBe(includeText)
    }
    for (let number = 173; number <= 180; number++) {
      const { component, owned } = ownedByName(elements, `R${number}`)
      expect(component.symbol_name).toMatch(/^boxresistor_/)
      expect(
        owned.filter((element) => element.type === "schematic_line"),
      ).toHaveLength(0)
      const labels = owned.filter(
        (element) => element.type === "schematic_text",
      )
      expect(labels).toHaveLength(includeText ? 2 : 0)
      if (includeText) {
        expect(labels.map((label) => label.text)).toEqual([`R${number}`, "1K"])
        expect(labels.every((label) => label.rotation === -90)).toBe(true)
        expect(
          labels.every(
            (label) => label.position.x === 280 + (number - 173) * 10,
          ),
        ).toBe(true)
        // Vertical labels fit the ten-unit pitch and stay above the switch
        // pins; values sit beyond the resistor's upper terminal.
        expect(labels.every((label) => label.font_size <= 10)).toBe(true)
        expect(labels[0]?.position.y).toBeGreaterThan(1070)
        expect(labels[0]?.position.y).toBeLessThan(1090)
        expect(labels[1]?.position.y).toBeGreaterThan(1140)
      }
      expect(
        owned
          .filter((element) => element.type === "schematic_port")
          .every((port) => port.is_connected),
      ).toBe(true)
      expect(
        owned
          .filter((element) => element.type === "schematic_port")
          .map((port) => port.center),
      ).toEqual([
        { x: 280 + (number - 173) * 10, y: component.center.y - 0.3 },
        { x: 280 + (number - 173) * 10, y: component.center.y + 0.3 },
      ])
    }
    if (includeText) {
      const svg = renderImportedSchematicToSvg(elements)
      expect(svg).toMatch(/transform="rotate\(-90, [^"]+\)">R173<\/text>/)
    }
  },
)

function resistor({
  orientation = 1,
  hidden = false,
  ownerPart = 1,
  broken = false,
  polyline = false,
} = {}) {
  const points = [
    [50, 40],
    [47, 43],
    [53, 49],
    [47, 55],
    [50, broken ? 59 : 60],
  ]
  const body = polyline
    ? [
        `|RECORD=6|OwnerIndex=1|OwnerPartId=1|LocationCount=5|${points.map(([x, y], index) => `X${index + 1}=${x}|Y${index + 1}=${y}`).join("|")}`,
      ]
    : points
        .slice(1)
        .map(
          ([x, y], index) =>
            `|RECORD=13|OwnerIndex=1|OwnerPartId=1|Location.X=${points[index]![0]}|Location.Y=${points[index]![1]}|Corner.X=${x}|Corner.Y=${y}`,
        )
  return convertAltiumSchDocToCircuitJson(
    parseAltiumSchDoc(
      [
        "|RECORD=31",
        "|RECORD=1|LibReference=RESISTOR|Designator=R1|CurrentPartId=1|Location.X=50|Location.Y=50",
        "|RECORD=2|OwnerIndex=1|OwnerPartId=1|Location.X=50|Location.Y=40|Name=1|Designator=1|PinLength=10|Orientation=3",
        "|RECORD=2|OwnerIndex=1|OwnerPartId=1|Location.X=50|Location.Y=60|Name=2|Designator=2|PinLength=10|Orientation=1",
        ...body,
        `|RECORD=34|OwnerIndex=1|OwnerPartId=${ownerPart}|Location.X=50|Location.Y=35|Text=R1|Orientation=${orientation}|IsHidden=${hidden ? "T" : "F"}`,
      ].join("\n"),
    ),
    { schematicUnitScale: 1, centerOnSchematicSheet: false },
  )
}

test.each([false, true])(
  "keeps native resistor bodies with rotated labels drawn with polylines=%s",
  (polyline) => {
    for (const orientation of [1, 3]) {
      const { component, owned } = ownedByName(
        resistor({ polyline, orientation }),
        "R1",
      )
      expect(component.symbol_name).toMatch(/^boxresistor_/)
      expect(
        owned.find(
          (element) =>
            element.type === "schematic_text" && element.text === "R1",
        ),
      ).toMatchObject({ rotation: -90 })
    }
  },
)

test.each([
  { orientation: 0 },
  { hidden: true },
  { ownerPart: 2 },
  { broken: true },
])(
  "keeps the native resistor for horizontal, invisible, or incomplete source layout: %p",
  (options) => {
    const { component } = ownedByName(resistor(options), "R1")
    expect(component.symbol_name).toMatch(/^boxresistor_/)
  },
)

test.each([
  "",
  "|RECORD=14|OwnerIndex=1|OwnerPartId=2|Location.X=42|Location.Y=42|Corner.X=44|Corner.Y=58",
])(
  "keeps a switch's box fallback without visible internal graphics: %s",
  (internal) => {
    const elements = convertAltiumSchDocToCircuitJson(
      parseAltiumSchDoc(
        [
          "|RECORD=31",
          "|RECORD=1|LibReference=DIP_SWITCH|Designator=SW1|CurrentPartId=1|Location.X=50|Location.Y=50",
          "|RECORD=2|OwnerIndex=1|OwnerPartId=1|Location.X=40|Location.Y=50|Name=1|Designator=1|PinLength=10|Orientation=2",
          "|RECORD=14|OwnerIndex=1|OwnerPartId=1|Location.X=40|Location.Y=40|Corner.X=60|Corner.Y=60",
          internal,
        ].join("\n"),
      ),
    )
    expect(ownedByName(elements, "SW1").component.is_box_with_pins).toBe(true)
  },
)

test("native resistor bodies fit the dense sheet 23 bank without overlapping", async () => {
  const elements = convertAltiumSchDocToCircuitJson(
    parseAltiumSchDoc(
      await readReferenceBytes("ti-tmds62levm-rev-b/23.SchDoc"),
    ),
  )
  const first = ownedByName(elements, "R173")
  const second = ownedByName(elements, "R174")
  const pitch = Math.abs(first.component.center.x - second.component.center.x)
  const ports = first.owned.filter((e) => e.type === "schematic_port")
  const symbolScale = Math.abs(ports[0]!.center.y - ports[1]!.center.y) / 0.6
  // The catalog box is 0.15996 wide and 0.39996 tall before scaling.
  expect(0.15996 * symbolScale).toBeLessThan(pitch)
  expect(first.component.symbol_name).toBe("boxresistor_up")
  const ref = first.owned.find(
    (e) => e.type === "schematic_text" && e.text === "R173",
  )
  if (ref?.type !== "schematic_text") throw new Error("Missing R173 label")
  expect(ref.position.y).toBeLessThan(
    first.component.center.y - (0.39996 * symbolScale) / 2,
  )
})
