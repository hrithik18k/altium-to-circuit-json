import { type AltiumPcbDocument, getAltiumBounds } from "altiumts"
import type { PcbBoard } from "circuit-json"
import { milsToMillimeters, toMillimeterPoint } from "../geometry"
import { BOARD_ID } from "../model"
import { getBoardLayerCount } from "./getBoardLayerCount"
import { getFallbackPcbBounds } from "./getFallbackPcbBounds"
import { getPreferredPcbBoardOutline } from "./getPreferredPcbBoardOutline"

export function createBoard(document: AltiumPcbDocument): PcbBoard {
  const altiumOutline = getPreferredPcbBoardOutline(document)
  const outline = altiumOutline.map(toMillimeterPoint)
  const bounds =
    getAltiumBounds(altiumOutline) ?? getFallbackPcbBounds(document.records)
  const width = Math.max(milsToMillimeters(bounds.maxX - bounds.minX), 0.1)
  const height = Math.max(milsToMillimeters(bounds.maxY - bounds.minY), 0.1)

  return {
    type: "pcb_board",
    pcb_board_id: BOARD_ID,
    center: {
      x: milsToMillimeters((bounds.minX + bounds.maxX) / 2),
      y: milsToMillimeters((bounds.minY + bounds.maxY) / 2),
    },
    width,
    height,
    ...(outline.length >= 3 ? { shape: "polygon" as const, outline } : {}),
    thickness: 1.6,
    num_layers: getBoardLayerCount(document),
    material: "fr4",
  }
}
