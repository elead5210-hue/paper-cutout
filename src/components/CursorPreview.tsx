import { defaultRaw, getShape, parseValues } from '../shapes'
import ShapeCanvas from './ShapeCanvas'

interface Props {
  /** Id of the shape type that is armed for placement. */
  shapeId: string
  /** Pointer position in px, relative to the work area's top-left corner. */
  x: number
  y: number
}

/**
 * A non-interactive, semi-transparent drawing of the armed shape that is centred
 * on the pointer. It uses the shape's default values, which are the same values
 * a shape gets when it is placed.
 */
export default function CursorPreview({ shapeId, x, y }: Props) {
  const shape = getShape(shapeId)
  const result = parseValues(shape, defaultRaw(shape))
  if (!result.ok) return null

  return (
    <div
      className="cursor-preview"
      data-testid="cursor-preview"
      data-shape={shape.id}
      aria-hidden="true"
      style={{ left: `${x}px`, top: `${y}px` }}
    >
      <ShapeCanvas shape={shape} values={result.values} />
    </div>
  )
}