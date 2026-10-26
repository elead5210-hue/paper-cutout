// FILE: src/sideSnap.test.ts
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