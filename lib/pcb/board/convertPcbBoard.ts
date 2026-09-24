import type { PcbCutout } from "circuit-json"
import { toMillimeterPoint } from "../geometry"
import type { PcbConversionContext } from "../model"
import { BOARD_ID } from "../model"
import { createBoard } from "./createBoard"

export function convertPcbBoard(context: PcbConversionContext): void {
  if (context.options.includeBoardOutline === false) return
  context.elements.push(createBoard(context.document))
  for (const [
    index,
    cutout,
  ] of context.document.boardGeometry.cutouts.entries()) {
    if (cutout.outline.points.length < 3) continue
    context.elements.push({
      type: "pcb_cutout",
      pcb_cutout_id: `pcb_cutout_altium_${index}`,
      pcb_board_id: BOARD_ID,
      shape: "polygon",
      points: cutout.outline.points.map(toMillimeterPoint),
    } satisfies PcbCutout)
  }
}
