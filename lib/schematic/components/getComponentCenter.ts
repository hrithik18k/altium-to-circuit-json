import {
  type Bounds,
  getBoundsCenter,
  getBoundsForPoints,
  getLocation,
  scalePoint,
} from "../geometry"
import type { ConvertedPort, SymbolSelection } from "../model"

export function getComponentCenter({
  bodyBounds,
  ports,
  scale,
  selection,
}: {
  bodyBounds: Bounds
  ports: ConvertedPort[]
  scale: number
  selection: SymbolSelection | undefined
}) {
  // Polarity decorations (including filled rectangles forming a plus) must
  // not move the native body away from the two terminal roots.
  const bounds =
    selection &&
    /^(boxresistor|capacitor)_/.test(selection.name) &&
    ports.length === 2
      ? getBoundsForPoints(
          ports.map((port) => getLocation(port.record) ?? port.point),
        )
      : bodyBounds
  return scalePoint(getBoundsCenter(bounds), scale)
}
