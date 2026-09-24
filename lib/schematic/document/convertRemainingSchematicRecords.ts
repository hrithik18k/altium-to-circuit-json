import { convertSchematicRecord } from "../rendering"
import { shouldRenderSchematicRecord } from "./shouldRenderSchematicRecord"
import type { SchematicConversionContext } from "./types"

export function convertRemainingSchematicRecords(
  context: SchematicConversionContext,
): void {
  for (const [recordIndex, record] of context.records.entries()) {
    if (context.handledRecords.has(record)) continue
    if (!shouldRenderSchematicRecord(record, context)) continue
    context.elements.push(
      ...convertSchematicRecord(
        { record, index: recordIndex, options: context.options },
        context,
      ),
    )
  }
}
