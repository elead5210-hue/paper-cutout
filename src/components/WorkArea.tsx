import { getShape, parseValues } from '../shapes'
import type { PlacedShape } from '../placed'
import ShapeCanvas from './ShapeCanvas'

interface Props {
  placed: PlacedShape[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export default function WorkArea({ placed, selectedId, onSelect }: Props) {
  return (
    <div className="work-area" data-testid="work-area">
      <span
        className="centre-point"
        role="img"
        aria-label="Centre point"
        data-testid="centre-point"
      />
      {placed.length === 0 && (
        <p className="empty-hint">Click a shape in the toolbar to place it here.</p>
      )}
      {placed.map((p) => {
        const shape = getShape(p.shapeId)
        const result = parseValues(shape, p.raw)
        // A shape with invalid input is hidden until the value is fixed.
        if (!result.ok) return null

        return (
          <button
            key={p.id}
            type="button"
            className="placed"
            aria-pressed={p.id === selectedId}
            onClick={() => onSelect(p.id)}
          >
            <ShapeCanvas shape={shape} values={result.values} />
          </button>
        )
      })}
    </div>
  )
}