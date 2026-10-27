/**
 * Pure snapping helpers.
 *
 * Given a newly placed shape's bounds and the bounds of existing objects,
 * compute snap candidates (edges, centers, corners) and return the snapped
 * position for the new shape. No React, no DOM, no side effects.
 *
 * All coordinates are expressed in a single shared coordinate space
 * (callers are responsible for converting nested-child coordinates into the
 * same space before calling these helpers).
 */

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SnapTarget {
  id: string;
  bounds: Rect;
}

export type SnapAxis = "x" | "y";

export type SnapAnchor = "start" | "center" | "end";

export interface SnapGuide {
  /** Axis the guide is locked to: "x" = vertical line, "y" = horizontal line. */
  axis: SnapAxis;
  /** Coordinate of the guide line on its axis. */
  position: number;
  /** Id of the target object the shape snapped to. */
  targetId: string;
  /** Which part of the moving shape aligned with the target. */
  shapeAnchor: SnapAnchor;
  /** Which part of the target the shape aligned with. */
  targetAnchor: SnapAnchor;
}

export interface SnapOptions {
  /** Maximum distance (in canvas units) at which snapping engages. */
  threshold?: number;
  /** Master switch; when false the input position is returned untouched. */
  enabled?: boolean;
  /** Ids to ignore as snap targets (e.g. the shape being placed). */
  excludeIds?: ReadonlyArray<string>;
}

export interface SnapResult {
  x: number;
  y: number;
  snappedX: boolean;
  snappedY: boolean;
  guides: SnapGuide[];
  /** Id of the object snapped to on each axis, if any. */
  targetIdX: string | null;
  targetIdY: string | null;
}

export const DEFAULT_SNAP_THRESHOLD = 8;

export interface SnapCandidate {
  axis: SnapAxis;
  value: number;
  targetId: string;
  targetAnchor: SnapAnchor;
}

/** Return the three anchor values (start, center, end) of a rect on one axis. */
export function axisAnchors(
  rect: Rect,
  axis: SnapAxis
): Array<{ anchor: SnapAnchor; value: number }> {
  const start = axis === "x" ? rect.x : rect.y;
  const size = axis === "x" ? rect.width : rect.height;
  return [
    { anchor: "start", value: start },
    { anchor: "center", value: start + size / 2 },
    { anchor: "end", value: start + size },
  ];
}

/**
 * Compute every snap candidate (edges and centers on both axes) provided by
 * the given targets. Corners are the intersection of an x edge and a y edge,
 * so snapping on both axes at once yields corner snapping.
 */
export function computeSnapCandidates(
  targets: ReadonlyArray<SnapTarget>,
  excludeIds: ReadonlyArray<string> = []
): SnapCandidate[] {
  const excluded = new Set(excludeIds);
  const candidates: SnapCandidate[] = [];

  for (const target of targets) {
    if (excluded.has(target.id)) continue;
    if (!isValidRect(target.bounds)) continue;

    for (const axis of ["x", "y"] as const) {
      for (const { anchor, value } of axisAnchors(target.bounds, axis)) {
        candidates.push({
          axis,
          value,
          targetId: target.id,
          targetAnchor: anchor,
        });
      }
    }
  }

  return candidates;
}

interface AxisMatch {
  /** Delta to add to the shape position on this axis. */
  delta: number;
  distance: number;
  guide: SnapGuide;
}

/** Find the closest candidate on one axis within the threshold, if any. */
function findBestAxisMatch(
  shape: Rect,
  axis: SnapAxis,
  candidates: ReadonlyArray<SnapCandidate>,
  threshold: number
): AxisMatch | null {
  const shapeAnchors = axisAnchors(shape, axis);
  let best: AxisMatch | null = null;

  for (const candidate of candidates) {
    if (candidate.axis !== axis) continue;

    for (const { anchor, value } of shapeAnchors) {
      const delta = candidate.value - value;
      const distance = Math.abs(delta);
      if (distance > threshold) continue;

      if (best === null || distance < best.distance) {
        best = {
          delta,
          distance,
          guide: {
            axis,
            position: candidate.value,
            targetId: candidate.targetId,
            shapeAnchor: anchor,
            targetAnchor: candidate.targetAnchor,
          },
        };
      }
    }
  }

  return best;
}

/**
 * Snap a newly placed shape to the closest edge / center / corner of the
 * existing objects. Each axis snaps independently; when both axes snap the
 * shape lands exactly on a corner/center intersection.
 */
export function snapShape(
  shape: Rect,
  targets: ReadonlyArray<SnapTarget>,
  options: SnapOptions = {}
): SnapResult {
  const {
    threshold = DEFAULT_SNAP_THRESHOLD,
    enabled = true,
    excludeIds = [],
  } = options;

  const unsnapped: SnapResult = {
    x: shape.x,
    y: shape.y,
    snappedX: false,
    snappedY: false,
    guides: [],
    targetIdX: null,
    targetIdY: null,
  };

  if (!enabled || threshold < 0 || !isValidRect(shape)) {
    return unsnapped;
  }

  const candidates = computeSnapCandidates(targets, excludeIds);
  if (candidates.length === 0) return unsnapped;

  const matchX = findBestAxisMatch(shape, "x", candidates, threshold);
  const matchY = findBestAxisMatch(shape, "y", candidates, threshold);

  const guides: SnapGuide[] = [];
  if (matchX) guides.push(matchX.guide);
  if (matchY) guides.push(matchY.guide);

  return {
    x: matchX ? shape.x + matchX.delta : shape.x,
    y: matchY ? shape.y + matchY.delta : shape.y,
    snappedX: matchX !== null,
    snappedY: matchY !== null,
    guides,
    targetIdX: matchX ? matchX.guide.targetId : null,
    targetIdY: matchY ? matchY.guide.targetId : null,
  };
}

/**
 * Convenience wrapper: snap a position given the shape's size.
 */
export function snapPosition(
  position: { x: number; y: number },
  size: { width: number; height: number },
  targets: ReadonlyArray<SnapTarget>,
  options: SnapOptions = {}
): SnapResult {
  return snapShape(
    { x: position.x, y: position.y, width: size.width, height: size.height },
    targets,
    options
  );
}

/**
 * Convert a rect expressed relative to a parent into the shared (absolute)
 * coordinate space, given the parent's absolute origin.
 */
export function toAbsoluteRect(
  relative: Rect,
  parentOrigin: { x: number; y: number }
): Rect {
  return {
    x: relative.x + parentOrigin.x,
    y: relative.y + parentOrigin.y,
    width: relative.width,
    height: relative.height,
  };
}

/**
 * Convert an absolute position back to a position relative to a parent origin.
 */
export function toRelativePosition(
  absolute: { x: number; y: number },
  parentOrigin: { x: number; y: number }
): { x: number; y: number } {
  return {
    x: absolute.x - parentOrigin.x,
    y: absolute.y - parentOrigin.y,
  };
}

function isValidRect(rect: Rect): boolean {
  return (
    Number.isFinite(rect.x) &&
    Number.isFinite(rect.y) &&
    Number.isFinite(rect.width) &&
    Number.isFinite(rect.height) &&
    rect.width >= 0 &&
    rect.height >= 0
  );
}