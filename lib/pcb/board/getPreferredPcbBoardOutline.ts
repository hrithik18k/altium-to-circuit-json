import {
  type AltiumPcbDocument,
  type AltiumPoint,
  getAltiumBounds,
} from "altiumts"
import { MIN_STALE_OUTLINE_AREA_RATIO } from "./constants"
import { getBoundsArea } from "./getBoundsArea"
import { getTightestEnclosingKeepoutOutline } from "./getTightestEnclosingKeepoutOutline"

export function getPreferredPcbBoardOutline(
  document: AltiumPcbDocument,
): AltiumPoint[] {
  const declaredOutline = document.boardGeometry.outline.points
  const keepoutOutline = getTightestEnclosingKeepoutOutline(document)
  if (!keepoutOutline) return declaredOutline

  const declaredBounds = getAltiumBounds(declaredOutline)
  const keepoutBounds = getAltiumBounds(keepoutOutline)
  if (!keepoutBounds) return declaredOutline
  if (!declaredBounds || declaredOutline.length < 3) return keepoutOutline

  const declaredArea = getBoundsArea(declaredBounds)
  const keepoutArea = getBoundsArea(keepoutBounds)
  const declaredOutlineIsStale =
    declaredArea >= keepoutArea * MIN_STALE_OUTLINE_AREA_RATIO

  return declaredOutlineIsStale ? keepoutOutline : declaredOutline
}
