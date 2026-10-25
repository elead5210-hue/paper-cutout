import { createPlaced, type PlacedShape } from './placed'

/** A named component. Every shape added to the work area lives inside one. */
export interface Component {
  /** Unique per component. */
  id: string
  /** Display name. Generated as "Component N" by default. */
  name: string
  /** The shape that was added to the canvas area as part of this component. */
  shape: PlacedShape
}

const DEFAULT_NAME_PREFIX = 'Component'

let counter = 0

/**
 * The next free default name: one more than the highest "Component N" already
 * in use. Numbers are never reused, even if an earlier component is removed or
 * renamed, so a default name never repeats.
 */
export function nextDefaultName(existing: readonly Component[]): string {
  const pattern = new RegExp(`^${DEFAULT_NAME_PREFIX} (\\d+)$`)
  let highest = 0
  for (const component of existing) {
    const match = pattern.exec(component.name)
    if (match) highest = Math.max(highest, Number(match[1]))
  }
  return `${DEFAULT_NAME_PREFIX} ${highest + 1}`
}

/**
 * Create a component around a new instance of a shape at its default values,
 * named with the next free default name given the components that already exist.
 */
export function createComponent(shapeId: string, existing: readonly Component[]): Component {
  counter += 1
  return {
    id: `component-${counter}`,
    name: nextDefaultName(existing),
    shape: createPlaced(shapeId),
  }
}