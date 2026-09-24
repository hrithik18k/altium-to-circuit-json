import {
  type AltiumRecord,
  AltiumSchComponentRecord,
  type AltiumSchDoc,
} from "altiumts"
import type { AnyCircuitElement } from "circuit-json"
import type {
  ConvertedPort,
  SemanticSchematicOptions,
  SourceComponentDesignator,
} from "../model"
import { convertComponent } from "./convertComponent"

export function convertComponents({
  convertedPorts,
  document,
  elements,
  handledRecords,
  options,
}: {
  convertedPorts: ConvertedPort[]
  document: AltiumSchDoc
  elements: AnyCircuitElement[]
  handledRecords: Set<AltiumRecord>
  options: SemanticSchematicOptions
}): void {
  const sourceComponentIdByDesignator = new Map<
    SourceComponentDesignator,
    string
  >()
  for (const [componentIndex, componentRecord] of document.records.entries()) {
    if (!(componentRecord instanceof AltiumSchComponentRecord)) continue
    convertComponent(
      { componentIndex, componentRecord },
      {
        convertedPorts,
        document,
        elements,
        handledRecords,
        options,
        sourceComponentIdByDesignator,
      },
    )
  }
}
