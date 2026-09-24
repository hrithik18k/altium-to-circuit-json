import type { ComponentClassification } from "./types"

export function classifyComponent({
  designator,
  libraryReference,
}: {
  designator: string
  libraryReference: string
}): ComponentClassification {
  const prefix = designator.match(/^[A-Z]+/iu)?.[0]?.toUpperCase() ?? ""
  const lowerReference = libraryReference.toLowerCase()
  if (prefix === "TP" || lowerReference.includes("testpoint")) {
    return "testpoint"
  }
  if (
    prefix === "Y" ||
    lowerReference.includes("crystal") ||
    /(?:^|[_-])cry(?:\d|[_-]|$)/iu.test(libraryReference)
  ) {
    return "crystal"
  }
  if (lowerReference.includes("mosfet")) return "mosfet"
  if (
    prefix === "FB" ||
    prefix === "FL" ||
    lowerReference.includes("ferrite") ||
    lowerReference.includes("emifilter_ind")
  ) {
    return "ferrite_bead"
  }
  if (prefix === "LED" || lowerReference.includes("led")) return "led"
  if (prefix === "R" || lowerReference.includes("resistor")) return "resistor"
  if (prefix === "C" || /(?:^|[_-])cap(?:[_-]|$)/iu.test(libraryReference)) {
    return "capacitor"
  }
  if (prefix === "L" || lowerReference.includes("inductor")) return "inductor"
  if (prefix === "D" || lowerReference.includes("diode")) return "diode"
  return "unknown"
}
