import type { AltiumRecord } from "altiumts"
import { BOARD_GRAPHICS_COMPONENT_ID } from "../model"
import { getPcbComponentId } from "./getPcbComponentId"
import type { PcbComponentId } from "./types"

export function getPcbComponentIdForRecord(
  record: AltiumRecord,
): PcbComponentId | typeof BOARD_GRAPHICS_COMPONENT_ID {
  const componentIndex = record.getNumber("COMPONENT")
  return componentIndex === undefined || componentIndex < 0
    ? BOARD_GRAPHICS_COMPONENT_ID
    : getPcbComponentId(componentIndex)
}
