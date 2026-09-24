import type { AltiumRecord, AltiumSchDoc } from "altiumts"
import type { AnyCircuitElement } from "circuit-json"
import { convertComponents } from "../components"
import { buildSemanticNetGraph, convertConnectivity } from "../connectivity"
import type {
  ConvertedPort,
  SemanticSchematicConversion,
  SemanticSchematicOptions,
} from "../model"
import { convertNetLabels } from "../netLabels"

export function convertSemanticSchematic(
  document: AltiumSchDoc,
  options: SemanticSchematicOptions,
): SemanticSchematicConversion {
  const handledRecords = new Set<AltiumRecord>()
  const elements: AnyCircuitElement[] = []
  const convertedPorts: ConvertedPort[] = []

  convertComponents({
    convertedPorts,
    document,
    elements,
    handledRecords,
    options,
  })

  const semanticNetGraph = buildSemanticNetGraph(document, convertedPorts)
  const connectivity = convertConnectivity({
    convertedPorts,
    document,
    elements,
    handledRecords,
    semanticNetGraph,
    options,
  })
  convertNetLabels({
    connectivity,
    document,
    elements,
    handledRecords,
    semanticNetGraph,
    options,
  })

  return { elements, handledRecords }
}
