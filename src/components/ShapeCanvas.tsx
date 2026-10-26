import type { ShapeDef } from '../shapes'
import type { SnapGuide } from '../snapping'

const STROKE = 0.3 // mm. Stroke is centred on the outline; the viewBox is padded so nothing clips.

interface Props {
  shape: ShapeDef
  values: Record<string, number>
  /**
   * Snap guides to draw, in the same mm coordinate space as this canvas's
   * viewBox (origin at the shape's top-left). Omit or pass empty for none.
   */
  guides?: ReadonlyArray<SnapGuide>
}

export default function ShapeCanvas({ shape, values, guides = [] }: Props) {
  const { width, height, element } = shape.build(values)
  const pad = STROKE / 2
  const w = width + STROKE
  const h = height + STROKE

  const label = shape.describe(values)

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