import type { Field, RawValues } from '../shapes'

interface Props {
  fields: Field[]
  raw: RawValues
  onChange: (key: string, value: string) => void
}

export default function ShapeInputs({ fields, raw, onChange }: Props) {
  return (
    <>
      {fields.map((f) => (
        <div className="group" key={f.key}>
          <label htmlFor={`field-${f.key}`}>{f.label}</label>
          <div className="field">
            <input
              id={`field-${f.key}`}
              type="number"
              inputMode={f.integer ? 'numeric' : 'decimal'}
              min={f.min}
              max={f.max}
              step={f.integer ? 1 : 'any'}
              value={raw[f.key] ?? ''}
              onChange={(e) => onChange(f.key, e.target.value)}
            />
            {f.unit && <span className="unit">{f.unit}</span>}
          </div>
        </div>
      ))}
    </>
  )
}