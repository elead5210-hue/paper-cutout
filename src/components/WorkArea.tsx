import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react'
import { defaultRaw, getShape, parseValues } from '../shapes'
import type { Component } from '../component'
import type { PlacedPosition } from '../placed'
import { DEFAULT_HOVER_THRESHOLD, isNearRect, nearestSide, type HoverSide } from '../hoverSide'
import { snapToSide } from '../sideSnap'
import { nearestCircleSnapAngle, snapCentreToAngle } from '../circleSnap'
import { snapPosition, type SnapTarget } from '../snapping'
import ShapeCanvas from './ShapeCanvas'
import CursorPreview from './CursorPreview'

interface Props {
  components: Component[]
  selectedId: string | null
  onSelect: (id: string) => void
  /** Whether placing a shape snaps it to existing objects (sides, circle angles, edges). */
  snapEnabled: boolean
  /** The shape type armed for placement, or null. */
  armedShapeId: string | null
  /** Place the armed shape; a position (offset from the centre point, px) is given when it snapped. */
  onPlaceArmed: (shapeId: string, position?: PlacedPosition) => void
  onCancelArmed: () => void
}

interface Pointer {
  /** Client coordinates, for hit-testing against element bounds. */
  clientX: number
  clientY: number
}

/** What the pointer is hovering on an existing object while a shape is armed. */
type Hover =
  | { componentId: string; kind: 'side'; side: HoverSide }
  | { componentId: string; kind: 'angle'; angle: number }

/** The size, in px, that a shape of the armed type will take once placed. */
interface PxSize {
  width: number
  height: number
}

const PX_PER_MM = 96 / 25.4

function hasArea(rect: { width: number; height: number }): boolean {
  return rect.width > 0 && rect.height > 0
}

/** Convert a "up is positive" snap angle into the SVG convention used by ShapeCanvas (clockwise). */
const toSvgAngle = (angle: number) => (360 - angle) % 360

