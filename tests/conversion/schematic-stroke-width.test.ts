import { expect, test } from "bun:test"
import { parseAltiumSchDoc } from "altiumts"
import { convertAltiumSchDocToCircuitJson } from "../../lib"

test.each([
  [undefined, 1],
  [0, 1],
  [1, 1],
  [2, 3],
  [3, 5],
  [99, 1],
] as const)(
  "scales Altium line-width setting %s with primitive geometry",
  (width, units) => {
    const suffix = width === undefined ? "" : `|LINEWIDTH=${width}`
    const document = parseAltiumSchDoc(
      [
        "|RECORD=31",
        "|RECORD=13|LOCATION.X=10|LOCATION.Y=10|CORNER.X=20|CORNER.Y=20",
        "|RECORD=14|LOCATION.X=30|LOCATION.Y=10|CORNER.X=40|CORNER.Y=20",
        "|RECORD=8|LOCATION.X=50|LOCATION.Y=10|RADIUS=5",
        "|RECORD=8|LOCATION.X=60|LOCATION.Y=10|RADIUS=5|SECONDARYRADIUS=3",
        "|RECORD=12|LOCATION.X=70|LOCATION.Y=10|RADIUS=5|STARTANGLE=0|ENDANGLE=180",
        "|RECORD=6|LOCATIONCOUNT=2|X1=80|Y1=10|X2=90|Y2=20",
        "|RECORD=7|LOCATIONCOUNT=3|X1=100|Y1=10|X2=110|Y2=20|X3=100|Y3=20",
      ]
        .map((line, index) => (index === 0 ? line : line + suffix))
        .join("\n"),
    )
    for (const scale of [0.01, 0.1]) {
      const circuitJson = convertAltiumSchDocToCircuitJson(document, {
        schematicUnitScale: scale,
        centerOnSchematicSheet: false,
      })
      const primitives = circuitJson.filter(
        (element) =>
          "stroke_width" in element &&
          !(
            element.type === "schematic_rect" &&
            element.schematic_rect_id === "schematic_rect_altium_sheet_border"
          ),
      )
      expect(primitives).toHaveLength(7)
      for (const primitive of primitives) {
        expect(primitive).toHaveProperty("stroke_width", units * scale)
      }
    }
  },
)

test("custom component pins and bodies retain their relative stroke widths at small scales", () => {
  const document = parseAltiumSchDoc(
    [
      "|RECORD=31",
      "|RECORD=1|LibReference=Contact|Designator=J1|PartCount=1|CurrentPartId=1|Location.X=50|Location.Y=50",
      "|RECORD=8|OwnerIndex=1|OwnerPartId=1|Location.X=50|Location.Y=50|RADIUS=5|LINEWIDTH=1",
      "|RECORD=2|OwnerIndex=1|OwnerPartId=1|Location.X=35|Location.Y=50|Name=1|Designator=1|PinLength=10|Orientation=0",
    ].join("\n"),
  )
  for (const scale of [0.01, 0.1]) {
    const circuitJson = convertAltiumSchDocToCircuitJson(document, {
      schematicUnitScale: scale,
    })
    const body = circuitJson.find(
      (element) => element.type === "schematic_circle",
    )
    const pin = circuitJson.find(
      (element) =>
        element.type === "schematic_line" &&
        element.schematic_line_id.endsWith("_pin"),
    )
    expect(body).toHaveProperty("stroke_width", scale)
    expect(pin).toHaveProperty("stroke_width", scale)
  }
})
