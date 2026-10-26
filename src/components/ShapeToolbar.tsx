import type { ShapeDef } from '../shapes'

interface Props {
  shapes: ShapeDef[]
  onPlace: (shapeId: string) => void
  /** The shape currently armed for placement (its preview follows the cursor), or null. */
  armedShapeId?: string | null
  /** Whether snapping to existing objects is switched on. */
  snapEnabled?: boolean
  /** Called with the new on/off value when the snap toggle is changed. */
  onSnapChange?: (enabled: boolean) => void
}

export default function ShapeToolbar({
  shapes,
  onPlace,
  armedShapeId = null,
  snapEnabled = true,
  onSnapChange,
}: Props) {
  return (
    <div className="toolbar" role="toolbar" aria-label="Shapes">
      {shapes.map((s) => (
        <button
          key={s.id}
          type="button"
          className="toolbar-button"
          aria-pressed={armedShapeId === s.id}
          onClick={() => onPlace(s.id)}
        >
          {s.label}
        </button>
      ))}
      {onSnapChange && (
        <label className="snap-toggle">
          <input
            type="checkbox"
            checked={snapEnabled}
            onChange={(e) => onSnapChange(e.target.checked)}
          />
          Snap to objects
        </label>
      )}
    </div>
  )
}