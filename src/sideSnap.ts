// FILE: src/sideSnap.ts
/**
 * Pure helper for the "click to snap to selected side" feature.
 *
 * Given the bounds of an existing object, the side of it that is highlighted,
 * and the size of the new shape, compute where the new shape's top-left corner
 * should go so that its facing side sits flush against the chosen side.
 * No React, no DOM, no side effects.
 *
 * All values are in one shared coordinate space (for example client px).
 */

import type { HoverSide } from './hoverSide'

export interface SideRect {
  x: number
  y: number
  width: number
  height: number
}

export interface SideSize {
  width: number
  height: number
}

export interface SidePoint {
  x: number
  y: number
}

/** How the new shape lines up along the side it is placed against. */
export type CrossAlign = 'center' | 'start' | 'end'

export interface SideSnapOptions {
  /** Alignment along the shared side. Defaults to 'center'. */
  align?: CrossAlign
  /** Gap left between the two shapes. Defaults to 0 (flush). */
  gap?: number
}

/** The side of the new shape that faces the chosen side of the existing object. */
export function facingSide(side: HoverSide): HoverSide {
  switch (side) {
    case 'top':
      return 'bottom'
    case 'bottom':
      return 'top'
    case 'left':
      return 'right'
    case 'right':
      return 'left'
  }
}

function alignOffset(available: number, size: number, align: CrossAlign): number {
  if (align === 'start') return 0
  if (align === 'end') return available - size
  return (available - size) / 2
}

/**
 * Top-left position for a new shape of `size` placed outside `target` against `side`.
 *
 * - 'top': the new shape sits above the target, its bottom edge on the target's top edge.
 * - 'bottom': below the target, its top edge on the target's bottom edge.
 * - 'left': left of the target, its right edge on the target's left edge.
 * - 'right': right of the target, its left edge on the target's right edge.
 *
 * Along the shared side the new shape is centred by default.
 * Returns null if any input is not a finite number or a size is negative.
 */
export function snapToSide(
  target: SideRect,
  side: HoverSide,
  size: SideSize,
  options: SideSnapOptions = {},
): SidePoint | null {
  const { align = 'center', gap = 0 } = options
  const values = [
    target.x,
    target.y,
    target.width,
    target.height,
    size.width,
    size.height,
    gap,
  ]
  if (!values.every(Number.isFinite)) return null
  if (target.width < 0 || target.height < 0 || size.width < 0 || size.height < 0) return null

  switch (side) {
    case 'top':
      return {
        x: target.x + alignOffset(target.width, size.width, align),
        y: target.y - size.height - gap,
      }
    case 'bottom':
      return {
        x: target.x + alignOffset(target.width, size.width, align),
        y: target.y + target.height + gap,
      }
    case 'left':
      return {
        x: target.x - size.width - gap,
        y: target.y + alignOffset(target.height, size.height, align),
      }
    case 'right':
      return {
        x: target.x + target.width + gap,
        y: target.y + alignOffset(target.height, size.height, align),
      }
  }
}

/** Centre point of a rect of `size` whose top-left corner is at `topLeft`. */
export function centreOf(topLeft: SidePoint, size: SideSize): SidePoint {
  return { x: topLeft.x + size.width / 2, y: topLeft.y + size.height / 2 }
}

/**
 * Convenience: the centre position of a new shape snapped against `side` of `target`,
 * or null if the inputs are invalid.
 */
export function snapCentreToSide(
  target: SideRect,
  side: HoverSide,
  size: SideSize,
  options: SideSnapOptions = {},
): SidePoint | null {
  const topLeft = snapToSide(target, side, size, options)
  return topLeft ? centreOf(topLeft, size) : null
}