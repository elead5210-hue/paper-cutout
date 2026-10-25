export type Point = [number, number]

/** Everything the canvas needs. Coordinates are in mm, origin at top-left of the bounding box. */
export interface Drawable {
  width: number
  height: number
  element:
    | { type: 'circle'; r: number }
    | { type: 'polygon'; points: Point[] }
}

export interface Field {
  key: string
  label: string
  unit?: string
  defaultValue: number
  min: number
  max: number
  integer?: boolean
}

export interface ShapeDef {
  id: string
  label: string
  fields: Field[]
  build: (values: Record<string, number>) => Drawable
  /** Plain-language description used as the SVG's accessible label. */
  describe: (values: Record<string, number>) => string
}

/** Regular polygon points around (0,0), first vertex pointing up, then shifted so the bbox starts at 0,0. */
export function regularPolygonPoints(sides: number, radius: number): Point[] {
  const raw: Point[] = Array.from({ length: sides }, (_, i) => {
    const angle = ((-90 + (i * 360) / sides) * Math.PI) / 180
    return [radius * Math.cos(angle), radius * Math.sin(angle)]
  })
  return normalise(raw).points
}

export function normalise(points: Point[]) {
  const xs = points.map((p) => p[0])
  const ys = points.map((p) => p[1])
  const minX = Math.min(...xs)
  const minY = Math.min(...ys)
  return {
    points: points.map(([x, y]) => [x - minX, y - minY] as Point),
    width: Math.max(...xs) - minX,
    height: Math.max(...ys) - minY,
  }
}

function polygonDrawable(points: Point[]): Drawable {
  const n = normalise(points)
  return { width: n.width, height: n.height, element: { type: 'polygon', points: n.points } }
}

const size = (key: string, label: string, defaultValue: number): Field => ({
  key, label, unit: 'mm', defaultValue, min: 0.1, max: 1000,
})

const mm = (n: number) => `${n} ${n === 1 ? 'millimetre' : 'millimetres'}`

export const SHAPES: ShapeDef[] = [
  {
    id: 'circle',
    label: 'Circle',
    fields: [size('diameter', 'Diameter', 20)],
    build: ({ diameter }) => ({
      width: diameter,
      height: diameter,
      element: { type: 'circle', r: diameter / 2 },
    }),
    describe: ({ diameter }) => `Circle, ${mm(diameter)} diameter`,
  },
  {
    id: 'square',
    label: 'Square',
    fields: [size('side', 'Side length', 20)],
    build: ({ side }) =>
      polygonDrawable([[0, 0], [side, 0], [side, side], [0, side]]),
    describe: ({ side }) => `Square, ${mm(side)} per side`,
  },
  {
    id: 'rectangle',
    label: 'Rectangle',
    fields: [size('width', 'Width', 30), size('height', 'Height', 20)],
    build: ({ width, height }) =>
      polygonDrawable([[0, 0], [width, 0], [width, height], [0, height]]),
    describe: ({ width, height }) => `Rectangle, ${width} by ${mm(height)}`,
  },
  {
    // Equilateral, point up. Circumradius = side / √3, so height = side × √3 / 2.
    id: 'triangle',
    label: 'Triangle',
    fields: [size('side', 'Side length', 20)],
    build: ({ side }) => polygonDrawable(regularPolygonPoints(3, side / Math.sqrt(3))),
    describe: ({ side }) => `Equilateral triangle, ${mm(side)} per side`,
  },
  {
    // Regular polygon sized by circumscribed diameter (corner to corner), point up.
    id: 'polygon',
    label: 'Polygon',
    fields: [
      { key: 'sides', label: 'Number of sides', defaultValue: 6, min: 3, max: 64, integer: true },
      size('diameter', 'Diameter', 20),
    ],
    build: ({ sides, diameter }) => polygonDrawable(regularPolygonPoints(sides, diameter / 2)),
    describe: ({ sides, diameter }) => `Regular polygon with ${sides} sides, ${mm(diameter)} diameter`,
  },
]

export const DEFAULT_SHAPE_ID = 'circle'

export const getShape = (id: string): ShapeDef =>
  SHAPES.find((s) => s.id === id) ?? SHAPES[0]

/** Raw input is kept as strings so people can clear the box and retype. */
export type RawValues = Record<string, string>

export const defaultRaw = (def: ShapeDef): RawValues =>
  Object.fromEntries(def.fields.map((f) => [f.key, String(f.defaultValue)]))

export type ParseResult =
  | { ok: true; values: Record<string, number> }
  | { ok: false; error: string }

export function parseValues(def: ShapeDef, raw: RawValues): ParseResult {
  const values: Record<string, number> = {}
  for (const f of def.fields) {
    const text = (raw[f.key] ?? '').trim()
    const n = Number(text)
    if (text === '' || !Number.isFinite(n)) return { ok: false, error: `${f.label}: enter a number.` }
    if (f.integer && !Number.isInteger(n)) return { ok: false, error: `${f.label}: use a whole number.` }
    if (n < f.min || n > f.max)
      return { ok: false, error: `${f.label}: enter a value from ${f.min} to ${f.max}.` }
    values[f.key] = n
  }
  return { ok: true, values }
}