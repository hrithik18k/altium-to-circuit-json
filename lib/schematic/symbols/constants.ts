import type { SchSymbol } from "schematic-symbols"
import { symbols } from "schematic-symbols"
import type { CardinalDirection } from "../geometry"

export const CARDINAL_DIRECTIONS: readonly CardinalDirection[] = [
  "right",
  "up",
  "left",
  "down",
]

export const SYMBOL_CATALOG = symbols as Record<string, SchSymbol | undefined>

export const SYMBOL_NAMES = Object.keys(SYMBOL_CATALOG)
