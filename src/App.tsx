import { useState } from 'react'
import { SHAPES, getShape, parseValues } from './shapes'
import { createComponent, type Component } from './component'
import ShapeToolbar from './components/ShapeToolbar'
import ShapeInputs from './components/ShapeInputs'
import WorkArea from './components/WorkArea'

export default function App() {
  // The work area starts empty. Placing a shape creates a default-named component that
  // contains it, and each shape keeps its own values.
  const [components, setComponents] = useState<Component[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selected = components.find((c) => c.id === selectedId) ?? null
  const shape = selected ? getShape(selected.shape.shapeId) : null
  const result = selected && shape ? parseValues(shape, selected.shape.raw) : null

  const place = (shapeId: string) => {
    const next = createComponent(shapeId, components)
    setComponents((prev) => [...prev, next])
    setSelectedId(next.id)
  }

  const setField = (key: string, value: string) => {
    if (!selected) return
    setComponents((prev) =>
      prev.map((c) =>
        c.id === selected.id
          ? { ...c, shape: { ...c.shape, raw: { ...c.shape.raw, [key]: value } } }
          : c
      )
    )
  }

  return (
    <div className="layout">
      <aside className="panel">
        <h1>Shape viewer</h1>
        <ShapeToolbar shapes={SHAPES} onPlace={place} />
        {selected && shape && (
          <ShapeInputs fields={shape.fields} raw={selected.shape.raw} onChange={setField} />
        )}
        <p className="msg" role="alert">{result && !result.ok ? result.error : ''}</p>
        <p className="note">
          Shapes are drawn in millimetre units. Grid squares are 10 mm. Actual on-screen size
          depends on your display&rsquo;s pixel density, so check against a ruler if you need exact size.
        </p>
      </aside>
      <main className="stage">
        <WorkArea components={components} selectedId={selectedId} onSelect={setSelectedId} />
      </main>
    </div>
  )
}