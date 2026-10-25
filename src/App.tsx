import { useState } from 'react'
import { SHAPES, getShape, parseValues } from './shapes'
import { createPlaced, type PlacedShape } from './placed'
import ShapeToolbar from './components/ShapeToolbar'
import ShapeInputs from './components/ShapeInputs'
import WorkArea from './components/WorkArea'

export default function App() {
  // The work area starts empty. Each placed shape keeps its own values.
  const [placed, setPlaced] = useState<PlacedShape[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selected = placed.find((p) => p.id === selectedId) ?? null
  const shape = selected ? getShape(selected.shapeId) : null
  const result = selected && shape ? parseValues(shape, selected.raw) : null

  const place = (shapeId: string) => {
    const next = createPlaced(shapeId)
    setPlaced((prev) => [...prev, next])
    setSelectedId(next.id)
  }

  const setField = (key: string, value: string) => {
    if (!selected) return
    setPlaced((prev) =>
      prev.map((p) => (p.id === selected.id ? { ...p, raw: { ...p.raw, [key]: value } } : p))
    )
  }

  return (
    <div className="layout">
      <aside className="panel">
        <h1>Shape viewer</h1>
        <ShapeToolbar shapes={SHAPES} onPlace={place} />
        {selected && shape && (
          <ShapeInputs fields={shape.fields} raw={selected.raw} onChange={setField} />
        )}
        <p className="msg" role="alert">{result && !result.ok ? result.error : ''}</p>
        <p className="note">
          Shapes are drawn in millimetre units. Grid squares are 10 mm. Actual on-screen size
          depends on your display&rsquo;s pixel density, so check against a ruler if you need exact size.
        </p>
      </aside>
      <main className="stage">
        <WorkArea placed={placed} selectedId={selectedId} onSelect={setSelectedId} />
      </main>
    </div>
  )
}