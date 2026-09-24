import { type AltiumRecord, AltiumSchDesignatorRecord } from "altiumts"

export function findOwnedDesignator(
  records: AltiumRecord[],
): string | undefined {
  return records.find(
    (record): record is AltiumSchDesignatorRecord =>
      record instanceof AltiumSchDesignatorRecord &&
      record.getDecoded("NAME")?.toLowerCase() === "designator",
  )?.text
}
