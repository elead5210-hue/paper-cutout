import { defaultRaw, getShape, type RawValues } from './shapes'

/** One shape that has been placed in the work area. */
export interface PlacedShape {
  /** Unique per placed instance, so the same shape type can be placed more than once. */
  id: string
  /** Which entry in SHAPES this instance is. */
  shapeId: string
  /** Raw input text, kept as strings so a field can be cleared and retyped. */
  raw: RawValues
}

let counter = 0

/** Start a new instance of a shape with that shape's default values. */
export function createPlaced(shapeId: string): PlacedShape {
  const def = getShape(shapeId)
  counter += 1
  return {
    id: `placed-${counter}`,
    shapeId: def.id,
    raw: defaultRaw(def),
  }
}