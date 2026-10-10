import { expect, test } from "bun:test"
import { parseAltiumSchDoc } from "altiumts"
import type { SchematicComponent, SchematicText } from "circuit-json"
import { convertAltiumSchDocToCircuitJson } from "../../lib"
import { readReferenceBytes } from "../helpers/read-reference"

function convertCapacitor({
  marker,
  includeBody = true,
  includeText = true,
  includeCurvedPlate = true,
}: {
  marker: string
  includeBody?: boolean
  includeText?: boolean
  includeCurvedPlate?: boolean
}) {
  return convertAltiumSchDocToCircuitJson(
    parseAltiumSchDoc(
      [
        "|RECORD=31",
        "|RECORD=1|LibReference=ManufacturerPart|Designator=C1|CurrentPartId=1|Location.X=50|Location.Y=50",
        "|RECORD=2|OwnerIndex=1|OwnerPartId=1|Location.X=50|Location.Y=60|Name=2|Designator=2|PinLength=10|Orientation=1",
        "|RECORD=2|OwnerIndex=1|OwnerPartId=1|Location.X=50|Location.Y=40|Name=1|Designator=1|PinLength=10|Orientation=3",
        ...(includeBody
          ? [
              "|RECORD=6|OwnerIndex=1|OwnerPartId=1|LocationCount=4|X1=50|Y1=60|X2=50|Y2=50|X3=60|Y3=50|X4=40|Y4=50",
              "|RECORD=6|OwnerIndex=1|OwnerPartId=1|LocationCount=2|X1=50|Y1=40|X2=50|Y2=46",
              ...(includeCurvedPlate
                ? [
                    "|RECORD=12|OwnerIndex=1|OwnerPartId=1|Location.X=50|Location.Y=30|Radius=16|StartAngle=50|EndAngle=130",
                  ]
                : []),
            ]
          : []),
        marker,
      ].join("\n"),
    ),
    { schematicUnitScale: 1, centerOnSchematicSheet: false, includeText },
  )
}

const plus =
  "|RECORD=4|OwnerIndex=1|OwnerPartId=1|Location.X=52|Location.Y=58|Text=+"

test.each([true, false])(
  "uses native polarized geometry without assuming pin 1 is positive with includeText=%s",
  (includeText) => {
    const elements = convertCapacitor({ marker: plus, includeText })
    const component = elements.find((e) => e.type === "schematic_component")
    expect(component?.symbol_name).toBe("capacitor_polarized_down")
    expect(elements.filter((e) => e.type === "schematic_path")).toHaveLength(0)
    const ports = elements.filter((e) => e.type === "schematic_port")
    expect(ports.find((p) => p.pin_number === 2)?.center).toEqual({
      x: 50,
      y: 50.3,
    })
    expect(ports.find((p) => p.pin_number === 1)?.center).toEqual({
      x: 50,
      y: 49.7,
    })
    expect(
      elements.some((e) => e.type === "schematic_text" && e.text === "+"),
    ).toBe(false)
  },
)

test.each([
  "",
  `${plus}|IsHidden=T`,
  plus.replace("OwnerPartId=1", "OwnerPartId=2"),
  `${plus.replace("RECORD=4", "RECORD=41")}|Name=Comment`,
])(
  "keeps the native capacitor without a curved plate or visible polarity mark: %s",
  (marker) => {
    const component = convertCapacitor({
      marker,
      includeCurvedPlate: false,
    }).find((e) => e.type === "schematic_component")
    expect(component?.symbol_name).toMatch(/^capacitor_(right|left|up|down)$/)
  },
)

test("keeps the native symbol when source body graphics are incomplete", () => {
  const component = convertCapacitor({ marker: plus, includeBody: false }).find(
    (e) => e.type === "schematic_component",
  )
  expect(component?.symbol_name).toBe("capacitor_polarized_down")
})

test("does not infer polarization from a curved plate alone", () => {
  const elements = convertCapacitor({ marker: "" })
  const component = elements.find((e) => e.type === "schematic_component")
  expect(component?.symbol_name).toBe("capacitor_up")
  expect(elements.some((e) => e.type === "schematic_path")).toBe(false)
})

test("uses a native polarized symbol for SimpleFOC Mini C3", async () => {
  const source = await readReferenceBytes("simplefocmini-2024-04-26.SchDoc")
  const elements = convertAltiumSchDocToCircuitJson(parseAltiumSchDoc(source))
  const component = elements.find(
    (e): e is SchematicComponent =>
      e.type === "schematic_component" &&
      e.source_component_id === "source_component_altium_95",
  )
  expect(component?.symbol_name).toBe("capacitor_polarized_down")
  const owned = elements.filter(
    (e) =>
      "schematic_component_id" in e &&
      e.schematic_component_id === "schematic_component_altium_95",
  )
  // Imported plates and the shape-drawn plus must not duplicate the native body.
  expect(owned.filter((e) => e.type === "schematic_path")).toHaveLength(0)
  expect(
    owned.filter((e) => e.type === "schematic_rect" && e.is_filled),
  ).toHaveLength(0)
  expect(owned.filter((e) => e.type === "schematic_port")).toHaveLength(2)
})

test("keeps SimpleFOC Shield C6 labels black with its native symbol", async () => {
  const source = await readReferenceBytes("simplefoc-shield-v3.SchDoc")
  const elements = convertAltiumSchDocToCircuitJson(parseAltiumSchDoc(source))
  const component = elements.find(
    (element): element is SchematicComponent =>
      element.type === "schematic_component" &&
      element.source_component_id === "source_component_altium_230",
  )
  expect(component?.symbol_name).toBe("capacitor_polarized_down")
  const labels = elements.filter(
    (element): element is SchematicText =>
      element.type === "schematic_text" &&
      element.schematic_text_id.startsWith(
        `${component?.schematic_component_id}_label_`,
      ) &&
      ["C6", "100uF"].includes(element.text),
  )
  expect(labels.map((label) => [label.text, label.color])).toEqual([
    ["C6", "#000000"],
    ["100uF", "#000000"],
  ])
})

test("conflicting visible polarity evidence keeps the source body instead of guessing", () => {
  const elements = convertCapacitor({
    marker: plus.replace("Location.Y=58", "Location.Y=42"),
  })
  const component = elements.find((e) => e.type === "schematic_component")
  expect(component?.symbol_name).toBeUndefined()
  expect(component?.is_box_with_pins).toBe(false)
  expect(elements.filter((e) => e.type === "schematic_path")).toHaveLength(3)
})

test("a distant plus annotation does not choose a polarized native terminal", () => {
  const elements = convertCapacitor({
    marker: plus.replace("Location.X=52", "Location.X=500"),
    includeCurvedPlate: false,
  })
  const component = elements.find((e) => e.type === "schematic_component")
  expect(
    component?.symbol_name?.startsWith("capacitor_polarized_") ?? false,
  ).toBe(false)
})
