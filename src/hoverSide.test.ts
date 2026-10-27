import { describe, expect, it } from 'vitest'
import {
  DEFAULT_HOVER_THRESHOLD,
  hoveredTargetSide,
  isNearRect,
  nearestSide,
  sideDistances,
  type HoverRect,
} from './hoverSide'

// A 100 x 60 rect with its top-left corner at (50, 40).
const rect: HoverRect = { x: 50, y: 40, width: 100, height: 60 }

describe('sideDistances', () => {
  it('measures the distance from a point to each side line', () => {
    expect(sideDistances({ x: 60, y: 50 }, rect)).toEqual({
      top: 10,
      right: 90,
      bottom: 50,
      left: 10,
    })
  })

  it('returns zero for the side the point sits on', () => {
    const d = sideDistances({ x: 50, y: 70 }, rect)
    expect(d.left).toBe(0)
  })
})

describe('isNearRect', () => {
  it('is true for points inside the rect and on its edges', () => {
    expect(isNearRect({ x: 100, y: 70 }, rect)).toBe(true)
    expect(isNearRect({ x: 50, y: 40 }, rect)).toBe(true)
    expect(isNearRect({ x: 150, y: 100 }, rect)).toBe(true)
  })

  it('is false just outside the rect when there is no margin', () => {
    expect(isNearRect({ x: 49, y: 70 }, rect)).toBe(false)
    expect(isNearRect({ x: 100, y: 101 }, rect)).toBe(false)
  })

  it('grows the rect by the margin on every side', () => {
    expect(isNearRect({ x: 45, y: 70 }, rect, 5)).toBe(true)
    expect(isNearRect({ x: 44, y: 70 }, rect, 5)).toBe(false)
    expect(isNearRect({ x: 100, y: 105 }, rect, 5)).toBe(true)
    expect(isNearRect({ x: 100, y: 106 }, rect, 5)).toBe(false)
  })
})

describe('nearestSide', () => {
  it('finds the top side', () => {
    expect(nearestSide({ x: 100, y: 45 }, rect)).toBe('top')
  })

  it('finds the bottom side', () => {
    expect(nearestSide({ x: 100, y: 95 }, rect)).toBe('bottom')
  })

  it('finds the left side', () => {
    expect(nearestSide({ x: 55, y: 70 }, rect)).toBe('left')
  })

  it('finds the right side', () => {
    expect(nearestSide({ x: 145, y: 70 }, rect)).toBe('right')
  })

  it('picks the nearer side near a corner', () => {
    // 3 from the top, 10 from the left.
    expect(nearestSide({ x: 60, y: 43 }, rect)).toBe('top')
    // 10 from the top, 3 from the left.
    expect(nearestSide({ x: 53, y: 50 }, rect)).toBe('left')
    // Bottom-right corner area.
    expect(nearestSide({ x: 147, y: 90 }, rect)).toBe('right')
    expect(nearestSide({ x: 140, y: 97 }, rect)).toBe('bottom')
  })

  it('breaks exact ties in the order top, left, right, bottom', () => {
    // Exactly on the top-left corner: top and left are both 0.
    expect(nearestSide({ x: 50, y: 40 }, rect)).toBe('top')
    // Exactly on the bottom-right corner: right and bottom are both 0.
    expect(nearestSide({ x: 150, y: 100 }, rect)).toBe('right')
    // Equidistant from left and right in a square.
    const square: HoverRect = { x: 0, y: 0, width: 20, height: 20 }
    expect(nearestSide({ x: 10, y: 10 }, square)).toBe('top')
  })

  it('returns a side for a point outside the rect but within the threshold', () => {
    expect(nearestSide({ x: 100, y: 40 - DEFAULT_HOVER_THRESHOLD }, rect)).toBe('top')
    expect(nearestSide({ x: 150 + DEFAULT_HOVER_THRESHOLD, y: 70 }, rect)).toBe('right')
  })

  it('returns null for a point beyond the threshold', () => {
    expect(nearestSide({ x: 100, y: 40 - DEFAULT_HOVER_THRESHOLD - 1 }, rect)).toBeNull()
    expect(nearestSide({ x: 0, y: 0 }, rect)).toBeNull()
  })

  it('respects a custom threshold', () => {
    expect(nearestSide({ x: 100, y: 35 }, rect, 4)).toBeNull()
    expect(nearestSide({ x: 100, y: 36 }, rect, 4)).toBe('top')
  })

  it('only counts points on or inside the rect when the threshold is zero', () => {
    expect(nearestSide({ x: 100, y: 39 }, rect, 0)).toBeNull()
    expect(nearestSide({ x: 100, y: 40 }, rect, 0)).toBe('top')
  })

  it('returns null for non-finite or invalid input', () => {
    expect(nearestSide({ x: NaN, y: 50 }, rect)).toBeNull()
    expect(nearestSide({ x: 60, y: Infinity }, rect)).toBeNull()
    expect(nearestSide({ x: 60, y: 50 }, { ...rect, width: NaN })).toBeNull()
    expect(nearestSide({ x: 60, y: 50 }, { ...rect, width: -1 })).toBeNull()
    expect(nearestSide({ x: 60, y: 50 }, rect, -1)).toBeNull()
  })
})

describe('hoveredTargetSide', () => {
  const a = { id: 'a', bounds: { x: 0, y: 0, width: 100, height: 100 } }
  const b = { id: 'b', bounds: { x: 200, y: 0, width: 50, height: 50 } }

  it('returns null when there are no targets', () => {
    expect(hoveredTargetSide({ x: 10, y: 10 }, [])).toBeNull()
  })

  it('returns null when the pointer is over no target', () => {
    expect(hoveredTargetSide({ x: 150, y: 150 }, [a, b])).toBeNull()
  })

  it('returns the hovered target and its nearest side', () => {
    expect(hoveredTargetSide({ x: 5, y: 50 }, [a, b])).toEqual({ id: 'a', side: 'left' })
    expect(hoveredTargetSide({ x: 225, y: 47 }, [a, b])).toEqual({ id: 'b', side: 'bottom' })
  })

  it('prefers the later (topmost) target when objects overlap', () => {
    const top = { id: 'top', bounds: { x: 50, y: 50, width: 100, height: 100 } }
    expect(hoveredTargetSide({ x: 60, y: 100 }, [a, top])).toEqual({ id: 'top', side: 'left' })
    expect(hoveredTargetSide({ x: 60, y: 100 }, [top, a])).toEqual({ id: 'a', side: 'right' })
  })

  it('uses the threshold so a pointer just outside an object still hovers it', () => {
    expect(hoveredTargetSide({ x: 104, y: 50 }, [a])).toEqual({ id: 'a', side: 'right' })
    expect(hoveredTargetSide({ x: 104, y: 50 }, [a], 2)).toBeNull()
  })
})