import { useEffect, useState, type PointerEvent } from 'react'
import { getShape, parseValues } from '../shapes'
import type { Component } from '../component'
import type { SnapGuide } from '../snapping'
import ShapeCanvas from './ShapeCanvas'
import CursorPreview from './CursorPreview'

const NO_GUIDES: ReadonlyArray<SnapGuide> = []

interface Props {
  components: Component[]
  selectedId: string | null
  onSelect: (id: string) => void
  /** Whether snapping to existing objects is switched on. */
  snapEnabled?: boolean
  /** Snap guides to draw per component id, in that component's own canvas space (mm). */
  guidesById?: Readonly<Record<string, ReadonlyArray<SnapGuide>>>
  /** The shape armed for placement; a preview of it follows the cursor while set. */
  armedShapeId?: string | null
  /** Called with the armed shape id when the work area is clicked while a shape is armed. */
  onPlaceArmed?: (shapeId: string) => void
  /** Called when the armed shape is cancelled (Escape pressed). */
  onCancelArmed?: () => void
}

export default function WorkArea({
  components,
  selectedId,
  onSelect,
  snapEnabled = true,
  guidesById = {},
  armedShapeId = null,
  onPlaceArmed,
  onCancelArmed,
}: Props) {
  // Pointer position in px relative to the work area, or null when the pointer is outside it.
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null)

  // Escape cancels the armed shape.
  useEffect(() => {
    if (!armedShapeId) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancelArmed?.()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [armedShapeId, onCancelArmed])

  const trackPointer = (e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setPointer({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  const showPreview = armedShapeId !== null && pointer !== null

  return (
    <div
      className="work-area"
      data-testid="work-area"
      data-snap={snapEnabled ? 'on' : 'off'}
      data-armed={armedShapeId ?? undefined}
      onPointerMove={trackPointer}
      onPointerEnter={trackPointer}
      onPointerLeave={() => setPointer(null)}
      onClick={(e) => {
        // Only clicks on empty work area place the armed shape, not clicks on placed shapes.
        if (armedShapeId && e.target === e.currentTarget) onPlaceArmed?.(armedShapeId)
      }}
    >
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
            <ShapeCanvas
              shape={shape}
              values={result.values}
              guides={snapEnabled ? (guidesById[c.id] ?? NO_GUIDES) : NO_GUIDES}
            />
          </button>
        )
      })}
      {showPreview && armedShapeId && (
        <CursorPreview shapeId={armedShapeId} x={pointer.x} y={pointer.y} />
      )}
    </div>
  )
}