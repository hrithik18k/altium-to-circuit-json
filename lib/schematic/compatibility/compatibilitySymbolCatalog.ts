// Independently defined IEC logic symbols. Source paths and colors are not
// inputs. These can be replaced by shared catalog symbols when available.
export const COMPATIBILITY_SYMBOL_CATALOG: Record<
  string,
  {
    legend: string
  }
> = {
  and: { legend: "&" },
  or: { legend: "≥1" },
  xor: { legend: "=1" },
}
