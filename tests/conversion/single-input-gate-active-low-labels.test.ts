import { expect, test } from "bun:test"
import { parseAltiumSchDoc } from "altiumts"
import { any_circuit_element } from "circuit-json"
import {
  applyToPoint,
  compose,
  rotateDEG,
  translate,
} from "transformation-matrix"
import { convertAltiumSchDocToCircuitJson } from "../../lib"
import { renderImportedSchematicToSvg } from "../helpers/render-imported-schematic"

test.each([0, 1, 2, 3])(
  "preserves primitive gate pin overbars (quarter turns=%s)",
  (turns) => {
    const localToSheet = compose(translate(100, 100), rotateDEG(turns * 90))
    const lines = (
      [
        [
          { x: 0, y: -20 },
          { x: 0, y: 20 },
        ],
        [
          { x: 0, y: 20 },
          { x: 40, y: 0 },
        ],
        [
          { x: 40, y: 0 },
          { x: 0, y: -20 },
        ],
      ] as const
    ).map(([start, end]) => {
      const first = applyToPoint(localToSheet, start)
      const last = applyToPoint(localToSheet, end)
      return `|RECORD=13|OWNERINDEX=1|OWNERPARTID=1|LOCATION.X=${first.x}|LOCATION.Y=${first.y}|CORNER.X=${last.x}|CORNER.Y=${last.y}`
    })
    const input = applyToPoint(localToSheet, { x: 0, y: 10 })
    const output = applyToPoint(localToSheet, { x: 40, y: 0 })
    const enable = applyToPoint(localToSheet, { x: 0, y: -10 })
    const terminal = applyToPoint(localToSheet, { x: -10, y: -10 })
    const wireEnd = applyToPoint(localToSheet, { x: -20, y: -10 })
    for (const [name, displayText, textParts] of [
      ["O\\E\\", "OE", [{ text: "OE", is_overlined: true }]],
      [String.raw`\OE`, "OE", [{ text: "OE", is_overlined: true }]],
      [
        String.raw`W\P\/IO2`,
        "WP/IO2",
        [{ text: "WP", is_overlined: true }, { text: "/IO2" }],
      ],
      ["ENABLE", "ENABLE", undefined],
    ] as const) {
      const source = [
        "|RECORD=31|CUSTOMX=200|CUSTOMY=200",
        "|RECORD=1|LIBREFERENCE=SingleInputGate|CURRENTPARTID=1",
        ...lines,
        `|RECORD=2|OWNERINDEX=1|OWNERPARTID=1|PINCONGLOMERATE=${24 + ((turns + 2) % 4)}|PINLENGTH=10|LOCATION.X=${input.x}|LOCATION.Y=${input.y}|NAME=A|DESIGNATOR=1`,
        `|RECORD=2|OWNERINDEX=1|OWNERPARTID=1|PINCONGLOMERATE=${24 + turns}|PINLENGTH=10|LOCATION.X=${output.x}|LOCATION.Y=${output.y}|NAME=Y|DESIGNATOR=2`,
        `|RECORD=2|OWNERINDEX=1|OWNERPARTID=1|PINCONGLOMERATE=${24 + ((turns + 2) % 4)}|PINLENGTH=10|LOCATION.X=${enable.x}|LOCATION.Y=${enable.y}|NAME=${name}|DESIGNATOR=3`,
        `|RECORD=27|LOCATIONCOUNT=2|X1=${terminal.x}|Y1=${terminal.y}|X2=${wireEnd.x}|Y2=${wireEnd.y}`,
      ].join("\n")
      const document = parseAltiumSchDoc(source)
      const options = { centerOnSchematicSheet: false, schematicUnitScale: 1 }
      const circuitJson = convertAltiumSchDocToCircuitJson(document, options)
      expect(
        circuitJson.find((element) => element.type === "schematic_component"),
      ).toMatchObject({ is_box_with_pins: false })
      const labels = circuitJson.filter(
        (element) => element.type === "schematic_text",
      )
      const enableLabels = labels.filter(
        (element) =>
          element.schematic_text_id === "schematic_pin_name_altium_7",
      )
      expect(enableLabels).toHaveLength(1)
      expect(enableLabels[0]?.text).toBe(displayText)
      expect(enableLabels[0]?.text_parts).toEqual(
        textParts ? [...textParts] : undefined,
      )
      expect(enableLabels[0]?.rotation).toBe(turns % 2 === 0 ? 0 : -90)
      expect(
        labels.find(
          (element) =>
            element.schematic_text_id === "schematic_pin_designator_altium_7",
        )?.text,
      ).toBe("3")
      expect(
        circuitJson.find(
          (element) =>
            element.type === "source_port" && element.pin_number === 3,
        ),
      ).toMatchObject({ name })
      const port = circuitJson.find(
        (element) =>
          element.type === "schematic_port" && element.pin_number === 3,
      )
      expect(port).toMatchObject({ center: terminal, is_connected: true })
      expect(port).not.toHaveProperty("display_pin_label")
      expect(port).not.toHaveProperty("display_pin_label_text_parts")
      expect(
        circuitJson.every(
          (element) => any_circuit_element.safeParse(element).success,
        ),
      ).toBe(true)

      const svg = renderImportedSchematicToSvg(circuitJson)
      if (textParts) {
        expect(svg).toContain(
          `<tspan text-decoration="overline">${textParts[0].text}</tspan>`,
        )
        expect(svg).not.toContain(name)
      } else expect(svg).not.toContain('text-decoration="overline"')
      if (name === String.raw`W\P\/IO2`)
        expect(svg).toContain("<tspan>/IO2</tspan>")

      for (const hidden of [false, true]) {
        const converted = convertAltiumSchDocToCircuitJson(
          hidden
            ? parseAltiumSchDoc(
                source.replace(
                  `|NAME=${name}|`,
                  `|ISHIDDEN=True|NAME=${name}|`,
                ),
              )
            : document,
          { ...options, ...(hidden ? {} : { includeText: false }) },
        )
        expect(
          converted.some(
            (element) =>
              element.type === "schematic_text" &&
              element.schematic_text_id === "schematic_pin_name_altium_7",
          ),
        ).toBe(false)
      }
      const withHidden = convertAltiumSchDocToCircuitJson(
        parseAltiumSchDoc(
          source.replace(`|NAME=${name}|`, `|ISHIDDEN=True|NAME=${name}|`),
        ),
        { ...options, includeHidden: true },
      )
      expect(
        withHidden.find(
          (element) =>
            element.type === "schematic_text" &&
            element.schematic_text_id === "schematic_pin_name_altium_7",
        ),
      ).toMatchObject({ text: displayText })
    }
  },
)
