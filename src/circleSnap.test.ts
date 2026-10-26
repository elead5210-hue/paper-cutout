```ts
// FILE: src/circleSnap.test.ts
import { describe, expect, it } from 'vitest'
import {
  CIRCLE_SNAP_ANGLES,
  CIRCLE_SNAP_STEP,
  angleDifference,
  nearestCircleSnapAngle,
  nearestSnapAngle,
  normalizeAngle,
  pointOnCircle,
  pointerAngle,
  snapCentreToAngle,
} from './circleSnap'

describe('CIRCLE_SNAP_ANGLES', () => {
  it('lists the eight fixed angles in 45 degree steps', () => {
    expect(CIRCLE_SNAP_STEP).toBe(45)
    expect(CIRCLE_SNAP_ANGLES).toEqual([0, 45, 90, 135, 180, 225, 270, 315])
  })

  it('has even steps that wrap from the last angle back to 0/360', () => {
    const last = CIRCLE_SNAP_ANGLES[CIRCLE_SNAP_ANGLES.length - 1]
    expect(360 - last).toBe(CIRCLE_SNAP_STEP)
  })
})

describe('normalizeAngle', () => {
  it('keeps angles in range unchanged', () => {
    expect(normalizeAngle(0)).toBe(0)
    expect(normalizeAngle(135)).toBe(135)
    expect(normalizeAngle(359.5)).toBe(359.5)
  })

  it('wraps 360 and above back to 0', () => {
    expect(normalizeAngle(360)).toBe(0)
    expect(normalizeAngle(405)).toBe(45)
    expect(normalizeAngle(720)).toBe(0)
  })

  it('wraps negative angles', () => {
    expect(normalizeAngle(-45)).toBe(315)
    expect(normalizeAngle(-360)).toBe(0)
  })

  it('returns NaN for non-finite input', () => {
    expect(normalizeAngle(NaN)).toBeNaN()
    expect(normalizeAngle(Infinity)).toBeNaN()
  })
})

describe('angleDifference', () => {
  it('measures the shortest way around', () => {
    expect(angleDifference(10, 20)).toBe(10)
    expect(angleDifference(350, 10)).toBe(20)
    expect(angleDifference(0, 180)).toBe(180)
    expect(angleDifference(315, 0)).toBe(45)
  })
})

describe('nearestSnapAngle', () => {
  it('returns each snap angle for itself', () => {
    for (const a of CIRCLE_SNAP_ANGLES) expect(nearestSnapAngle(a)).toBe(a)
  })

  it('picks the closest angle', () => {
    expect(nearestSnapAngle(20)).toBe(0)
    expect(nearestSnapAngle(30)).toBe(45)
    expect(nearestSnapAngle(100)).toBe(90)
    expect(nearestSnapAngle(170)).toBe(180)
    expect(nearestSnapAngle(260)).toBe(270)
  })

  it('wraps around near 0/360', () => {
    expect(nearestSnapAngle(350)).toBe(0)
    expect(nearestSnapAngle(359)).toBe(0)
    expect(nearestSnapAngle(10)).toBe(0)
    expect(nearestSnapAngle(338)).toBe(315)
    expect(nearestSnapAngle(-10)).toBe(0)
    expect(nearestSnapAngle(370)).toBe(0)
  })

  it('returns null for non-finite input', () => {
    expect(nearestSnapAngle(NaN)).toBeNull()
  })
})

describe('pointerAngle', () => {
  const c = { x: 100, y: 100 }

  it('uses 0 at the right and increases counter-clockwise on screen', () => {
    expect(pointerAngle({ x: 150, y: 100 }, c)).toBeCloseTo(0)
    expect(pointerAngle({ x: 100, y: 50 }, c)).toBeCloseTo(90)
    expect(pointerAngle({ x: 50, y: 100 }, c)).toBeCloseTo(180)
    expect(pointerAngle({ x: 100, y: 150 }, c)).toBeCloseTo(270)
  })

  it('handles diagonals', () => {
    expect(pointerAngle({ x: 150, y: 50 }, c)).toBeCloseTo(45)
    expect(pointerAngle({ x: 150, y: 150 }, c)).toBeCloseTo(315)
  })

  it('returns null on the centre or for invalid input', () => {
    expect(pointerAngle(c, c)).toBeNull()
    expect(pointerAngle({ x: NaN, y: 0 }, c)).toBeNull()
  })
})

describe('nearestCircleSnapAngle', () => {
  const c = { x: 0, y: 0 }

  it('snaps the pointer direction to the nearest fixed angle', () => {
    expect(nearestCircleSnapAngle({ x: 10, y: -1 }, c)).toBe(0)
    expect(nearestCircleSnapAngle({ x: 5, y: -6 }, c)).toBe(45)
    expect(nearestCircleSnapAngle({ x: -1, y: -10 }, c)).toBe(90)
    expect(nearestCircleSnapAngle({ x: -10, y: 1 }, c)).toBe(180)
  })

  it('wraps between 315 and 0 just below the x axis', () => {
    expect(nearestCircleSnapAngle({ x: 10, y: 1 }, c)).toBe(0)
    expect(nearestCircleSnapAngle({ x: 10, y: 8 }, c)).toBe(315)
    expect(nearestCircleSnapAngle({ x: 1, y: 10 }, c)).toBe(270)
  })

  it('returns null when the pointer is on the centre', () => {
    expect(nearestCircleSnapAngle(c, c)).toBeNull()
  })
})

describe('pointOnCircle', () => {
  const c = { x: 100, y: 100 }

  it('finds the outline point at each cardinal angle', () => {
    expect(pointOnCircle(c, 10, 0)).toEqual({ x: 110, y: 100 })
    expect(pointOnCircle(c, 10, 90)).toEqual({ x: 100, y: 90 })
    expect(pointOnCircle(c, 10, 180)).toEqual({ x: 90, y: 100 })
    expect(pointOnCircle(c, 10, 270)).toEqual({ x: 100, y: 110 })
  })

  it('treats 360 the same as 0', () => {
    expect(pointOnCircle(c, 10, 360)).toEqual(pointOnCircle(c, 10, 0))
  })

  it('returns null for invalid input', () => {
    expect(pointOnCircle(c, -1, 0)).toBeNull()
    expect(pointOnCircle(c, NaN, 0)).toBeNull()
    expect(pointOnCircle(c, 10, NaN)).toBeNull()
  })
})

describe('snapCentreToAngle', () => {
  const c = { x: 100, y: 100 }
  const size = { width: 20, height: 10 }

  it('places the new shape flush at the cardinal angles', () => {
    // Right: radius 10 plus half the width (10).
    expect(snapCentreToAngle(c, 10, size, 0)).toEqual({ x: 120, y: 100 })
    // Up: radius 10 plus half the height (5).
    expect(snapCentreToAngle(c, 10, size, 90)).toEqual({ x: 100, y: 85 })
    // Left.
    expect(snapCentreToAngle(c, 10, size, 180)).toEqual({ x: 80, y: 100 })
    // Down.
    expect(snapCentreToAngle(c, 10, size, 270)).toEqual({ x: 100, y: 115 })
  })

  it('pushes outward along the diagonal at 45 degrees', () => {
    const p = snapCentreToAngle(c, 10, { width: 10, height: 10 }, 45)!
    const distance = 10 + (Math.SQRT1_2 * 10 + Math.SQRT1_2 * 10) / 2
    expect(p.x).toBeCloseTo(100 + distance * Math.SQRT1_2)
    expect(p.y).toBeCloseTo(100 - distance * Math.SQRT1_2)
  })

  it('places opposite angles symmetrically about the circle centre', () => {
    for (const a of [45, 135]) {
      const p = snapCentreToAngle(c, 10, size, a)!
      const q = snapCentreToAngle(c, 10, size, a + 180)!
      expect(p.x + q.x).toBeCloseTo(200)
      expect(p.y + q.y).toBeCloseTo(200)
    }
  })

  it('places 0 and 360 at the same spot', () => {
    expect(snapCentreToAngle(c, 10, size, 360)).toEqual(snapCentreToAngle(c, 10, size, 0))
  })

  it('adds a gap along the outward direction', () => {
    expect(snapCentreToAngle(c, 10, size, 0, 5)).toEqual({ x: 125, y: 100 })
  })

  it('returns null for invalid input', () => {
    expect(snapCentreToAngle(c, -1, size, 0)).toBeNull()
    expect(snapCentreToAngle(c, 10, { width: -1, height: 5 }, 0)).toBeNull()
    expect(snapCentreToAngle(c, 10, size, NaN)).toBeNull()
    expect(snapCentreToAngle({ x: NaN, y: 0 }, 10, size, 0)).toBeNull()
  })
})
```