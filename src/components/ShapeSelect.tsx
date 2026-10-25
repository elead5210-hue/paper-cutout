import type { ShapeDef } from '../shapes'

interface Props {
  shapes: ShapeDef[]
  value: string
  onChange: (id: string) => void
}

export default function ShapeSelect({ shapes, value, onChange }: Props) {
  return (
    <div className="group">
      <label htmlFor="shape">Shape</label>
      <select id="shape" value={value} onChange={(e) => onChange(e.target.value)}>
        {shapes.map((s) => (
          <option key={s.id} value={s.id}>{s.label}</option>
        ))}
      </select>
    </div>
  )
}
