import { describe, expect, it } from 'vitest'
import { getShape, parseValues, regularPolygonPoints } from './shapes'

const build = (id: string, values: Record<string, number>) => getShape(id).build(values)

describe('geometry', () => {
  it('circle bounding box equals the diameter', () => {
    const d = build('circle', { diameter: 20 })
    expect([d.width, d.height]).toEqual([20, 20])
  })

  it('rectangle bounding box equals width and height', () => {
    const d = build('rectangle', { width: 30, height: 20 })
    expect([d.width, d.height]).toEqual([30, 20])
  })

  it('equilateral triangle has height side × √3 / 2', () => {
    const d = build('triangle', { side: 20 })
    expect(d.width).toBeCloseTo(20, 6)
    expect(d.height).toBeCloseTo((20 * Math.sqrt(3)) / 2, 6)
  })

  it('polygon has the requested number of vertices', () => {
    expect(regularPolygonPoints(7, 10)).toHaveLength(7)
  })

  it('even-sided polygon spans its diameter corner to corner', () => {
    const d = build('polygon', { sides: 6, diameter: 20 })
    expect(d.height).toBeCloseTo(20, 6)
  })
})

describe('validation', () => {
  const polygon = getShape('polygon')
  it('rejects empty input', () => {
    expect(parseValues(polygon, { sides: '', diameter: '20' }).ok).toBe(false)
  })
  it('rejects fractional sides', () => {
    expect(parseValues(polygon, { sides: '5.5', diameter: '20' }).ok).toBe(false)
  })
  it('rejects out-of-range values', () => {
    expect(parseValues(polygon, { sides: '2', diameter: '20' }).ok).toBe(false)
  })
  it('accepts valid values', () => {
    expect(parseValues(polygon, { sides: '6', diameter: '20' }).ok).toBe(true)
  })
})

describe('accessible labels', () => {
  const label = (id: string, values: Record<string, number>) => getShape(id).describe(values)

  it('describes each shape at its default size', () => {
    expect(label('circle', { diameter: 20 })).toBe('Circle, 20 millimetres diameter')
    expect(label('square', { side: 20 })).toBe('Square, 20 millimetres per side')
    expect(label('rectangle', { width: 30, height: 20 })).toBe('Rectangle, 30 by 20 millimetres')
    expect(label('triangle', { side: 20 })).toBe('Equilateral triangle, 20 millimetres per side')
    expect(label('polygon', { sides: 6, diameter: 20 })).toBe(
      'Regular polygon with 6 sides, 20 millimetres diameter'
    )
  })

  it('uses the singular unit for a value of 1', () => {
    expect(label('circle', { diameter: 1 })).toBe('Circle, 1 millimetre diameter')
    expect(label('rectangle', { width: 30, height: 1 })).toBe('Rectangle, 30 by 1 millimetre')
  })

  it('keeps decimal values as entered', () => {
    expect(label('square', { side: 12.5 })).toBe('Square, 12.5 millimetres per side')
  })

  it('changes when the values change', () => {
    expect(label('rectangle', { width: 30, height: 20 })).not.toBe(
      label('rectangle', { width: 50, height: 12 })
    )
    expect(label('polygon', { sides: 8, diameter: 40 })).toBe(
      'Regular polygon with 8 sides, 40 millimetres diameter'
    )
  })
})