// Legacy board outlines often contain small gaps caused by coordinate rounding.
export const MAX_ENDPOINT_GAP_MILS = 5

// Edge-mounted pad centers can sit just outside the routed keepout contour.
export const MAX_PLACEMENT_OVERHANG_MILS = 100

// Avoid replacing a valid declared outline for a marginally smaller keepout.
export const MIN_STALE_OUTLINE_AREA_RATIO = 1.25
