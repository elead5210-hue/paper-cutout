import { getShape, parseValues } from '../shapes'
import type { Component } from '../component'
import ShapeCanvas from './ShapeCanvas'

interface Props {
  components: Component[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export default function WorkArea({ components, selectedId, onSelect }: Props) {
  return (
    <div className="work-area" data-testid="work-area">
      <span
        className="centre-point"
        role="img"
        aria-label="Centre point"
        data-testid="centre-point"
      />
      {components.length === 0 && (
        <p className="empty-hint">Click a shape in the toolbar to place it here.</p>
      )}
      {components.map((c) => {
        const shape = getShape(c.shape.shapeId)
        const result = parseValues(shape, c.shape.raw)
        // A shape with invalid input is hidden until the value is fixed.
        if (!result.ok) return null

        return (
          <button
            key={c.id}
            type="button"
            className="placed"
            data-component={c.name}
            title={c.name}
            aria-pressed={c.id === selectedId}
            onClick={() => onSelect(c.id)}
          >
            <ShapeCanvas shape={shape} values={result.values} />
          </button>
        )
      })}
    </div>
  )
}