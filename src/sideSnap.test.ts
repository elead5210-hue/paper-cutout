import { describe, expect, it } from 'vitest'
import {
  centreOf,
  facingSide,
  snapCentreToSide,
  snapToSide,
  type SideRect,
  type SideSize,
} from './sideSnap'

// An existing object at (100, 50), 80 wide and 40 tall.
const target: SideRect = { x: 100, y: 50, width: 80, height: 40 }
// A new shape 20 wide and 10 tall.
const size: SideSize = { width: 20, height: 10 }

describe('facingSide', () => {
  it('returns the opposite side', () => {
    expect(facingSide('top')).toBe('bottom')
    expect(facingSide('bottom')).toBe('top')
    expect(facingSide('left')).toBe('right')
    expect(facingSide('right')).toBe('left')
  })
})

describe('snapToSide flush placement', () => {
  it('places the new shape above the top side, centred', () => {
    expect(snapToSide(target, 'top', size)).toEqual({ x: 130, y: 40 })
  })

  it('places the new shape below the bottom side, centred', () => {
    expect(snapToSide(target, 'bottom', size)).toEqual({ x: 130, y: 90 })
  })

  it('places the new shape left of the left side, centred', () => {
    expect(snapToSide(target, 'left', size)).toEqual({ x: 80, y: 65 })
  })

  it('places the new shape right of the right side, centred', () => {
    expect(snapToSide(target, 'right', size)).toEqual({ x: 180, y: 65 })
  })

  it('returns null for invalid input', () => {
    expect(snapToSide({ ...target, width: Number.NaN }, 'top', size)).toBeNull()
    expect(snapToSide(target, 'top', { width: -1, height: 10 })).toBeNull()
  })
})

describe('centreOf and snapCentreToSide', () => {
  it('computes the centre of a rect from its top-left corner', () => {
    expect(centreOf({ x: 130, y: 40 }, size)).toEqual({ x: 140, y: 45 })
  })

  it('returns the centre of the snapped shape', () => {
    expect(snapCentreToSide(target, 'top', size)).toEqual({ x: 140, y: 45 })
  })

  it('returns null when the inputs are invalid', () => {
    expect(snapCentreToSide(target, 'top', { width: Number.NaN, height: 10 })).toBeNull()
  })
})