export default function WorkArea({
  components,
  selectedId,
  onSelect,
  snapEnabled,
  armedShapeId,
  onPlaceArmed,
  onCancelArmed,
}: Props) {
  const areaRef = useRef<HTMLDivElement>(null)
  const buttons = useRef(new Map<string, HTMLButtonElement>())
  const [pointer, setPointer] = useState<Pointer | null>(null)
  const [hover, setHover] = useState<Hover | null>(null)

  // Escape cancels the armed shape without placing anything.
  useEffect(() => {
    if (!armedShapeId) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancelArmed()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [armedShapeId, onCancelArmed])

  /** Bounds (client px) of every drawn component, topmost last. Hidden or zero-area shapes are skipped. */
  const measure = () => {
    const out: Array<{ component: Component; el: HTMLButtonElement; rect: DOMRect }> = []
    for (const component of components) {
      const el = buttons.current.get(component.id)
      if (!el) continue
      const rect = el.getBoundingClientRect()
      if (hasArea(rect)) out.push({ component, el, rect })
    }
    return out
  }

  /** Which object, and which side or angle of it, the pointer is hovering. */
  const findHover = (p: Pointer): { hover: Hover; rect: DOMRect } | null => {
    if (!snapEnabled) return null
    const point = { x: p.clientX, y: p.clientY }
    const measured = measure()
    for (let i = measured.length - 1; i >= 0; i -= 1) {
      const { component, rect } = measured[i]
      if (!isNearRect(point, rect, DEFAULT_HOVER_THRESHOLD)) continue
      if (component.shape.shapeId === 'circle') {
        const centre = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
        const angle = nearestCircleSnapAngle(point, centre)
        if (angle !== null) return { hover: { componentId: component.id, kind: 'angle', angle }, rect }
      } else {
        const side = nearestSide(point, rect, DEFAULT_HOVER_THRESHOLD)
        if (side) return { hover: { componentId: component.id, kind: 'side', side }, rect }
      }
    }
    return null
  }

  /**
   * Size in px of the armed shape. It uses the scale of the drawn object under the pointer so it
   * matches what is on screen, falling back to CSS millimetres when nothing can be measured.
   */
  const armedSize = (target: { component: Component; el: HTMLButtonElement; rect: DOMRect } | null): PxSize => {
    const def = getShape(armedShapeId ?? '')
    const parsed = parseValues(def, defaultRaw(def))
    if (!parsed.ok) return { width: 0, height: 0 }
    const mine = def.build(parsed.values)

    let scaleX = PX_PER_MM
    let scaleY = PX_PER_MM
    let padX = 0
    let padY = 0
    if (target) {
      const tDef = getShape(target.component.shape.shapeId)
      const tParsed = parseValues(tDef, target.component.shape.raw)
      if (tParsed.ok) {
        const built = tDef.build(tParsed.values)
        const svg = target.el.querySelector('svg')?.getBoundingClientRect()
        const box = svg && hasArea(svg) ? svg : target.rect
        // Screen scale is the same on both axes in a browser; take the smaller if they differ.
        scaleX = scaleY = Math.min(box.width / built.width, box.height / built.height)
        // The placed button has padding around its drawing; a new one will too.
        padX = target.rect.width - box.width
        padY = target.rect.height - box.height
      }
    }
    return { width: mine.width * scaleX + padX, height: mine.height * scaleY + padY }
  }

  const handleMove = (e: MouseEvent) => {
    const p = { clientX: e.clientX, clientY: e.clientY }
    setPointer(p)
    setHover(armedShapeId ? (findHover(p)?.hover ?? null) : null)
  }

  const handleLeave = () => {
    setPointer(null)
    setHover(null)
  }

  const handleClick = (e: MouseEvent) => {
    if (!armedShapeId) return
    const p = { clientX: e.clientX, clientY: e.clientY }
    const found = findHover(p)
    const area = areaRef.current?.getBoundingClientRect()
    if (!found || !area) {
      onPlaceArmed(armedShapeId)
      return
    }

    const measured = measure()
    const target = measured.find((m) => m.component.id === found.hover.componentId) ?? null
    const size = armedSize(target)
    const rect = found.rect

    // Top-left corner of the new shape, in client px, against the hovered side or angle.
    let topLeft: { x: number; y: number } | null = null
    if (found.hover.kind === 'side') {
      topLeft = snapToSide(rect, found.hover.side, size)
    } else {
      const centre = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
      const c = snapCentreToAngle(centre, rect.width / 2, size, found.hover.angle)
      topLeft = c && { x: c.x - size.width / 2, y: c.y - size.height / 2 }
    }
    if (!topLeft) {
      onPlaceArmed(armedShapeId)
      return
    }

    // Line the new shape's edges and centre up with other objects when they are close.
    const others: SnapTarget[] = measured
      .filter((m) => m.component.id !== found.hover.componentId)
      .map((m) => ({ id: m.component.id, bounds: { x: m.rect.left, y: m.rect.top, width: m.rect.width, height: m.rect.height } }))
    const aligned = snapPosition(topLeft, size, others, { enabled: snapEnabled })

    const centre = { x: aligned.x + size.width / 2, y: aligned.y + size.height / 2 }
    const origin = { x: area.left + area.width / 2, y: area.top + area.height / 2 }
    onPlaceArmed(armedShapeId, { x: centre.x - origin.x, y: centre.y - origin.y })
  }

  const showPreview = armedShapeId !== null && pointer !== null
  const areaRect = areaRef.current?.getBoundingClientRect()
  const previewAt = pointer && {
    x: pointer.clientX - (areaRect?.left ?? 0),
    y: pointer.clientY - (areaRect?.top ?? 0),
  }

  return (
    <div
      ref={areaRef}
      className="work-area"
      data-testid="work-area"
      data-snap={snapEnabled ? 'on' : 'off'}
      data-armed={armedShapeId ?? undefined}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={handleClick}
    >
      <div
        className="centre-point"
        data-testid="centre-point"
        role="img"
        aria-label="Centre point"
      />

      {components.length === 0 && (
        <p className="empty-hint">Click a shape in the toolbar to place it here.</p>
      )}

      {components.map((c) => {
        const def = getShape(c.shape.shapeId)
        const result = parseValues(def, c.shape.raw)
        if (!result.ok) return null

        const active = armedShapeId !== null && hover?.componentId === c.id ? hover : null
        const pos = c.shape.position
        const style = pos
          ? ({
              '--offset-x': `${pos.x}px`,
              '--offset-y': `${pos.y}px`,
              transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`,
            } as CSSProperties)
          : undefined

        return (
          <button
            key={c.id}
            type="button"
            ref={(el) => {
              if (el) buttons.current.set(c.id, el)
              else buttons.current.delete(c.id)
            }}
            className="placed"
            data-component={c.name}
            title={c.name}
            aria-pressed={c.id === selectedId}
            style={style}
            // While a shape is armed the click belongs to the work area, which places it.
            onClick={() => {
              if (!armedShapeId) onSelect(c.id)
            }}
          >
            <ShapeCanvas
              shape={def}
              values={result.values}
              highlightSide={active?.kind === 'side' ? active.side : null}
              highlightAngle={active?.kind === 'angle' ? toSvgAngle(active.angle) : null}
            />
          </button>
        )
      })}

      {showPreview && armedShapeId && previewAt && (
        <CursorPreview shapeId={armedShapeId} x={previewAt.x} y={previewAt.y} />
      )}
    </div>
  )
}