import type { ShapeDef } from '../shapes'
import type { SnapGuide } from '../snapping'
import type { HoverSide } from '../hoverSide'

const STROKE = 0.3 // mm. Stroke is centred on the outline; the viewBox is padded so nothing clips.

interface Props {
  shape: ShapeDef
  values: Record<string, number>
  /**
   * Snap guides to draw, in the same mm coordinate space as this canvas's
   * viewBox (origin at the shape's top-left). Omit or pass empty for none.
   */
  guides?: ReadonlyArray<SnapGuide>
  /**
   * The side of the shape's bounding box to highlight (the side being hovered while a
   * new shape is armed). Omit or pass null for no highlight.
   */
  highlightSide?: HoverSide | null
  /**
   * For circles: the snap angle to highlight, in degrees, with 0 at the right and
   * increasing clockwise on screen (SVG's y-down convention). A marker is drawn on the
   * circle's outline at that angle instead of a side line. Omit or pass null for none.
   */
  highlightAngle?: number | null
}

export default function ShapeCanvas({
  shape,
  values,
  guides = [],
  highlightSide = null,
  highlightAngle = null,
}: Props) {
  const { width, height, element } = shape.build(values)
  const pad = STROKE / 2
  const w = width + STROKE
  const h = height + STROKE

  const label = shape.describe(values)

  // Point on the circle's outline at the highlighted angle (circles only).
  const angleMarker =
    element.type === 'circle' && highlightAngle != null
      ? {
          x: width / 2 + element.r * Math.cos((highlightAngle * Math.PI) / 180),
          y: height / 2 + element.r * Math.sin((highlightAngle * Math.PI) / 180),
        }
      : null

  const common = {
    fill: 'var(--accent-fill)',
    stroke: 'var(--accent)',
    strokeWidth: STROKE,
    strokeLinejoin: 'round' as const,
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={label}
      viewBox={`${-pad} ${-pad} ${w} ${h}`}
      width={`${w}mm`}
      height={`${h}mm`}
      className="canvas"
    >
      {element.type === 'circle' ? (
        <circle cx={width / 2} cy={height / 2} r={element.r} {...common} />
      ) : (
        <polygon points={element.points.map(([x, y]) => `${x},${y}`).join(' ')} {...common} />
      )}
      {angleMarker && (
        <circle
          className="angle-highlight"
          data-testid="angle-highlight"
          data-angle={highlightAngle}
          cx={angleMarker.x}
          cy={angleMarker.y}
          r={STROKE * 3}
        />
      )}
      {highlightSide && element.type !== 'circle' && (
        <line
          className="side-highlight"
          data-testid="side-highlight"
          data-side={highlightSide}
          x1={highlightSide === 'right' ? width : 0}
          x2={highlightSide === 'left' ? 0 : width}
          y1={highlightSide === 'bottom' ? height : 0}
          y2={highlightSide === 'top' ? 0 : height}
        />
      )}
      {guides.map((guide) =>
        guide.axis === 'x' ? (
          <line
            key={`guide-x-${guide.targetId}-${guide.position}`}
            className="snap-guide snap-guide-x"
            data-testid="snap-guide"
            x1={guide.position}
            x2={guide.position}
            y1={-pad}
            y2={height + pad}
          />
        ) : (
          <line
            key={`guide-y-${guide.targetId}-${guide.position}`}
            className="snap-guide snap-guide-y"
            data-testid="snap-guide"
            x1={-pad}
            x2={width + pad}
            y1={guide.position}
            y2={guide.position}
          />
        ),
      )}
    </svg>
  )
}