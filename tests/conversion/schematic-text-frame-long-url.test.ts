import { expect, test } from "bun:test"
import { parseAltiumSchDoc } from "altiumts"
import type { SchematicText } from "circuit-json"
import { convertAltiumSchDocToCircuitJson } from "../../lib"
import { getRectangle } from "../../lib/schematic/geometry"
import { estimateSchematicTextWidth } from "../../lib/schematic/text/estimateSchematicTextWidth"
import { layoutSchematicTextFrame } from "../../lib/schematic/text/layoutSchematicTextFrame"
import { wrapSchematicText } from "../../lib/schematic/text/wrapSchematicText"
import { TI_TMDS62LEVM_FIXTURE_NAME } from "../../scripts/references/reference-manifest"
import { readReferenceBytes } from "../helpers/read-reference"

test("wraps a URL at readable break points without losing characters", () => {
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

test("fits an overlong URL within a two-line table row", () => {
  const url = `https://example.com/${"long-segment-".repeat(9)}`
  const layout = layoutSchematicTextFrame({
    text: url,
    maximumWidth: 680,
    maximumHeight: 36,
    fontSize: 18,
    fontFamily: "Courier New",
    wordWrap: true,
  })
  expect(layout.lines).toHaveLength(2)
  expect(layout.lines.join("")).toBe(url)
  expect(layout.fontSize).toBeGreaterThan(12)
  expect(layout.lines.length * layout.fontSize).toBeLessThanOrEqual(36)
})

test("does not split ordinary text in a narrow frame", () => {
  expect(
    layoutSchematicTextFrame({
      text: "Text",
      maximumWidth: 8,
      maximumHeight: 10,
      fontSize: 10,
      fontFamily: "Arial",
      wordWrap: true,
    }),
  ).toEqual({ lines: ["Text"], fontSize: 10 })
})

test("keeps every character of a long URL in a clipped one-line frame", () => {
  const url = `https://example.com/${"a".repeat(234)}`
  expect(url).toHaveLength(254)
  const elements = convertAltiumSchDocToCircuitJson(
    parseAltiumSchDoc(
      [
        "|RECORD=31|SIZE1=14|FONTNAME1=Arial",
        `|RECORD=28|LOCATION.X=0|LOCATION.Y=0|CORNER.X=80|CORNER.Y=10|FONTID=1|WORDWRAP=T|CLIPTORECT=T|TEXT=${url}`,
      ].join("\n"),
    ),
    { centerOnSchematicSheet: false, schematicUnitScale: 1 },
  )
  const lines = elements.filter(
    (element): element is SchematicText =>
      element.type === "schematic_text" &&
      element.schematic_text_id.startsWith("schematic_text_frame_line_"),
  )
  expect(lines.map((line) => line.text).join("")).toBe(url)
  expect(lines[0]?.font_size).toBeLessThan(14 * 0.7)
  expect(
    lines.reduce((height, line) => height + line.font_size, 0),
  ).toBeLessThanOrEqual(10)
  for (const line of lines) {
    expect(
      estimateSchematicTextWidth({
        text: line.text,
        fontSize: line.font_size,
        fontFamily: "Arial",
      }),
    ).toBeLessThanOrEqual(80)
  }
})

test("does not render a 14-unit line beyond a 10-unit clipped frame", () => {
  const elements = convertAltiumSchDocToCircuitJson(
    parseAltiumSchDoc(
      [
        "|RECORD=31|SIZE1=14|FONTNAME1=Arial",
        "|RECORD=28|LOCATION.X=0|LOCATION.Y=0|CORNER.X=100|CORNER.Y=10|FONTID=1|WORDWRAP=F|CLIPTORECT=T|TEXT=first~1second",
      ].join("\n"),
    ),
    { centerOnSchematicSheet: false, schematicUnitScale: 1 },
  )
  const lines = elements.filter(
    (element): element is SchematicText =>
      element.type === "schematic_text" &&
      element.schematic_text_id.startsWith("schematic_text_frame_line_"),
  )
  expect(lines.map((line) => line.text)).toEqual(["first"])
  expect(lines[0]?.font_size).toBeLessThanOrEqual(10)
})

test("keeps the complete TI sheet 04 final FAQ URL readable within its row", async () => {
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
  expect(lines).toHaveLength(2)
  expect(lines.map((line) => line.text).join("")).toBe(
    frame.getDecoded("TEXT") ?? "",
  )
  expect(baseline).toBeDefined()
  expect(lines[0]?.font_size).toBeGreaterThan(baseline?.font_size ?? 0)
  const scale = (lines[0]?.font_size ?? 0) / fontSize
  for (const line of lines) {
    expect(
      estimateSchematicTextWidth({
        text: line.text,
        fontSize: line.font_size,
        fontFamily,
      }),
    ).toBeLessThanOrEqual((rectangle.maxX - rectangle.minX) * scale)
  }
  expect(lines.length * fontSize).toBeLessThanOrEqual(
    rectangle.maxY - rectangle.minY,
  )
})
