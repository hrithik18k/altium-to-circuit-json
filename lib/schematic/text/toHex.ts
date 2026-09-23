export function toHex(colorChannel: number): string {
  return colorChannel.toString(16).padStart(2, "0")
}
