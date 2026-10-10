import { expect, test } from "bun:test"
import { parseAltiumPcbDoc, parseAltiumSchDoc } from "altiumts"
import { any_circuit_element } from "circuit-json"
import {
  convertAltiumProjectToCircuitJson,
  convertAltiumSchDocToCircuitJson,
} from "../../lib"
import { renderImportedSchematicToSvg } from "../helpers/render-imported-schematic"

function resistorDocument({
  hidden = false,
  orientation = 1,
  labels = true,
} = {}) {
  return parseAltiumSchDoc(
    [
      "|RECORD=31|Size1=10|FontName1=Arial",
      "|RECORD=1|LibReference=RESISTOR|Designator=R1|Comment=10K|CurrentPartId=1",
      "|RECORD=2|OwnerIndex=1|OwnerPartId=1|Location.X=50|Location.Y=40|Name=1|Designator=1|PinLength=10|Orientation=3",
      "|RECORD=2|OwnerIndex=1|OwnerPartId=1|Location.X=50|Location.Y=60|Name=2|Designator=2|PinLength=10|Orientation=1",
      ...(labels
        ? [
            `|RECORD=34|OwnerIndex=1|OwnerPartId=1|Location.X=55|Location.Y=35|Text=R1|Orientation=${orientation}|IsHidden=${hidden ? "T" : "F"}|Color=16711680`,
            `|RECORD=41|OwnerIndex=1|OwnerPartId=1|Location.X=55|Location.Y=70|Name=Comment|Text=10K|Orientation=${orientation}|IsHidden=${hidden ? "T" : "F"}|Color=16711680`,
          ]
        : []),
    ].join("\n"),
  )
}

test.each([true, false])(
  "native passive labels render once with includeText=%s",
  (includeText) => {
    const circuitJson = convertAltiumSchDocToCircuitJson(resistorDocument(), {
      includeText,
      centerOnSchematicSheet: false,
      schematicUnitScale: 0.02,
    })
    const component = circuitJson.find((e) => e.type === "schematic_component")
    expect(component?.symbol_name).toMatch(/^boxresistor_/)
    expect(
      circuitJson.find((e) => e.type === "source_component"),
    ).toMatchObject({ name: "R1", display_name: "", resistance: 10000 })
    const labels = circuitJson.filter(
      (e) => e.type === "schematic_text" && ["R1", "10K"].includes(e.text),
    )
    expect(labels).toHaveLength(includeText ? 2 : 0)
    for (const label of labels) {
      expect(label).toMatchObject({
        color: "#000000",
        rotation: -90,
        schematic_sheet_id: component?.schematic_sheet_id,
      })
    }
    const svg = renderImportedSchematicToSvg(circuitJson)
    expect((svg.match(/>R1<\/text>/g) ?? []).length).toBe(includeText ? 1 : 0)
    expect((svg.match(/>10K<\/text>/g) ?? []).length).toBe(includeText ? 1 : 0)
    expect(svg.includes("Could not match ports")).toBe(false)
    expect(
      circuitJson.every((e) => any_circuit_element.safeParse(e).success),
    ).toBe(true)
  },
)

test.each([false, true])(
  "native passive labels respect hidden text with includeHidden=%s",
  (includeHidden) => {
    const circuitJson = convertAltiumSchDocToCircuitJson(
      resistorDocument({ hidden: true }),
      { includeHidden },
    )
    const svg = renderImportedSchematicToSvg(circuitJson)
    expect((svg.match(/>R1<\/text>/g) ?? []).length).toBe(includeHidden ? 1 : 0)
    expect((svg.match(/>10K<\/text>/g) ?? []).length).toBe(
      includeHidden ? 1 : 0,
    )
  },
)

test("native labels fall back to catalog positions only when source labels are absent", () => {
  const circuitJson = convertAltiumSchDocToCircuitJson(
    resistorDocument({ labels: false }),
  )
  const svg = renderImportedSchematicToSvg(circuitJson)
  expect(svg.match(/>R1<\/text>/g) ?? []).toHaveLength(1)
  expect(svg.match(/>10K<\/text>/g) ?? []).toHaveLength(1)
})

test("repeated passive placements keep separate labels and share their PCB identity", () => {
  const circuitJson = convertAltiumProjectToCircuitJson({
    schematics: [
      { document: resistorDocument() },
      { document: resistorDocument({ orientation: 0 }) },
    ],
    pcb: {
      document: parseAltiumPcbDoc(
        [
          "|RECORD=Board|KIND0=0|VX0=0mil|VY0=0mil|KIND1=0|VX1=500mil|VY1=0mil|KIND2=0|VX2=500mil|VY2=500mil|KIND3=0|VX3=0mil|VY3=500mil|KIND4=0|VX4=0mil|VY4=0mil",
          "|RECORD=Component|ID=0|LAYER=TOP|X=150mil|Y=150mil|SOURCEDESIGNATOR=R1",
          "|RECORD=Pad|NAME=1|COMPONENT=0|LAYER=TOP|X=100mil|Y=100mil|XSIZE=40mil|YSIZE=40mil|SHAPE=RECTANGLE",
        ].join("\n"),
      ),
    },
  })
  const sources = circuitJson.filter((e) => e.type === "source_component")
  expect(sources).toHaveLength(1)
  expect(sources[0]?.name).toBe("R1")
  const placements = circuitJson.filter(
    (e) => e.type === "schematic_component" || e.type === "pcb_component",
  )
  expect(placements).toHaveLength(3)
  expect(
    placements.every(
      (e) => e.source_component_id === sources[0]?.source_component_id,
    ),
  ).toBe(true)
  const labels = circuitJson
    .filter((e) => e.type === "schematic_text")
    .filter((e) => e.text === "R1")
  expect(labels).toHaveLength(2)
  expect(new Set(labels.map((e) => e.schematic_sheet_id)).size).toBe(2)
  expect(new Set(labels.map((e) => e.schematic_text_id)).size).toBe(2)
  expect(labels.map((e) => e.rotation).sort()).toEqual([-90, 0])
})
