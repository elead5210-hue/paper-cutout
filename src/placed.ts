import { defaultRaw, getShape, type RawValues } from './shapes'
import type { SnapAnchor, SnapAxis } from './snapping'

/** Where a placed shape was snapped to, kept so the canvas can draw guides and re-apply the snap. */
export interface PlacedSnap {
  /** Position of the shape after snapping, relative to its parent (or the canvas when top level). */
  x: number
  y: number
  /** Id of the existing object snapped to on each axis, or null if that axis did not snap. */
  targetIdX: string | null
  targetIdY: string | null
  /** Anchors that aligned on each axis, or null if that axis did not snap. */
  anchorX: { shape: SnapAnchor; target: SnapAnchor } | null
  anchorY: { shape: SnapAnchor; target: SnapAnchor } | null
}

/** Axis list re-exported for callers that iterate over snap axes. */
export const SNAP_AXES: ReadonlyArray<SnapAxis> = ['x', 'y']

/** Offset of a placed shape's centre from the work area's centre point, in px. */
export interface PlacedPosition {
  x: number
  y: number
}

/** One shape that has been placed in the work area. */
export interface PlacedShape {
  /** Unique per placed instance, so the same shape type can be placed more than once. */
  id: string
  /** Which entry in SHAPES this instance is. */
  shapeId: string
  /** Raw input text, kept as strings so a field can be cleared and retyped. */
  raw: RawValues
  /** Snap result stored when the shape was added as a nested child; absent if it did not snap. */
  snap?: PlacedSnap
  /** Offset from the centre point where the shape was placed (e.g. snapped to a side); absent means centred. */
  position?: PlacedPosition
}

let counter = 0

/** Start a new instance of a shape with that shape's default values. */
export function createPlaced(shapeId: string, position?: PlacedPosition): PlacedShape {
  const def = getShape(shapeId)
  counter += 1
  const placed: PlacedShape = {
    id: `placed-${counter}`,
    shapeId: def.id,
    raw: defaultRaw(def),
  }
  return position ? { ...placed, position } : placed
}

/** Return a copy of a placed shape with its snap result stored (or cleared when null). */
export function withSnap(placed: PlacedShape, snap: PlacedSnap | null): PlacedShape {
  if (snap === null) {
    const { snap: _removed, ...rest } = placed
    return rest
  }
  return { ...placed, snap }
}

/** Build a PlacedSnap from a snapping result; returns null when neither axis snapped. */
export function snapFromResult(result: {
  x: number
  y: number
  snappedX: boolean
  snappedY: boolean
  guides: ReadonlyArray<{
    axis: SnapAxis
    shapeAnchor: SnapAnchor
    targetAnchor: SnapAnchor
  }>
  targetIdX: string | null
  targetIdY: string | null
}): PlacedSnap | null {
  if (!result.snappedX && !result.snappedY) return null
  const anchorFor = (axis: SnapAxis) => {
    const guide = result.guides.find((g) => g.axis === axis)
    return guide ? { shape: guide.shapeAnchor, target: guide.targetAnchor } : null
  }
  return {
    x: result.x,
    y: result.y,
    targetIdX: result.targetIdX,
    targetIdY: result.targetIdY,
    anchorX: anchorFor('x'),
    anchorY: anchorFor('y'),
  }
}