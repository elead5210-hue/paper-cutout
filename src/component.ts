import { createPlaced, type PlacedPosition, type PlacedShape } from './placed'
import type { Rect, SnapTarget } from './snapping'

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
 * An optional position offsets the shape from the centre point (e.g. when snapped to a side).
 */
export function createComponent(
  shapeId: string,
  existing: readonly Component[],
  position?: PlacedPosition,
): Component {
  counter += 1
  return {
    id: `component-${counter}`,
    name: nextDefaultName(existing),
    shape: createPlaced(shapeId, position),
  }
}

/** Find an existing component by id, or undefined if there is none. */
export function findComponent(
  components: readonly Component[],
  id: string,
): Component | undefined {
  return components.find((component) => component.id === id)
}

/** Find the component whose placed shape has the given placed-shape id. */
export function findComponentByPlacedId(
  components: readonly Component[],
  placedId: string,
): Component | undefined {
  return components.find((component) => component.shape.id === placedId)
}

/**
 * Resolve a rect given relative to a parent component into absolute canvas
 * coordinates. A missing parent means the rect is already absolute.
 */
export function resolveChildRect(
  relative: Rect,
  parentBounds: Rect | null | undefined,
): Rect {
  if (!parentBounds) return relative
  return {
    x: relative.x + parentBounds.x,
    y: relative.y + parentBounds.y,
    width: relative.width,
    height: relative.height,
  }
}

/**
 * Build the list of snap targets for a newly placed child: every existing
 * component's absolute bounds, excluding the component being placed. Bounds
 * for components with no known position are skipped.
 */
export function snapTargetsFor(
  components: readonly Component[],
  boundsById: ReadonlyMap<string, Rect>,
  excludeComponentId?: string,
): SnapTarget[] {
  const targets: SnapTarget[] = []
  for (const component of components) {
    if (component.id === excludeComponentId) continue
    const bounds = boundsById.get(component.id)
    if (bounds) targets.push({ id: component.id, bounds })
  }
  return targets
}