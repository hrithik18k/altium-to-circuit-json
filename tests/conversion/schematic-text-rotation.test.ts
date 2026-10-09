import { expect, test } from "bun:test"
import { parseAltiumSchDoc, serializeAltiumSheetToSvg } from "altiumts"
import { convertAltiumSchDocToCircuitJson } from "../../lib"
import { renderImportedSchematicToSvg } from "../helpers/render-imported-schematic"

test.each([
  [0, 0, "bottom_left"],
  [1, -90, "bottom_left"],
  [2, 0, "bottom_right"],
  [3, -90, "bottom_right"],
] as const)(
  "schematic text orientation %s matches Altium's rendered direction",
  (orientation, rotation, anchor) => {
    const document = parseAltiumSchDoc(
      [
        "|RECORD=31",
        `|RECORD=4|Location.X=50|Location.Y=50|Text=ROTATED|Orientation=${orientation}`,
      ].join("\n"),
    )
    const elements = convertAltiumSchDocToCircuitJson(document)
    expect(
      elements.find((element) => element.type === "schematic_text"),
    ).toMatchObject({ rotation, anchor })
    const sourceSvg = serializeAltiumSheetToSvg(document)
    const convertedSvg = renderImportedSchematicToSvg(elements)
    expect(sourceSvg).toContain(`rotate(${rotation})`)
    expect(convertedSvg).toContain(`rotate(${rotation},`)
  },
)
