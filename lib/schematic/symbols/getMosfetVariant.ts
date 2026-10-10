export function getMosfetVariant(libraryReference: string): {
  channel_type: "n" | "p"
  mosfet_mode: "depletion" | "enhancement"
} {
  const lowerReference = libraryReference.toLowerCase()
  const isPChannel =
    /(?:^|[_-])p(?:channel)?(?:[_-]|$)/iu.test(libraryReference) ||
    lowerReference.includes("pmos") ||
    lowerReference.includes("csd25")
  return {
    channel_type: isPChannel ? "p" : "n",
    mosfet_mode: lowerReference.includes("depletion")
      ? "depletion"
      : "enhancement",
  }
}
