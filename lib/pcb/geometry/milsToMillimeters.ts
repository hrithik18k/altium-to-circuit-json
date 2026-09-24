import { MILS_TO_MILLIMETERS } from "../model"

export function milsToMillimeters(mils: number): number {
  return mils * MILS_TO_MILLIMETERS
}
