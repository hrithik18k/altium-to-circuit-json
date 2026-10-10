import type { AltiumRecord } from "altiumts"
import { getLocation, scalePoint } from "../geometry"
import type { ConvertedPort } from "../model"
import { convertSchematicRecord } from "../rendering/convertSchematicRecord"
import { convertSchematicArcToPath } from "../rendering/convertSchematicArcToPath"
import type { ComponentConversionContext } from "../components/types"

export function getCapacitorPositivePortId(
  { ports, records }: { ports: ConvertedPort[]; records: AltiumRecord[] },
  context: ComponentConversionContext,
): string | undefined {
  if (ports.length !== 2) return undefined
  const named = ports.find((port) =>
    /^(?:\+|pos|positive)$/i.test(port.sourcePort.name),
  )
  if (named) return named.sourcePort.source_port_id
  const marker = records.find(
    (record) =>
      record.recordKind === "4" &&
      !record.getBoolean("ISHIDDEN") &&
      record.getDecoded("TEXT")?.trim() === "+",
  )
  const location = marker && getLocation(marker)
  let point = location ? scalePoint(location, context.options.scale) : undefined
  let nearestIsPositive = true
  if (!point) {
    if (
      !records.some(
        (record) =>
          ["6", "13"].includes(record.recordKind ?? "") &&
          !record.getBoolean("ISHIDDEN"),
      )
    )
      return undefined
    const arc = records.find(
      (record) =>
        ["11", "12"].includes(record.recordKind ?? "") &&
        !record.getBoolean("ISHIDDEN"),
    )
    if (!arc) return undefined
    const elements = convertSchematicRecord(
      {
        record: arc,
        index: context.document.records.indexOf(arc),
        options: context.options,
      },
      {
        document: context.document,
        records: context.document.records,
        scale: context.options.scale,
        sheetRecord: context.sheetRecord,
      },
    )
    const curve = elements.flatMap((element) =>
      element.type === "schematic_arc"
        ? convertSchematicArcToPath(element).points
        : element.type === "schematic_path"
          ? element.points
          : [],
    )
    if (curve.length === 0) return undefined
    point = {
      x: curve.reduce((sum, p) => sum + p.x, 0) / curve.length,
      y: curve.reduce((sum, p) => sum + p.y, 0) / curve.length,
    }
    nearestIsPositive = false
  }
  const distances = ports.map((port) =>
    Math.hypot(
      port.schematicPort.center.x - point.x,
      port.schematicPort.center.y - point.y,
    ),
  )
  if (Math.abs(distances[0]! - distances[1]!) < 1e-8) return undefined
  const nearest = distances[0]! < distances[1]! ? 0 : 1
  return ports[nearestIsPositive ? nearest : 1 - nearest]?.sourcePort
    .source_port_id
}
