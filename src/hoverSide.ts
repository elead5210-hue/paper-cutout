// FILE: src/hoverSide.ts
/**
 * Pure hit-testing helper for the "highlight hovered snap side" feature.
 *
 * Given a pointer position and an object's bounds (both in the same
 * coordinate space), work out which side of the object the pointer is
 * closest to, as long as the pointer is over the object or within a small
 * threshold outside it. No React, no DOM, no side effects.
 */

export type HoverSide = 'top' | 'right' | 'bottom' | 'left'

export interface HoverRect {
  x: number
  y: number
  width: number
  height: number
}

export interface HoverPoint {
  x: number
  y: number
}

/** How far outside an object's edge (in the same units as the rect) the pointer still counts as hovering it. */
export const DEFAULT_HOVER_THRESHOLD = 8

/** Tie-break order when the pointer is equally close to two sides (e.g. a corner or the exact centre). */
const SIDE_ORDER: ReadonlyArray<HoverSide> = ['top', 'left', 'right', 'bottom']

/**
 * Distance from the point to each side's edge line, measured perpendicular to that side.
 * Always non-negative for a point inside the rect; for a point outside it is the distance
 * to the (extended) edge line.
 */
export function sideDistances(point: HoverPoint, rect: HoverRect): Record<HoverSide, number> {
  return {
    top: Math.abs(point.y - rect.y),
    right: Math.abs(rect.x + rect.width - point.x),
    bottom: Math.abs(rect.y + rect.height - point.y),
    left: Math.abs(point.x - rect.x),
  }
}

/** True when the point lies inside the rect grown by `margin` on every side. */
export function isNearRect(point: HoverPoint, rect: HoverRect, margin = 0): boolean {
  return (
    point.x >= rect.x - margin &&
    point.x <= rect.x + rect.width + margin &&
    point.y >= rect.y - margin &&
    point.y <= rect.y + rect.height + margin
  )
}

/**
 * Return the side of `rect` that the pointer is nearest to, or null when the pointer is
 * not over the rect (nor within `threshold` of it), or when any input is not a finite number.
 *
 * Ties are broken in the order top, left, right, bottom so the result is stable.
 */
export function nearestSide(
  point: HoverPoint,
  rect: HoverRect,
  threshold: number = DEFAULT_HOVER_THRESHOLD,
): HoverSide | null {
  const values = [point.x, point.y, rect.x, rect.y, rect.width, rect.height, threshold]
  if (!values.every(Number.isFinite)) return null
  if (rect.width < 0 || rect.height < 0 || threshold < 0) return null
  if (!isNearRect(point, rect, threshold)) return null

  const distances = sideDistances(point, rect)
  let best: HoverSide = SIDE_ORDER[0]
  for (const side of SIDE_ORDER) {
    if (distances[side] < distances[best]) best = side
  }
  return best
}

/**
 * Among several candidate objects, find the one the pointer is hovering and its nearest side.
 * Later entries in `targets` are treated as drawn on top, so they win when objects overlap.
 */
export function hoveredTargetSide(
  point: HoverPoint,
  targets: ReadonlyArray<{ id: string; bounds: HoverRect }>,
  threshold: number = DEFAULT_HOVER_THRESHOLD,
): { id: string; side: HoverSide } | null {
  for (let i = targets.length - 1; i >= 0; i -= 1) {
    const side = nearestSide(point, targets[i].bounds, threshold)
    if (side) return { id: targets[i].id, side }
  }
  return null
}