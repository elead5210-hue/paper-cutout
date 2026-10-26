// FILE: src/circleSnap.ts
/**
 * Pure helpers for circle angular snap points.
 *
 * A circle snaps at fixed angles in 45 degree steps: 0, 45, 90, 135, 180, 225, 270 and 315.
 * The goal text lists the last point as "325", which is read as 315 so that the steps are
 * even. Angles wrap, so 315 and 0 (= 360) are neighbours.
 *
 * Angle convention: degrees, 0 at the right (east) of the circle, increasing
 * counter-clockwise as seen on screen (90 is straight up, 180 is left, 270 is straight down).
 * Screen y grows downward, so the helpers flip y internally.
 *
 * No React, no DOM, no side effects. All coordinates share one space (for example client px).
 */

export interface AnglePoint {
  x: number
  y: number
}

export interface AngleSize {
  width: number
  height: number
}

/** Step between snap points, in degrees. */
export const CIRCLE_SNAP_STEP = 45

/** The fixed snap angles, in degrees. 360 is the same point as 0. */
export const CIRCLE_SNAP_ANGLES: ReadonlyArray<number> = [0, 45, 90, 135, 180, 225, 270, 315]

/** Wrap any angle into the range [0, 360). Returns NaN for non-finite input. */
export function normalizeAngle(degrees: number): number {
  if (!Number.isFinite(degrees)) return NaN
  const wrapped = degrees % 360
  const positive = wrapped < 0 ? wrapped + 360 : wrapped
  // Avoid -0 and values like 360 caused by floating point.
  return positive >= 360 ? 0 : positive + 0
}

/** Smallest absolute difference between two angles, in degrees (0 to 180), wrapping around 360. */
export function angleDifference(a: number, b: number): number {
  const diff = Math.abs(normalizeAngle(a) - normalizeAngle(b))
  return diff > 180 ? 360 - diff : diff
}

/**
 * The snap angle nearest to `degrees`, wrapping around 0/360. For example 350 snaps to 0 and
 * 338 snaps to 315. Exact ties (22.5 degrees past a snap point) go to the smaller snap angle,
 * except across the wrap where 337.5 goes to 315. Returns null for non-finite input.
 */
export function nearestSnapAngle(degrees: number): number | null {
  const angle = normalizeAngle(degrees)
  if (Number.isNaN(angle)) return null

  let best = CIRCLE_SNAP_ANGLES[0]
  let bestDiff = angleDifference(angle, best)
  for (const candidate of CIRCLE_SNAP_ANGLES) {
    const diff = angleDifference(angle, candidate)
    if (diff < bestDiff) {
      best = candidate
      bestDiff = diff
    }
  }
  return best
}

/**
 * Angle of a point as seen from a centre, in degrees in [0, 360), using the convention above.
 * Returns null when the point is on the centre (no direction) or input is not finite.
 */
export function pointerAngle(point: AnglePoint, centre: AnglePoint): number | null {
  const dx = point.x - centre.x
  const dy = point.y - centre.y
  if (!Number.isFinite(dx) || !Number.isFinite(dy)) return null
  if (dx === 0 && dy === 0) return null
  // Flip y so that "up" on screen is a positive angle.
  return normalizeAngle((Math.atan2(-dy, dx) * 180) / Math.PI)
}

/** The snap angle nearest to the pointer as seen from the circle's centre, or null. */
export function nearestCircleSnapAngle(point: AnglePoint, centre: AnglePoint): number | null {
  const angle = pointerAngle(point, centre)
  return angle === null ? null : nearestSnapAngle(angle)
}

/** Remove floating point noise such as 6.1e-15 so positions and tests stay tidy. */
function clean(value: number): number {
  const rounded = Math.round(value * 1e9) / 1e9
  return rounded + 0
}

/** The point on a circle's outline at `degrees`. Returns null for invalid input. */
export function pointOnCircle(
  centre: AnglePoint,
  radius: number,
  degrees: number,
): AnglePoint | null {
  const angle = normalizeAngle(degrees)
  if (![centre.x, centre.y, radius].every(Number.isFinite) || Number.isNaN(angle) || radius < 0) {
    return null
  }
  const rad = (angle * Math.PI) / 180
  return {
    x: clean(centre.x + radius * Math.cos(rad)),
    y: clean(centre.y - radius * Math.sin(rad)),
  }
}

/**
 * Centre position for a new shape placed outside a circle at a snap angle, so that its bounding
 * box touches the circle's outline point at that angle (plus an optional gap). The new shape is
 * pushed outward along the ray from the circle's centre by its half-extent in that direction.
 *
 * Returns null for invalid input (non-finite values or negative sizes).
 */
export function snapCentreToAngle(
  circleCentre: AnglePoint,
  circleRadius: number,
  size: AngleSize,
  degrees: number,
  gap = 0,
): AnglePoint | null {
  const angle = normalizeAngle(degrees)
  const values = [circleCentre.x, circleCentre.y, circleRadius, size.width, size.height, gap]
  if (!values.every(Number.isFinite) || Number.isNaN(angle)) return null
  if (circleRadius < 0 || size.width < 0 || size.height < 0) return null

  const rad = (angle * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  // Half-extent of the new shape's bounding box along the outward direction.
  const halfExtent = (Math.abs(cos) * size.width + Math.abs(sin) * size.height) / 2
  const distance = circleRadius + gap + halfExtent

  return {
    x: clean(circleCentre.x + distance * cos),
    y: clean(circleCentre.y - distance * sin),
  }
}