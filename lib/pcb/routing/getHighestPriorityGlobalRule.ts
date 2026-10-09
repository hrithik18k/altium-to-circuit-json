import type { AltiumPcbDocument, AltiumRuleRecord } from "altiumts"
import { isAllScope } from "./isAllScope"

export function getHighestPriorityGlobalRule({
  document,
  ruleKind,
}: {
  document: AltiumPcbDocument
  ruleKind: string
}): AltiumRuleRecord | undefined {
  return document.rules
    .filter(
      (rule) =>
        rule.enabled !== false &&
        rule.ruleKind?.toUpperCase() === ruleKind.toUpperCase() &&
        isAllScope(rule.scope1Expression) &&
        isAllScope(rule.scope2Expression),
    )
    .sort(
      (firstRule, secondRule) =>
        (firstRule.priority ?? Number.MAX_SAFE_INTEGER) -
        (secondRule.priority ?? Number.MAX_SAFE_INTEGER),
    )[0]
}
