import type { AnyCircuitElement } from "circuit-json"

export function hasCompleteLedBody(elements: AnyCircuitElement[]): boolean {
  const paths = elements.filter((element) => element.type === "schematic_path")
  const triangles = paths.filter((path) => {
    const points = path.points.filter(
      (point, index, all) =>
        all.findIndex((other) => other.x === point.x && other.y === point.y) ===
        index,
    )
    const [a, b, c] = points
    if (!a || !b || !c) return false
    return (
      path.is_filled &&
      points.length === 3 &&
      Math.abs((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)) > 1e-10
    )
  })
  const segments = elements.flatMap((element) => {
    if (element.type === "schematic_line")
      return [
        [
          { x: element.x1, y: element.y1 },
          { x: element.x2, y: element.y2 },
        ],
      ]
    if (element.type !== "schematic_path" || element.is_filled) return []
    return element.points.slice(1).flatMap((point, index) => {
      const previous = element.points[index]
      return previous ? [[previous, point]] : []
    })
  })
  return triangles.some((triangle) => {
    const xs = triangle.points.map((point) => point.x)
    const ys = triangle.points.map((point) => point.y)
    const minX = Math.min(...xs),
      maxX = Math.max(...xs)
    const minY = Math.min(...ys),
      maxY = Math.max(...ys)
    const hasCathode = segments.some(
      ([a, b]) =>
        a &&
        b &&
        triangle.points.some((tip) => {
          const cross =
            (tip.x - a.x) * (b.y - a.y) - (tip.y - a.y) * (b.x - a.x)
          const dot =
            (tip.x - a.x) * (tip.x - b.x) + (tip.y - a.y) * (tip.y - b.y)
          const otherSides = triangle.points
            .filter((point) => point.x !== tip.x || point.y !== tip.y)
            .map(
              (point) =>
                (point.x - a.x) * (b.y - a.y) - (point.y - a.y) * (b.x - a.x),
            )
          return (
            Math.abs(cross) < 1e-8 &&
            dot < -1e-10 &&
            (otherSides.every((side) => side > 1e-10) ||
              otherSides.every((side) => side < -1e-10))
          )
        }),
    )
    const hasEmissionArrow = paths.some(
      (path) =>
        path !== triangle &&
        path.points.length >= 3 &&
        path.points.every(
          (point) =>
            point.x < minX ||
            point.x > maxX ||
            point.y < minY ||
            point.y > maxY,
        ),
    )
    return hasCathode && hasEmissionArrow
  })
}
