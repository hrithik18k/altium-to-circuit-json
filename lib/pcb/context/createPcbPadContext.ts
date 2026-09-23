import {
  type AltiumComponentRecord,
  AltiumPadRecord,
  type AltiumPcbDocument,
  type AltiumRecord,
  getAltiumPcbPadGeometry,
} from "altiumts"
import type { LayerRef } from "circuit-json"
import { toMillimeterPoint } from "../geometry"
import { getPcbComponentId } from "../identifiers"
import { mapAltiumCopperLayer } from "../layers"
import type { ConvertAltiumPcbDocOptions, PcbPadContext } from "../model"

export function createPcbPadContext({
  document,
  options,
}: {
  document: AltiumPcbDocument
  options: ConvertAltiumPcbDocOptions
}): PcbPadContext {
  const elements: PcbPadContext["elements"] = []
  const componentIndexByRecord = new Map(
    document.components.map((component, index) => [component, index]),
  )

  if (options.includeComponents !== false) {
    for (const [index, component] of document.components.entries()) {
      if (!component.position) continue
      const name =
        component.designator?.trim() ||
        component.footprint?.trim() ||
        `Component ${index + 1}`
      elements.push({
        type: "source_component",
        ftype: "simple_chip",
        source_component_id: getSourceComponentId(index),
        name,
        display_name: name,
        ...(component.comment?.trim()
          ? { display_value: component.comment.trim() }
          : {}),
      })
    }
  }

  const padRefsByRecord = new Map<
    AltiumPadRecord,
    { pcb_component_id?: string; pcb_port_id: string }
  >()
  const sourcePortIdsByComponent = new Map<
    AltiumComponentRecord,
    Map<string, string>
  >()
  const sourcePortIdsByStandalonePad = new Map<AltiumPadRecord, string>()
  const sourcePortIdSetsByNet = new Map<AltiumRecord, Set<string>>()

  if (options.includePads !== false) {
    for (const [recordIndex, record] of document.records.entries()) {
      if (!(record instanceof AltiumPadRecord)) continue
      const padRecord = record
      const netIndex = padRecord.netIndex
      if (
        netIndex === undefined ||
        netIndex < 0 ||
        netIndex >= document.nets.length
      ) {
        continue
      }
      const net = document.nets[netIndex]
      if (!net) continue

      const position = padRecord.position
      const layers = getPadCopperLayers(padRecord)
      const geometry = getAltiumPcbPadGeometry({
        record: padRecord,
        useRequestedLayerGeometry: true,
      })
      if (!position || layers.length === 0 || !geometry) continue
      if (!geometry.plated && geometry.holeSizeMils > 0) continue

      const component = document.getComponentForRecord(padRecord)
      const componentIndex = component
        ? componentIndexByRecord.get(component)
        : undefined
      const hasSourceComponent =
        componentIndex !== undefined &&
        component?.position !== undefined &&
        options.includeComponents !== false
      const padName = padRecord.name?.trim() || `Pad ${recordIndex + 1}`
      const componentSourcePortIds = component
        ? (sourcePortIdsByComponent.get(component) ?? new Map<string, string>())
        : undefined
      let sourcePortId = componentSourcePortIds
        ? componentSourcePortIds.get(padName)
        : sourcePortIdsByStandalonePad.get(padRecord)
      if (!sourcePortId) {
        sourcePortId = `source_port_altium_pcb_${recordIndex}`
        if (component && componentSourcePortIds) {
          componentSourcePortIds.set(padName, sourcePortId)
          sourcePortIdsByComponent.set(component, componentSourcePortIds)
        } else {
          sourcePortIdsByStandalonePad.set(padRecord, sourcePortId)
        }
        const pinNumber = Number(padName)
        elements.push({
          type: "source_port",
          source_port_id: sourcePortId,
          name: padName,
          port_hints: [padName],
          ...(Number.isInteger(pinNumber) && pinNumber >= 0
            ? { pin_number: pinNumber }
            : {}),
          ...(hasSourceComponent
            ? { source_component_id: getSourceComponentId(componentIndex) }
            : {}),
        })
      }

      const pcbPortId = `pcb_port_altium_${recordIndex}`
      const pcbComponentId = hasSourceComponent
        ? getPcbComponentId(componentIndex)
        : undefined
      elements.push({
        type: "pcb_port",
        pcb_port_id: pcbPortId,
        source_port_id: sourcePortId,
        ...(pcbComponentId ? { pcb_component_id: pcbComponentId } : {}),
        ...toMillimeterPoint(position),
        layers,
      })
      padRefsByRecord.set(padRecord, {
        pcb_port_id: pcbPortId,
        ...(pcbComponentId ? { pcb_component_id: pcbComponentId } : {}),
      })

      const sourcePortIds = sourcePortIdSetsByNet.get(net) ?? new Set<string>()
      sourcePortIds.add(sourcePortId)
      sourcePortIdSetsByNet.set(net, sourcePortIds)
    }
  }

  return {
    elements,
    sourcePortIdsByNet: new Map(
      [...sourcePortIdSetsByNet].map(([net, ids]) => [net, [...ids]]),
    ),
    getPadRefs: (record) => padRefsByRecord.get(record) ?? {},
  }
}

function getSourceComponentId(index: number): string {
  return `source_component_altium_${index}`
}

function getPadCopperLayers(record: AltiumPadRecord): LayerRef[] {
  const holeDiameter = record.holeSizeMils ?? 0
  if (record.behavior === "through-hole" || holeDiameter > 0) {
    return record.plated === false ? [] : ["top", "bottom"]
  }
  const layer = mapAltiumCopperLayer(record.layer)
  return layer ? [layer] : []
}
