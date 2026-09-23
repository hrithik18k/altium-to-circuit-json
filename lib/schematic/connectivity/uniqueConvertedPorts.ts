import type { ConvertedPort } from "../model"

export function uniqueConvertedPorts(ports: ConvertedPort[]): ConvertedPort[] {
  const seenSourcePortIds = new Set<string>()
  return ports.filter((port) => {
    const sourcePortId = port.sourcePort.source_port_id
    if (seenSourcePortIds.has(sourcePortId)) return false
    seenSourcePortIds.add(sourcePortId)
    return true
  })
}
