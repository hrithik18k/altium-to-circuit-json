import type { AltiumRecord, AltiumSchComponentRecord } from "altiumts"
import type { SourceComponentDesignator } from "../model"
import { findOwnedDesignator } from "./findOwnedDesignator"
import { findOwnedParameterText } from "./findOwnedParameterText"
import type { ComponentConversionContext, ComponentIdentity } from "./types"

export function getComponentIdentity(
  {
    componentIndex,
    componentRecord,
    ownedRecords,
  }: {
    componentIndex: number
    componentRecord: AltiumSchComponentRecord
    ownedRecords: AltiumRecord[]
  },
  context: ComponentConversionContext,
): ComponentIdentity {
  const designator =
    findOwnedDesignator(ownedRecords) ??
    componentRecord.designator ??
    `U${componentIndex}`
  const displayText =
    findOwnedParameterText(ownedRecords, "Value")?.trim() ||
    findOwnedParameterText(ownedRecords, "Comment")?.trim() ||
    componentRecord.comment?.trim() ||
    componentRecord.designItemId?.trim() ||
    componentRecord.libraryReference?.trim() ||
    ""
  const libraryReference =
    componentRecord.libraryReference ??
    componentRecord.designItemId ??
    designator
  const manufacturerPartNumber = findOwnedParameterText(
    ownedRecords,
    "Mfr_part_number",
  )
  const normalizedDesignator = designator
    .trim()
    .toUpperCase() as SourceComponentDesignator
  const existingSourceComponentId =
    context.sourceComponentIdByDesignator.get(normalizedDesignator)
  const sourceComponentId =
    existingSourceComponentId ?? `source_component_altium_${componentIndex}`
  if (!existingSourceComponentId) {
    context.sourceComponentIdByDesignator.set(
      normalizedDesignator,
      sourceComponentId,
    )
  }

  return {
    designator,
    displayText,
    libraryReference,
    manufacturerPartNumber,
    schematicComponentId: `schematic_component_altium_${componentIndex}`,
    shouldCreateSourceComponent: !existingSourceComponentId,
    sourceComponentId,
  }
}
