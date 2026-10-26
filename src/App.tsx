import { useState } from 'react'
import { SHAPES, getShape, parseValues } from './shapes'
import { createComponent, type Component } from './component'
import type { PlacedPosition } from './placed'
import ShapeToolbar from './components/ShapeToolbar'
import ShapeInputs from './components/ShapeInputs'
import WorkArea from './components/WorkArea'
import HierarchyPanel from './components/HierarchyPanel'

export default function App() {
  // The work area starts empty. Placing a shape creates a default-named component that
  // contains it, and each shape keeps its own values.
  const [components, setComponents] = useState<Component[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  // Whether newly placed shapes snap to existing objects.
  const [snapEnabled, setSnapEnabled] = useState(true)
  // The shape type armed for placement. While set, a preview of it follows the cursor over the work area.
  const [armedShapeId, setArmedShapeId] = useState<string | null>(null)

  const selected = components.find((c) => c.id === selectedId) ?? null
  const shape = selected ? getShape(selected.shape.shapeId) : null
  const result = selected && shape ? parseValues(shape, selected.shape.raw) : null

  // Clicking a toolbar button arms that shape; clicking the armed button again disarms it.
  const arm = (shapeId: string) => {
    setArmedShapeId((current) => (current === shapeId ? null : shapeId))
  }

  // An optional position (offset from the centre point) is given when the shape was snapped to a side.
  const place = (shapeId: string, position?: PlacedPosition) => {
    const next = createComponent(shapeId, components, position)
    setComponents((prev) => [...prev, next])
    setSelectedId(next.id)
    setArmedShapeId(null)
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
        <ShapeToolbar
          shapes={SHAPES}
          onPlace={arm}
          armedShapeId={armedShapeId}
          snapEnabled={snapEnabled}
          onSnapChange={setSnapEnabled}
        />
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
        <WorkArea
          components={components}
          selectedId={selectedId}
          onSelect={setSelectedId}
          snapEnabled={snapEnabled}
          armedShapeId={armedShapeId}
          onPlaceArmed={place}
          onCancelArmed={() => setArmedShapeId(null)}
        />
      </main>
      <HierarchyPanel components={components} selectedId={selectedId} onSelect={setSelectedId} />
    </div>
  )
}