import type { AltiumPcbDocument, AltiumTextRecord } from "altiumts"

export function isHiddenPcbComponentText({
  document,
  record,
}: {
  document: AltiumPcbDocument
  record: AltiumTextRecord
}): boolean {
  const component = document.getComponentForRecord(record)
  if (!component) return false

  return (
    (record.getBoolean("DESIGNATOR") === true &&
      component.getBoolean("NAMEON") === false) ||
    (record.getBoolean("COMMENT") === true &&
      component.getBoolean("COMMENTON") === false)
  )
}
