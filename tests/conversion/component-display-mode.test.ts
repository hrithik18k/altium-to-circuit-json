import { expect, test } from "bun:test"
import { parseAltiumSchDoc } from "altiumts"
import { convertAltiumSchDocToCircuitJson } from "../../lib"
import { renderImportedSchematicToSvg } from "../helpers/render-imported-schematic"

test("uses the component's active Altium display mode", async () => {
  const document = parseAltiumSchDoc(
    [
      "|RECORD=31|CUSTOMX=100|CUSTOMY=100|SIZE1=10|FONTNAME1=Arial",
      "|RECORD=1|LibReference=DUAL_MODE|Designator=U1|PartCount=1|DisplayModeCount=2|DisplayMode=1|IndexInSheet=1|OwnerPartId=-1|Location.X=50|Location.Y=50|Orientation=0|CurrentPartId=1|AllPinCount=2",
      "|RECORD=2|OwnerIndex=1|OwnerPartId=1|Location.X=40|Location.Y=40|Name=DEFAULT|Designator=1|PinLength=10|Electrical=3|Orientation=2|Hidden=False",
      "|RECORD=2|OwnerIndex=1|OwnerPartId=1|OwnerPartDisplayMode=1|Location.X=40|Location.Y=60|Name=ALTERNATE|Designator=2|PinLength=10|Electrical=3|Orientation=2|Hidden=False",
    ].join("\n"),
  )

  const circuitJson = convertAltiumSchDocToCircuitJson(document, {
    centerOnSchematicSheet: false,
    schematicUnitScale: 0.1,
  })
  const ports = circuitJson.filter(
    (element) => element.type === "schematic_port",
  )

  expect(ports).toHaveLength(1)
  expect(ports[0]).toMatchObject({ display_pin_label: "ALTERNATE" })

  const schematicSvg = renderImportedSchematicToSvg(circuitJson)
  await expect(schematicSvg).toMatchSvgSnapshot(import.meta.path)
})
