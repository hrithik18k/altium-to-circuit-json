import { expect, test } from "bun:test"
import { parseAltiumSchDoc } from "altiumts"
import { stackSvgsHorizontally } from "stack-svgs"
import { convertAltiumSchDocToCircuitJson } from "../../lib"
import { renderImportedSchematicToSvg } from "../helpers/render-imported-schematic"

const activeLeftPins = [
  ["E20", "IO1"],
  ["F22", "IO1"],
  ["D22", "IO1"],
  ["E22", "IO1"],
  ["D20", "IO1"],
  ["D21", "IO1"],
  ["C22", "IO1"],
  ["D19", "IO1"],
  ["C20", "IO1"],
  ["B22", "IO1"],
  ["C19", "IO1"],
  ["G7", "IO3"],
  ["F7", "IO3"],
  ["E6", "IO3"],
  ["H4", "IO3"],
  ["F5", "IO3"],
  ["E5", "IO3"],
  ["D5", "IO3"],
  ["E4", "IO3"],
  ["B3", "IO3"],
  ["B2", "IO3"],
  ["A2", "IO3"],
  ["C4", "IO3"],
  ["B1", "IO3"],
  ["D3", "IO3"],
  ["C3", "IO3"],
  ["D2", "IO3"],
  ["E3", "IO3"],
  ["G4", "IO3"],
  ["F3", "IO3"],
  ["G3", "IO3"],
  ["F2", "IO3"],
] as const

const activeRightPins = [
  ["N22", "LDC/IO1"],
  ["M4", "IO3"],
  ["N4", "IO3"],
  ["N3", "IO3"],
  ["P5", "IO3"],
  ["M3", "IO3"],
] as const

function createPinRecord({
  designator,
  displayMode,
  index,
  name,
  side,
  totalOnSide,
}: {
  designator: string
  displayMode: number
  index: number
  name: string
  side: "left" | "right"
  totalOnSide: number
}): string {
  const x = side === "left" ? 40 : 80
  const orientation = side === "left" ? 2 : 0
  const y = 30 + (totalOnSide - index) * 10
  return `|RECORD=2|OwnerIndex=1|OwnerPartId=4|OwnerPartDisplayMode=${displayMode}|Location.X=${x}|Location.Y=${y}|Name=${name}|Designator=${designator}|PinLength=10|Electrical=3|Orientation=${orientation}|Hidden=False`
}

function createDisplayModeDocument(displayMode: number) {
  const defaultLeftPins: Array<[string, string]> = Array.from(
    { length: 44 },
    (_, index) => [`L${index + 1}`, `IO3/D${43 - index}`],
  )
  const defaultRightPins: Array<[string, string]> = Array.from(
    { length: 44 },
    (_, index) => [`R${index + 1}`, "IO3"],
  )
  const pinRecords = [
    ...defaultLeftPins.map(([designator, name], index) =>
      createPinRecord({
        designator,
        displayMode: 0,
        index,
        name,
        side: "left",
        totalOnSide: defaultLeftPins.length,
      }),
    ),
    ...defaultRightPins.map(([designator, name], index) =>
      createPinRecord({
        designator,
        displayMode: 0,
        index,
        name,
        side: "right",
        totalOnSide: defaultRightPins.length,
      }),
    ),
    ...activeLeftPins.map(([designator, name], index) =>
      createPinRecord({
        designator,
        displayMode: 1,
        index,
        name,
        side: "left",
        totalOnSide: activeLeftPins.length,
      }),
    ),
    ...activeRightPins.map(([designator, name], index) =>
      createPinRecord({
        designator,
        displayMode: 1,
        index,
        name,
        side: "right",
        totalOnSide: activeRightPins.length,
      }),
    ),
  ]

  return parseAltiumSchDoc(
    [
      "|RECORD=31|CUSTOMX=140|CUSTOMY=500|SIZE1=10|FONTNAME1=Arial",
      `|RECORD=1|LibReference=XC6SLX45-FG484|Designator=U1D|PartCount=9|DisplayModeCount=2|DisplayMode=${displayMode}|IndexInSheet=1|OwnerPartId=-1|Location.X=60|Location.Y=250|Orientation=0|CurrentPartId=4|AllPinCount=${pinRecords.length}`,
      ...pinRecords,
    ].join("\n"),
  )
}

function convertDisplayMode(displayMode: number) {
  return convertAltiumSchDocToCircuitJson(
    createDisplayModeDocument(displayMode),
    {
      centerOnSchematicSheet: false,
      schematicUnitScale: 0.1,
    },
  )
}

test("uses the component's active Altium display mode", async () => {
  // Display mode zero reproduces the pin set selected by the converter before
  // this fix. The placed component selects display mode one.
  const beforeFixCircuitJson = convertDisplayMode(0)
  const fixedCircuitJson = convertDisplayMode(1)
  const beforeFixPorts = beforeFixCircuitJson.filter(
    (element) => element.type === "schematic_port",
  )
  const fixedPorts = fixedCircuitJson.filter(
    (element) => element.type === "schematic_port",
  )

  expect(beforeFixPorts).toHaveLength(88)
  expect(fixedPorts).toHaveLength(38)
  expect(fixedPorts.map((port) => port.display_pin_label)).toEqual([
    ...activeLeftPins.map(([, name]) => name),
    ...activeRightPins.map(([, name]) => name),
  ])

  const renderComponent = (circuitJson: typeof fixedCircuitJson) =>
    renderImportedSchematicToSvg(
      circuitJson.filter((element) => element.type !== "schematic_sheet"),
      { height: 900, width: 260 },
    )
  const comparisonSvg = stackSvgsHorizontally(
    [renderComponent(beforeFixCircuitJson), renderComponent(fixedCircuitJson)],
    {
      gap: 24,
      normalizeSize: true,
      rootAttributes: {
        "aria-label":
          "XC6SLX45-FG484 U1D before display-mode fix on the left and after the fix on the right",
        role: "img",
      },
      targetSize: 900,
    },
  )

  await expect(comparisonSvg).toMatchSvgSnapshot(import.meta.path)
})
