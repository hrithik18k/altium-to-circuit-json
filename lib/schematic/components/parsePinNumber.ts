export function parsePinNumber(pinDesignator: string): number | undefined {
  const parsed = Number(pinDesignator)
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : undefined
}
