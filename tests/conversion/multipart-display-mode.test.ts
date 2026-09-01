import { expect, test } from "bun:test"
import { parseAltiumSchDoc } from "altiumts"
import type { AnyCircuitElement } from "circuit-json"
import { convertAltiumSchDocToCircuitJson } from "../../lib"
import { renderImportedSchematicToSvg } from "../helpers/render-imported-schematic"

const records = [
  "|RECORD=31|CUSTOMX=1000|CUSTOMY=1000|SIZE1=10|FONTNAME1=Arial",
]

function addComponent({
  currentPartId = 1,
  designator,
  displayMode = 0,
  index,
  partCount = 1,
  pins,
  value,
}: {
  currentPartId?: number
  designator: string
  displayMode?: number
  index: number
  partCount?: number
  pins: Array<{
    displayMode?: number
    name: string
    number: string
    orientation: 0 | 2
    x: number
    y: number
  }>
  value: string
}) {
  const ownerIndex = records.length
  records.push(
    `|RECORD=1|LibReference=${value}|PartCount=${partCount}|DisplayModeCount=2|IndexInSheet=${index}|OwnerPartId=-1|Location.X=500|Location.Y=500|DisplayMode=${displayMode}|CurrentPartId=${currentPartId}`,
    `|RECORD=34|OwnerIndex=${ownerIndex}|OwnerPartId=-1|Name=Designator|Text=${designator}`,
    `|RECORD=41|OwnerIndex=${ownerIndex}|OwnerPartId=-1|Name=Value|Text=${value}`,
    ...pins.map(
      (pin) =>
        `|RECORD=2|OwnerIndex=${ownerIndex}|OwnerPartId=${currentPartId}${pin.displayMode === undefined ? "" : `|OwnerPartDisplayMode=${pin.displayMode}`}|Location.X=${pin.x}|Location.Y=${pin.y}|Name=${pin.name}|Designator=${pin.number}|PinLength=10|Electrical=3|Orientation=${pin.orientation}|Hidden=False`,
    ),
  )
}

const u1dPins = Array.from({ length: 38 }, (_, pinIndex) => ({
  displayMode: 1,
  name: pinIndex < 16 ? `IO1-${pinIndex + 1}` : `IO3-${pinIndex - 15}`,
  number: `${pinIndex + 1}`,
  orientation: (pinIndex < 32 ? 2 : 0) as 0 | 2,
  x: pinIndex < 32 ? 420 : 580,
  y: 790 - (pinIndex % 32) * 10,
}))
const alternateModePins = Array.from({ length: 50 }, (_, pinIndex) => ({
  name: `ALT-${pinIndex + 1}`,
  number: `${100 + pinIndex}`,
  orientation: (pinIndex < 25 ? 2 : 0) as 0 | 2,
  x: pinIndex < 25 ? 390 : 610,
  y: 800 - (pinIndex % 25) * 10,
}))

addComponent({
  currentPartId: 4,
  designator: "U1",
  displayMode: 1,
  index: 1,
  partCount: 9,
  pins: [...u1dPins, ...alternateModePins],
  value: "XC6SLX45-FG484",
})
addComponent({
  currentPartId: 2,
  designator: "Q5",
  index: 2,
  partCount: 2,
  pins: [
    { name: "G", number: "5", orientation: 2, x: 720, y: 720 },
    { name: "D", number: "6", orientation: 0, x: 760, y: 730 },
  ],
  value: "PMGD370",
})
addComponent({
  designator: "R16",
  index: 3,
  pins: [
    { name: "1", number: "1", orientation: 2, x: 740, y: 860 },
    { name: "2", number: "2", orientation: 0, x: 780, y: 860 },
  ],
  value: "499",
})
addComponent({
  designator: "D5",
  index: 4,
  pins: [
    { name: "A", number: "1", orientation: 2, x: 740, y: 800 },
    { name: "K", number: "2", orientation: 0, x: 780, y: 800 },
  ],
  value: "GREEN LG1971",
})
addComponent({
  designator: "SW1",
  index: 5,
  pins: Array.from({ length: 6 }, (_, pinIndex) => ({
    name: pinIndex < 4 ? `${2 ** pinIndex}` : "COM",
    number: `${pinIndex + 1}`,
    orientation: 2 as const,
    x: 780,
    y: 620 - pinIndex * 12,
  })),
  value: "SWITCH-ROT16",
})
addComponent({
  designator: "U6",
  index: 6,
  pins: [
    { name: "EN", number: "1", orientation: 0, x: 820, y: 470 },
    { name: "GND", number: "2", orientation: 0, x: 820, y: 450 },
    { name: "OUT", number: "3", orientation: 2, x: 740, y: 470 },
    { name: "VCC", number: "4", orientation: 0, x: 820, y: 490 },
  ],
  value: "25MHz",
})
addComponent({
  designator: "C109",
  index: 7,
  pins: [
    { name: "1", number: "1", orientation: 2, x: 880, y: 480 },
    { name: "2", number: "2", orientation: 0, x: 920, y: 480 },
  ],
  value: "0.1uF",
})

test("multipart units use their active display mode and render the unit suffix", async () => {
  const circuitJson = convertAltiumSchDocToCircuitJson(
    parseAltiumSchDoc(records.join("\n")),
    { centerOnSchematicSheet: false, schematicUnitScale: 0.01 },
  )
  const u1Source = circuitJson.find(
    (
      element,
    ): element is Extract<AnyCircuitElement, { type: "source_component" }> =>
      element.type === "source_component" && element.name === "U1",
  )
  const u1d = circuitJson.find(
    (
      element,
    ): element is Extract<AnyCircuitElement, { type: "schematic_component" }> =>
      element.type === "schematic_component" &&
      element.source_component_id === u1Source?.source_component_id,
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
  await expect(
    renderImportedSchematicToSvg(
      circuitJson.filter((element) => element.type !== "schematic_sheet"),
      { height: 800, width: 800 },
    ),
  ).toMatchSvgSnapshot(import.meta.path)
})
