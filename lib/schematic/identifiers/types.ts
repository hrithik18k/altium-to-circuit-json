export type SchematicSegmentKey = string & {
  readonly __schematicSegmentKey: unique symbol
}
