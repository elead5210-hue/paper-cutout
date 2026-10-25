import type { ShapeDef } from '../shapes'

const STROKE = 0.3 // mm. Stroke is centred on the outline; the viewBox is padded so nothing clips.

interface Props {
  shape: ShapeDef
  values: Record<string, number>
}

export default function ShapeCanvas({ shape, values }: Props) {
  const { width, height, element } = shape.build(values)
  const pad = STROKE / 2
  const w = width + STROKE
  const h = height + STROKE

  const label = `${shape.label}: ` +
    shape.fields.map((f) => `${f.label} ${values[f.key]}${f.unit ? ` ${f.unit}` : ''}`).join(', ')

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
    </svg>
  )
}
