import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { getShape, parseValues } from '../shapes'
import type { Component } from '../component'
import type { SnapGuide } from '../snapping'
import { hoveredTargetSide, type HoverSide } from '../hoverSide'
import { snapCentreToSide } from '../sideSnap'
import type { PlacedPosition } from '../placed'
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
  onPlaceArmed?: (shapeId: string, position?: PlacedPosition) => void
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
  // The existing object under the pointer and which of its sides is nearest, shown while a shape is armed.
  const [hovered, setHovered] = useState<{ id: string; side: HoverSide } | null>(null)
  // Placed shape buttons, keyed by component id, so their bounds can be measured.
  const placedRefs = useRef<Map<string, HTMLButtonElement>>(new Map())
  const workRef = useRef<HTMLDivElement>(null)

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

    if (!armedShapeId || !snapEnabled) {
      setHovered(null)
      return
    }
    // Measure each placed shape in the same client coordinate space as the pointer.
    const targets: Array<{ id: string; bounds: { x: number; y: number; width: number; height: number } }> = []
    for (const c of components) {
      const el = placedRefs.current.get(c.id)
      if (!el) continue
      const b = el.getBoundingClientRect()
      targets.push({ id: c.id, bounds: { x: b.left, y: b.top, width: b.width, height: b.height } })
    }
    const hit = hoveredTargetSide({ x: e.clientX, y: e.clientY }, targets)
    setHovered((prev) =>
      prev?.id === hit?.id && prev?.side === hit?.side ? prev : hit,
    )
  }

  // Where the armed shape goes if placed now: flush against the highlighted side of the hovered
  // object, as an offset of its centre from the work area's centre. Undefined means no snap.
  const snappedPosition = (): PlacedPosition | undefined => {
    if (!snapEnabled || !hovered) return undefined
    const targetEl = placedRefs.current.get(hovered.id)
    const area = workRef.current
    const previewEl = area?.querySelector('[data-testid="cursor-preview"]')
    if (!targetEl || !area || !previewEl) return undefined

    const t = targetEl.getBoundingClientRect()
    const targetSvg = targetEl.firstElementChild?.getBoundingClientRect()
    const p = previewEl.getBoundingClientRect()
    // The new shape's button gets the same padding and border as the target's.
    const extraW = targetSvg ? t.width - targetSvg.width : 0
    const extraH = targetSvg ? t.height - targetSvg.height : 0

    const centre = snapCentreToSide(
      { x: t.left, y: t.top, width: t.width, height: t.height },
      hovered.side,
      { width: p.width + extraW, height: p.height + extraH },
    )
    if (!centre) return undefined

    const a = area.getBoundingClientRect()
    return {
      x: centre.x - (a.left + a.width / 2),
      y: centre.y - (a.top + a.height / 2),
    }
  }

  const showPreview = armedShapeId !== null && pointer !== null

  return (
    <div
      ref={workRef}
      className="work-area"
      data-testid="work-area"
      data-snap={snapEnabled ? 'on' : 'off'}
      data-armed={armedShapeId ?? undefined}
      onPointerMove={trackPointer}
      onPointerEnter={trackPointer}
      onPointerLeave={() => {
        setPointer(null)
        setHovered(null)
      }}
      onClick={(e) => {
        // Only clicks on empty work area place the armed shape, not clicks on placed shapes.
        if (armedShapeId && e.target === e.currentTarget) {
          onPlaceArmed?.(armedShapeId, snappedPosition())
        }
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
            ref={(el) => {
              if (el) placedRefs.current.set(c.id, el)
              else placedRefs.current.delete(c.id)
            }}
            type="button"
            className="placed"
            data-component={c.name}
            title={c.name}
            aria-pressed={c.id === selectedId}
            style={
              c.shape.position
                ? {
                    transform: `translate(calc(-50% + ${c.shape.position.x}px), calc(-50% + ${c.shape.position.y}px))`,
                  }
                : undefined
            }
            onClick={() => {
              // While armed, clicking the object with a side highlighted snaps the new shape to it.
              const position = armedShapeId ? snappedPosition() : undefined
              if (armedShapeId && position) onPlaceArmed?.(armedShapeId, position)
              else onSelect(c.id)
            }}
          >
            <ShapeCanvas
              shape={shape}
              values={result.values}
              guides={snapEnabled ? (guidesById[c.id] ?? NO_GUIDES) : NO_GUIDES}
              highlightSide={armedShapeId && hovered?.id === c.id ? hovered.side : null}
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