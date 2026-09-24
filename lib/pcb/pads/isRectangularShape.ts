export function isRectangularShape(shape: string): boolean {
  return shape.includes("RECT") || shape === "SQUARE"
}
