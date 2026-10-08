import { expect, test } from "bun:test"
import { parseAltiumSchDoc } from "altiumts"
import type { SchematicText } from "circuit-json"
import { convertAltiumSchDocToCircuitJson } from "../../lib"
import { getRectangle } from "../../lib/schematic/geometry"
import { estimateSchematicTextWidth } from "../../lib/schematic/text/estimateSchematicTextWidth"
import { wrapSchematicText } from "../../lib/schematic/text/wrapSchematicText"
import { TI_TMDS62LEVM_FIXTURE_NAME } from "../../scripts/references/reference-manifest"
import { readReferenceBytes } from "../helpers/read-reference"

test("keeps a URL token intact for fitting within its frame", () => {
  const url = `https://example.com/${"long-segment-".repeat(18)}`
  const lines = wrapSchematicText({
    text: url,
    maximumWidth: 120,
    fontSize: 10,
    fontFamily: "Arial",
  })
  expect(lines).toEqual([url])
})

test("fits the complete TI sheet 04 final FAQ URL on one row", async () => {
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
  const elements = convertAltiumSchDocToCircuitJson(document)
  const lines = elements.filter(
    (element): element is SchematicText =>
      element.type === "schematic_text" &&
      element.schematic_text_id.startsWith(
        `schematic_text_frame_line_altium_${frameIndex}_`,
      ),
  )

  const baseline = elements.find(
    (element): element is SchematicText =>
      element.type === "schematic_text" &&
      element.schematic_text_id === "schematic_text_frame_line_altium_46_1",
  )
  expect(lines).toHaveLength(1)
  expect(lines[0]?.text).toBe(frame.getDecoded("TEXT"))
  expect(baseline).toBeDefined()
  expect(lines[0]?.font_size).toBeLessThan(baseline?.font_size ?? 0)
  expect(
    estimateSchematicTextWidth({
      text: lines[0]?.text ?? "",
      fontSize: lines[0]?.font_size ?? 0,
      fontFamily,
    }),
  ).toBeLessThanOrEqual(
    ((rectangle.maxX - rectangle.minX) * (baseline?.font_size ?? 0)) / fontSize,
  )
})
