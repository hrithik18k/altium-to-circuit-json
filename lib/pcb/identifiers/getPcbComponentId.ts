import type { PcbComponentId } from "./types"

export function getPcbComponentId(index: number): PcbComponentId {
  return `pcb_component_altium_${index}` as PcbComponentId
}
