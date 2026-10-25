import { describe, expect, it } from 'vitest'
import { createComponent, nextDefaultName, type Component } from './component'
import { defaultRaw, getShape } from './shapes'

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