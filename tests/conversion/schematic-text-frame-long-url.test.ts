import { expect, test } from "bun:test"
import { parseAltiumSchDoc } from "altiumts"
import type { SchematicText } from "circuit-json"
import { convertAltiumSchDocToCircuitJson } from "../../lib"
import { getRectangle } from "../../lib/schematic/geometry"
import { estimateSchematicTextWidth } from "../../lib/schematic/text/estimateSchematicTextWidth"
import { wrapSchematicText } from "../../lib/schematic/text/wrapSchematicText"
import { TI_TMDS62LEVM_FIXTURE_NAME } from "../../scripts/references/reference-manifest"
import { readReferenceBytes } from "../helpers/read-reference"

test("wraps a URL token without losing characters or exceeding the frame width", () => {
  const url = `https://example.com/${"long-segment-".repeat(18)}`
  const lines = wrapSchematicText({
    text: url,
    maximumWidth: 120,
    fontSize: 10,
    fontFamily: "Arial",
  })
  expect(lines.length).toBeGreaterThan(1)
  expect(lines.join("")).toBe(url)
  for (const line of lines) {
    expect(
      estimateSchematicTextWidth({
        text: line,
        fontSize: 10,
        fontFamily: "Arial",
      }),
    ).toBeLessThanOrEqual(120)
  }
})

test("keeps the TI sheet 04 final FAQ URL inside its text frame", async () => {
  const source = await readReferenceBytes(
    `${TI_TMDS62LEVM_FIXTURE_NAME}/04.SchDoc`,
  )
  const document = parseAltiumSchDoc(source)
  const frameIndex = document.records.findIndex(
    (record) =>
      record.recordKind === "28" &&
      record.getDecoded("TEXT")?.includes("1522815/faq-am62l"),
  )
  const frame = document.records[frameIndex]
  const rectangle = frame && getRectangle(frame)
  if (!frame || !rectangle) throw new Error("Missing sheet 04 FAQ frame")
  const sheet = document.records.find((record) => record.recordKind === "31")
  const fontId = frame.getCaseInsensitive("FONTID")
  const fontSize = Number(sheet?.getCaseInsensitive(`SIZE${fontId}`))
  const fontFamily = sheet?.getDecoded(`FONTNAME${fontId}`) ?? "Arial"
  const lines = convertAltiumSchDocToCircuitJson(document).filter(
    (element): element is SchematicText =>
      element.type === "schematic_text" &&
      element.schematic_text_id.startsWith(
        `schematic_text_frame_line_altium_${frameIndex}_`,
      ),
  )

  expect(lines.length).toBeGreaterThan(1)
  expect(lines.map((line) => line.text).join("")).toBe(
    frame.getDecoded("TEXT") ?? "",
  )
  for (const line of lines) {
    expect(
      estimateSchematicTextWidth({
        text: line.text,
        fontSize,
        fontFamily,
      }),
    ).toBeLessThanOrEqual(rectangle.maxX - rectangle.minX)
  }
})
