import type { AltiumPcbDocument, AltiumTextRecord } from "altiumts"
import type { PcbFabricationNoteText } from "circuit-json"
import { milsToMillimeters, toMillimeterPoint } from "../geometry"
import { getPcbComponentId } from "../identifiers"
import { FABRICATION_NOTE_COLOR } from "../model"
import { mapFabricationTextAnchor } from "./mapFabricationTextAnchor"

export function convertPcbMechanicalText({
  document,
  record,
  recordIndex,
}: {
  document: AltiumPcbDocument
  record: AltiumTextRecord
  recordIndex: number
}): PcbFabricationNoteText | undefined {
  const componentIndex = record.componentIndex
  const component = document.getComponentForRecord(record)
  if (
    !record.position ||
    componentIndex === undefined ||
    !component ||
    !record.text
  ) {
    return undefined
  }

  const normalizedText = record.text.trim().toUpperCase()
  const isDesignator = normalizedText === ".DESIGNATOR"
  const isComment = normalizedText === ".COMMENT"
  if (isDesignator && component.getBoolean("NAMEON") === false) return undefined
  if (isComment && component.getBoolean("COMMENTON") === false) return undefined

  const text = isDesignator
    ? component.designator
    : isComment
      ? component.comment
      : record.text
  if (!text) return undefined

  return {
    type: "pcb_fabrication_note_text",
    pcb_fabrication_note_text_id: `pcb_fabrication_note_text_altium_${recordIndex}`,
    pcb_component_id: getPcbComponentId(componentIndex),
    text,
    font: "tscircuit2024",
    font_size: milsToMillimeters(record.heightMils ?? 30),
    anchor_position: toMillimeterPoint(record.position),
    anchor_alignment: mapFabricationTextAnchor(record.justification),
    ccw_rotation: record.rotation,
    layer: component.side === "bottom" ? "bottom" : "top",
    color: FABRICATION_NOTE_COLOR,
  }
}
