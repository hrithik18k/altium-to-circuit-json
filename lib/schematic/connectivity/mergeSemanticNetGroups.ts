import type { SchematicPointKey } from "../geometry"
import { mergeSemanticNetGroup } from "./mergeSemanticNetGroup"
import type { MutableSemanticNet } from "./types"

export function mergeSemanticNetGroups(
  groupedByRoot: Map<SchematicPointKey, MutableSemanticNet>,
): MutableSemanticNet[] {
  const mergedGroups: MutableSemanticNet[] = []
  for (const group of groupedByRoot.values()) {
    if (group.records.size === 0) continue
    const normalizedNames = new Set(
      [...group.names].map((name) => name.trim().toUpperCase()),
    )
    const matches = mergedGroups.filter((candidate) =>
      [...candidate.names].some((name) =>
        normalizedNames.has(name.trim().toUpperCase()),
      ),
    )
    if (matches.length === 0 || normalizedNames.size === 0) {
      mergedGroups.push(group)
      continue
    }
    const target = matches[0]
    if (!target) continue
    mergeSemanticNetGroup(target, group)
    for (const duplicate of matches.slice(1)) {
      mergeSemanticNetGroup(target, duplicate)
      const duplicateIndex = mergedGroups.indexOf(duplicate)
      if (duplicateIndex >= 0) mergedGroups.splice(duplicateIndex, 1)
    }
  }
  return mergedGroups
}
