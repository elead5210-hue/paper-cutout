import type { ShapeDef } from '../shapes'

interface Props {
  shapes: ShapeDef[]
  onPlace: (shapeId: string) => void
}

export default function ShapeToolbar({ shapes, onPlace }: Props) {
  return (
    <div className="toolbar" role="toolbar" aria-label="Shapes">
      {shapes.map((s) => (
        <button
          key={s.id}
          type="button"
          className="toolbar-button"
          onClick={() => onPlace(s.id)}
        >
          {s.label}
        </button>
      ))}
    </div>
  )
}