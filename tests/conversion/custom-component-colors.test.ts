import { expect, test } from "bun:test"
import { parseAltiumSchDoc } from "altiumts"
import type {
  AnyCircuitElement,
  SchematicComponent,
  SchematicPath,
} from "circuit-json"
import { convertAltiumSchDocToCircuitJson } from "../../lib"
import { normalizeOwnedComponentElementColor } from "../../lib/schematic/components/normalizeOwnedComponentElementColor"
import { readReferenceBytes } from "../helpers/read-reference"

type SourceComponent = Extract<AnyCircuitElement, { type: "source_component" }>

test.each([
  ["transparent", "transparent"],
  ["#ffffff", "#ffffff"],
  ["#ffffb0", "#ffffc2"],
  ["#0000ff", "#840000"],
  [undefined, undefined],
] as const)("preserves fill semantics for %s", (fill, expected) => {
  const element = normalizeOwnedComponentElementColor({
    type: "schematic_path",
    schematic_path_id: "body",
    points: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ],
    stroke_color: "#0000ff",
    stroke_width: 0.01,
    fill_color: fill,
    is_filled: true,
    is_dashed: false,
  })
  expect(element).toMatchObject({
    fill_color: expected,
    is_filled: true,
    stroke_width: 0.01,
    points: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ],
  })
})

test("normalizes component colors without changing geometry or sheet artwork", () => {
  const records = [
    "|RECORD=31",
    "|RECORD=1|LibReference=CustomDevice|Designator=U1|CurrentPartId=1|Location.X=50|Location.Y=50",
    "|RECORD=2|OwnerIndex=1|OwnerPartId=1|Location.X=40|Location.Y=50|Name=IN|Designator=1|PinLength=10|Orientation=0",
    "|RECORD=2|OwnerIndex=1|OwnerPartId=1|Location.X=60|Location.Y=50|Name=OUT|Designator=2|PinLength=10|Orientation=2",
    "|RECORD=7|OwnerIndex=1|OwnerPartId=1|IsSolid=T|AreaColor=16711680|Color=16711680|LocationCount=3|X1=45|Y1=45|X2=55|Y2=50|X3=45|Y3=55",
    "|RECORD=6|OwnerIndex=1|OwnerPartId=1|Color=16711680|LocationCount=2|X1=55|Y1=45|X2=55|Y2=55",
    "|RECORD=8|OwnerIndex=1|OwnerPartId=1|Location.X=58|Location.Y=50|Radius=2|SecondaryRadius=2|IsSolid=T|AreaColor=16777215|Color=16711680",
    "|RECORD=14|OwnerIndex=1|OwnerPartId=1|Location.X=42|Location.Y=42|Corner.X=44|Corner.Y=44|IsSolid=F|Color=16711680",
    "|RECORD=4|OwnerIndex=1|OwnerPartId=1|Location.X=50|Location.Y=65|Text=BODY|Color=16711680",
    "|RECORD=6|Color=16711680|LocationCount=2|X1=0|Y1=0|X2=10|Y2=0",
    "|RECORD=4|Location.X=0|Location.Y=10|Text=SHEET|Color=16711680",
  ]
  const options = { centerOnSchematicSheet: false, schematicUnitScale: 1 }
  const elements = convertAltiumSchDocToCircuitJson(
    parseAltiumSchDoc(records.join("\n")),
    options,
  )
  const recolored = convertAltiumSchDocToCircuitJson(
    parseAltiumSchDoc(records.join("\n").replaceAll("16711680", "255")),
    options,
  )
  const owned = elements.filter(
    (element) =>
      "schematic_component_id" in element &&
      element.schematic_component_id === "schematic_component_altium_1",
  )
  expect(owned.length).toBeGreaterThan(5)
  expect(owned).toEqual(
    recolored.filter(
      (element) =>
        "schematic_component_id" in element &&
        element.schematic_component_id === "schematic_component_altium_1",
    ),
  )
  expect(
    owned.find(
      (element) => element.type === "schematic_path" && element.is_filled,
    ),
  ).toMatchObject({ stroke_color: "#840000", fill_color: "#840000" })
  expect(
    owned.find((element) => element.type === "schematic_circle"),
  ).toMatchObject({ color: "#840000", fill_color: "#ffffff", is_filled: true })
  expect(
    owned.find((element) => element.type === "schematic_rect"),
  ).toMatchObject({ color: "#840000", is_filled: false })
  expect(
    owned.find(
      (element) => element.type === "schematic_text" && element.text === "BODY",
    ),
  ).toMatchObject({ color: "#0f0f0f" })
  expect(
    elements.find(
      (element) =>
        element.type === "schematic_path" && !element.schematic_component_id,
    ),
  ).toMatchObject({ stroke_color: "#0000ff" })
  expect(
    elements.find(
      (element) =>
        element.type === "schematic_text" && element.text === "SHEET",
    ),
  ).toMatchObject({ color: "#0000ff" })
})

test.each([
  ["arduino-uno.SchDoc", ["C1", "C2"]],
  ["simplefoc-shield-v3.SchDoc", ["C6"]],
  ["ti-lm5155evm-fly.SchDoc", ["U3", "D4"]],
] as const)(
  "uses native outline colors for preserved symbols in %s",
  async (filename, names) => {
    const bytes =
      filename === "arduino-uno.SchDoc"
        ? new Uint8Array(
            await Bun.file(
              new URL(`../fixtures/${filename}`, import.meta.url),
            ).arrayBuffer(),
          )
        : await readReferenceBytes(filename)
    const elements = convertAltiumSchDocToCircuitJson(parseAltiumSchDoc(bytes))
    for (const name of names) {
      const source = elements.find(
        (element): element is SourceComponent =>
          element.type === "source_component" && element.name === name,
      )
      const component = elements.find(
        (element): element is SchematicComponent =>
          element.type === "schematic_component" &&
          element.source_component_id === source?.source_component_id,
      )
      expect(component).toMatchObject({ is_box_with_pins: false })
      const paths = elements.filter(
        (element): element is SchematicPath =>
          element.type === "schematic_path" &&
          element.schematic_component_id === component?.schematic_component_id,
      )
      expect(paths.length, name).toBeGreaterThanOrEqual(3)
      expect(
        paths.every((path) => path.stroke_color === "#840000"),
        name,
      ).toBe(true)
      expect(
        paths
          .filter((path) => path.is_filled)
          .every((path) => path.fill_color === "#840000"),
        name,
      ).toBe(true)
    }
  },
)
