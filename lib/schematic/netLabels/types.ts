import type {
  AltiumSchLabelRecord,
  AltiumSchNetLabelRecord,
  AltiumSchPortRecord,
  AltiumSchPowerPortRecord,
} from "altiumts"

export type ElectricalLabelRecord =
  | AltiumSchLabelRecord
  | AltiumSchNetLabelRecord
  | AltiumSchPortRecord
  | AltiumSchPowerPortRecord
