import { useState } from 'react'
import { DEFAULT_SHAPE_ID, SHAPES, defaultRaw, getShape, parseValues, type RawValues } from './shapes'
import ShapeToolbar from './components/ShapeToolbar'
import ShapeInputs from './components/ShapeInputs'
import ShapeCanvas from './components/ShapeCanvas'

export default function App() {
  const [shapeId, setShapeId] = useState(DEFAULT_SHAPE_ID)
  // Last-entered values are kept per shape so switching back loses nothing.
  const [rawByShape, setRawByShape] = useState<Record<string, RawValues>>(() =>
    Object.fromEntries(SHAPES.map((s) => [s.id, defaultRaw(s)]))
  )

  const shape = getShape(shapeId)
  const raw = rawByShape[shape.id]
  const result = parseValues(shape, raw)

  const setField = (key: string, value: string) =>
    setRawByShape((prev) => ({ ...prev, [shape.id]: { ...prev[shape.id], [key]: value } }))

  return (
    <div className="layout">
      <aside className="panel">
        <h1>Shape viewer</h1>
        <ShapeToolbar shapes={SHAPES} value={shape.id} onChange={setShapeId} />
        <ShapeInputs fields={shape.fields} raw={raw} onChange={setField} />
        <p className="msg" role="alert">{result.ok ? '' : result.error}</p>
        <p className="note">
          Shapes are drawn in millimetre units. Grid squares are 10 mm. Actual on-screen size
          depends on your display&rsquo;s pixel density, so check against a ruler if you need exact size.
        </p>
      </aside>
      <main className="stage">
        {result.ok && <ShapeCanvas shape={shape} values={result.values} />}
      </main>
    </div>
  )
}