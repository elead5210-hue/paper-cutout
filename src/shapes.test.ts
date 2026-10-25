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
