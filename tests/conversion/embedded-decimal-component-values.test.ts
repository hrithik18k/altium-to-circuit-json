import { expect, test } from "bun:test"
import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import type { BaseTscircuitUnit } from "format-si-unit"
import { convertAltiumToCircuitJson } from "../../lib"
import { parseFiniteComponentRating } from "../../lib/schematic/components/parseFiniteComponentRating"

test.each([
  { displayText: "2u2", componentUnit: "H", expected: 2.2e-6 },
  { displayText: "2u2H", componentUnit: "H", expected: 2.2e-6 },
  { displayText: "4n7", componentUnit: "F", expected: 4.7e-9 },
  { displayText: "1K2", componentUnit: "Ω", expected: 1200 },
  { displayText: "4R7", componentUnit: "Ω", expected: 4.7 },
  { displayText: "0R22", componentUnit: "Ω", expected: 0.22 },
  { displayText: "2.2uH", componentUnit: "H", expected: 2.2e-6 },
] satisfies Array<{
  displayText: string
  componentUnit: BaseTscircuitUnit
  expected: number
}>)(
  "parses embedded-decimal component value $displayText",
  ({ displayText, componentUnit, expected }) => {
    expect(
      parseFiniteComponentRating({ componentUnit, displayText }),
    ).toBeCloseTo(expected, 12)
  },
)

test("Arduino Uno L1 retains its label and converts 2u2 to 2.2 microhenries", async () => {
  const source = new Uint8Array(
    await readFile(resolve(import.meta.dir, "../fixtures/arduino-uno.SchDoc")),
  )
  const elements = convertAltiumToCircuitJson(source, {
    sourceType: "schematic",
    schematic: { documentName: "arduino-uno.SchDoc", sheetName: "Arduino Uno" },
  })
  const inductor = elements.find(
    (element) => element.type === "source_component" && element.name === "L1",
  )
  expect(inductor).toMatchObject({
    display_value: "2u2 / 2A",
    display_inductance: "2u2 / 2A",
    ftype: "simple_inductor",
  })
  expect(
    inductor?.type === "source_component" &&
      inductor.ftype === "simple_inductor"
      ? inductor.inductance
      : undefined,
  ).toBeCloseTo(2.2e-6, 12)
})
