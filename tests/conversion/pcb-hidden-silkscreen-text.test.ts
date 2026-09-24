import { expect, test } from "bun:test"
import { parseAltiumPcbDoc } from "altiumts"
import type { PcbSilkscreenText } from "circuit-json"
import { convertAltiumPcbDocToCircuitJson } from "../../lib"

test.each([
  { nameOn: "FALSE", commentOn: "FALSE", expected: [] },
  { nameOn: "TRUE", commentOn: "FALSE", expected: ["U1"] },
  { nameOn: "FALSE", commentOn: "TRUE", expected: ["PART-NUMBER"] },
  { nameOn: "", commentOn: "", expected: ["U1", "PART-NUMBER"] },
])(
  "respects NAMEON=$nameOn and COMMENTON=$commentOn",
  ({ nameOn, commentOn, expected }) => {
    const document = parseAltiumPcbDoc(
      [
        "|RECORD=Board|KIND0=0|VX0=0mil|VY0=0mil|KIND1=0|VX1=500mil|VY1=0mil|KIND2=0|VX2=500mil|VY2=500mil|KIND3=0|VX3=0mil|VY3=500mil|KIND4=0|VX4=0mil|VY4=0mil",
        `|RECORD=Component|ID=0|LAYER=TOP|X=0mil|Y=0mil|NAMEON=${nameOn}|COMMENTON=${commentOn}|SOURCEDESIGNATOR=U1`,
        "|RECORD=Text|COMPONENT=0|LAYER=TOPOVERLAY|X=100mil|Y=100mil|HEIGHT=30mil|WIDESTRING=U1|DESIGNATOR=TRUE|COMMENT=FALSE",
        "|RECORD=Text|COMPONENT=0|LAYER=TOPOVERLAY|X=100mil|Y=150mil|HEIGHT=30mil|WIDESTRING=PART-NUMBER|DESIGNATOR=FALSE|COMMENT=TRUE",
        "|RECORD=Text|COMPONENT=0|LAYER=TOPOVERLAY|X=100mil|Y=200mil|HEIGHT=30mil|WIDESTRING=PIN-1|DESIGNATOR=FALSE|COMMENT=FALSE",
        "|RECORD=Component|ID=1|LAYER=TOP|X=300mil|Y=300mil|NAMEON=TRUE|COMMENTON=TRUE|SOURCEDESIGNATOR=U2",
        "|RECORD=Text|COMPONENT=1|LAYER=TOPOVERLAY|X=300mil|Y=300mil|HEIGHT=30mil|WIDESTRING=U2|DESIGNATOR=TRUE|COMMENT=FALSE",
        "|RECORD=Text|COMPONENT=1|LAYER=TOPOVERLAY|X=300mil|Y=350mil|HEIGHT=30mil|WIDESTRING=VISIBLE-PART|DESIGNATOR=FALSE|COMMENT=TRUE",
      ].join("\n"),
    )

    const silkscreenTexts = convertAltiumPcbDocToCircuitJson(document).filter(
      (element): element is PcbSilkscreenText =>
        element.type === "pcb_silkscreen_text",
    )

    expect(silkscreenTexts.map(({ text }) => text)).toEqual([
      ...expected,
      "PIN-1",
      "U2",
      "VISIBLE-PART",
    ])
  },
)

test("preserves bottom silkscreen with unspecified visibility or no component", () => {
  const document = parseAltiumPcbDoc(
    [
      "|RECORD=Board",
      "|RECORD=Component|ID=0|LAYER=BOTTOM|X=0mil|Y=0mil|SOURCEDESIGNATOR=U1",
      "|RECORD=Text|COMPONENT=0|LAYER=BOTTOMOVERLAY|X=100mil|Y=100mil|HEIGHT=30mil|TEXT=U1|DESIGNATOR=TRUE",
      "|RECORD=Text|COMPONENT=0|LAYER=BOTTOMOVERLAY|X=100mil|Y=150mil|HEIGHT=30mil|TEXT=PART-NUMBER|COMMENT=TRUE",
      "|RECORD=Text|LAYER=BOTTOMOVERLAY|X=100mil|Y=200mil|HEIGHT=30mil|TEXT=BOARD-LABEL|DESIGNATOR=TRUE",
      "|RECORD=Component|ID=1|LAYER=BOTTOM|X=300mil|Y=300mil|NAMEON=FALSE|COMMENTON=FALSE|SOURCEDESIGNATOR=U2",
      "|RECORD=Text|COMPONENT=1|LAYER=BOTTOMOVERLAY|X=300mil|Y=300mil|HEIGHT=30mil|TEXT=U2|DESIGNATOR=TRUE",
      "|RECORD=Text|COMPONENT=1|LAYER=BOTTOMOVERLAY|X=300mil|Y=350mil|HEIGHT=30mil|TEXT=HIDDEN-PART|COMMENT=TRUE",
    ].join("\n"),
  )

  const silkscreenTexts = convertAltiumPcbDocToCircuitJson(document).filter(
    (element): element is PcbSilkscreenText =>
      element.type === "pcb_silkscreen_text",
  )

  expect(silkscreenTexts.map(({ text, layer }) => ({ text, layer }))).toEqual([
    { text: "U1", layer: "bottom" },
    { text: "PART-NUMBER", layer: "bottom" },
    { text: "BOARD-LABEL", layer: "bottom" },
  ])
})
