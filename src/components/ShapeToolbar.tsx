import type { ShapeDef } from '../shapes'

interface Props {
  shapes: ShapeDef[]
  value: string
  onChange: (id: string) => void
}

export default function ShapeToolbar({ shapes, value, onChange }: Props) {
  return (
    <div className="toolbar" role="toolbar" aria-label="Shapes">
      {shapes.map((s) => (
        <button
          key={s.id}
          type="button"
          className="toolbar-button"
          aria-pressed={s.id === value}
          onClick={() => onChange(s.id)}
        >
          {s.label}
        </button>
      ))}
    </div>
  )
}