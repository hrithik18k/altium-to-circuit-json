import { expect, test } from "bun:test"
import { parseAltiumSchDoc } from "altiumts"
import { convertAltiumSchDocToCircuitJson } from "../../lib"
import { shouldRenderSchematicRecord } from "../../lib/schematic/sheet-layout"

for (const activeMode of [undefined, 0, 1, 2]) {
  test(`converts component display mode ${activeMode ?? "default"}`, () => {
    const document = parseAltiumSchDoc(
      [
        "|RECORD=31|CUSTOMX=200|CUSTOMY=200",
        `|RECORD=1|LIBREFERENCE=MultimodeIC|DESIGNATOR=U1|PARTCOUNT=2|CURRENTPARTID=2${activeMode === undefined ? "" : `|DISPLAYMODE=${activeMode}`}|LOCATION.X=100|LOCATION.Y=100`,
        ...[undefined, 0, 1, 2].flatMap((mode, index) => [
          `|RECORD=2|OWNERINDEX=1|OWNERPARTID=2${mode === undefined ? "" : `|OWNERPARTDISPLAYMODE=${mode}`}|LOCATION.X=80|LOCATION.Y=${40 + index * 20}|NAME=PIN_${mode ?? "DEFAULT"}|DESIGNATOR=${index + 1}|PINLENGTH=10|ELECTRICAL=3|ORIENTATION=2`,
          `|RECORD=4|OWNERINDEX=1|OWNERPARTID=2${mode === undefined ? "" : `|OWNERPARTDISPLAYMODE=${mode}`}|LOCATION.X=120|LOCATION.Y=${40 + index * 20}|TEXT=LABEL_${mode ?? "DEFAULT"}`,
        ]),
        `|RECORD=2|OWNERINDEX=1|OWNERPARTID=1|OWNERPARTDISPLAYMODE=${activeMode ?? 0}|LOCATION.X=80|LOCATION.Y=160|NAME=OTHER_PART|DESIGNATOR=5|PINLENGTH=10|ELECTRICAL=3|ORIENTATION=2`,
        "|RECORD=4|OWNERINDEX=1|OWNERPARTID=-1|LOCATION.X=120|LOCATION.Y=160|TEXT=COMMON_PART",
        "|RECORD=4|LOCATION.X=120|LOCATION.Y=180|TEXT=SHEET_LABEL",
      ].join("\n"),
    )
    const circuitJson = convertAltiumSchDocToCircuitJson(document)
    const pins = circuitJson.flatMap((element) =>
      element.type === "schematic_port" ? [element.display_pin_label] : [],
    )
    const labels = circuitJson.flatMap((element) =>
      element.type === "schematic_text" ? [element.text] : [],
    )
    const expectedModes =
      (activeMode ?? 0) === 0 ? ["DEFAULT", 0] : [activeMode]
    expect(pins).toEqual(expectedModes.map((mode) => `PIN_${mode}`))
    const visibleLabels = document.records
      .filter(
        (record) =>
          record.recordKind === "4" &&
          shouldRenderSchematicRecord(record, {
            document,
            records: document.records,
            scale: 1,
            sheetRecord: document.records[0],
          }),
      )
      .map((record) => record.getDecoded("TEXT"))
    expect(visibleLabels).toEqual([
      ...expectedModes.map((mode) => `LABEL_${mode}`),
      "COMMON_PART",
      "SHEET_LABEL",
    ])
    expect(labels).toContain("SHEET_LABEL")
  })
}
