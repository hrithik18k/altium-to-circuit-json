export type PcbComponentId = string & {
  readonly __pcbComponentId: unique symbol
}
