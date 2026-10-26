import { describe, expect, it } from 'vitest'
import {
  createComponent,
  findComponent,
  findComponentByPlacedId,
  nextDefaultName,
  resolveChildRect,
  snapTargetsFor,
  type Component,
} from './component'
import { defaultRaw, getShape } from './shapes'
import type { Rect } from './snapping'

describe('createComponent', () => {
  it('names the first component "Component 1"', () => {
    const component = createComponent('circle', [])
    expect(component.name).toBe('Component 1')
  })

  it('increments the default name for each further component', () => {
    const list: Component[] = []
    for (let i = 0; i < 3; i += 1) list.push(createComponent('square', list))
    expect(list.map((c) => c.name)).toEqual(['Component 1', 'Component 2', 'Component 3'])
  })

  it('gives every component and every contained shape a unique id', () => {
    const list: Component[] = []
    for (let i = 0; i < 4; i += 1) list.push(createComponent('circle', list))
    expect(new Set(list.map((c) => c.id)).size).toBe(4)
    expect(new Set(list.map((c) => c.shape.id)).size).toBe(4)
  })

  it('never reuses a name after a component has been removed from the middle', () => {
    const a = createComponent('circle', [])
    const b = createComponent('square', [a])
    const c = createComponent('triangle', [a, b])
    expect(c.name).toBe('Component 3')

    // Remove the second component: the next name continues after the highest.
    const next = createComponent('polygon', [a, c])
    expect(next.name).toBe('Component 4')
  })

  it('ignores names that are not in the default format', () => {
    const renamed: Component = { ...createComponent('circle', []), name: 'Wheel' }
    expect(nextDefaultName([renamed])).toBe('Component 1')
  })

  it('wraps a shape of the requested type at its default values', () => {
    const component = createComponent('rectangle', [])
    expect(component.shape.shapeId).toBe('rectangle')
    expect(component.shape.raw).toEqual(defaultRaw(getShape('rectangle')))
  })

  it('gives each component its own copy of the values', () => {
    const first = createComponent('circle', [])
    const second = createComponent('circle', [first])
    expect(second.shape.raw).toEqual(first.shape.raw)
    expect(second.shape.raw).not.toBe(first.shape.raw)
  })
})

describe('findComponent', () => {
  it('finds a component by its id', () => {
    const a = createComponent('circle', [])
    const b = createComponent('square', [a])
    expect(findComponent([a, b], b.id)).toBe(b)
  })

  it('returns undefined when no component has the id', () => {
    const a = createComponent('circle', [])
    expect(findComponent([a], 'missing')).toBeUndefined()
  })
})

describe('findComponentByPlacedId', () => {
  it('finds the component whose placed shape has the id', () => {
    const a = createComponent('circle', [])
    const b = createComponent('square', [a])
    expect(findComponentByPlacedId([a, b], b.shape.id)).toBe(b)
  })

  it('returns undefined when no placed shape has the id', () => {
    const a = createComponent('circle', [])
    expect(findComponentByPlacedId([a], 'missing')).toBeUndefined()
  })
})

describe('resolveChildRect', () => {
  const relative: Rect = { x: 5, y: 7, width: 10, height: 20 }

  it('returns the rect unchanged when there is no parent', () => {
    expect(resolveChildRect(relative, null)).toEqual(relative)
    expect(resolveChildRect(relative, undefined)).toEqual(relative)
  })

  it('offsets the rect by the parent origin and keeps its size', () => {
    const parent: Rect = { x: 100, y: 50, width: 200, height: 200 }
    expect(resolveChildRect(relative, parent)).toEqual({
      x: 105,
      y: 57,
      width: 10,
      height: 20,
    })
  })
})

describe('snapTargetsFor', () => {
  it('builds a target for every component that has known bounds', () => {
    const a = createComponent('circle', [])
    const b = createComponent('square', [a])
    const boundsA: Rect = { x: 0, y: 0, width: 10, height: 10 }
    const boundsB: Rect = { x: 20, y: 20, width: 10, height: 10 }
    const bounds = new Map<string, Rect>([
      [a.id, boundsA],
      [b.id, boundsB],
    ])
    expect(snapTargetsFor([a, b], bounds)).toEqual([
      { id: a.id, bounds: boundsA },
      { id: b.id, bounds: boundsB },
    ])
  })

  it('excludes the component being placed', () => {
    const a = createComponent('circle', [])
    const b = createComponent('square', [a])
    const bounds = new Map<string, Rect>([
      [a.id, { x: 0, y: 0, width: 10, height: 10 }],
      [b.id, { x: 20, y: 20, width: 10, height: 10 }],
    ])
    const targets = snapTargetsFor([a, b], bounds, b.id)
    expect(targets.map((t) => t.id)).toEqual([a.id])
  })

  it('skips components with no known bounds', () => {
    const a = createComponent('circle', [])
    const b = createComponent('square', [a])
    const bounds = new Map<string, Rect>([[a.id, { x: 0, y: 0, width: 10, height: 10 }]])
    expect(snapTargetsFor([a, b], bounds).map((t) => t.id)).toEqual([a.id])
  })

  it('returns an empty list when there are no components', () => {
    expect(snapTargetsFor([], new Map())).toEqual([])
  })
})