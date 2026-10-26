// FILE: src/snapping.test.ts
import { describe, expect, it } from "vitest";
import {
  DEFAULT_SNAP_THRESHOLD,
  axisAnchors,
  computeSnapCandidates,
  snapPosition,
  snapShape,
  toAbsoluteRect,
  toRelativePosition,
  type Rect,
  type SnapTarget,
} from "./snapping";

const target = (id: string, bounds: Rect): SnapTarget => ({ id, bounds });

const box: SnapTarget = target("box", { x: 100, y: 100, width: 50, height: 40 });

describe("axisAnchors", () => {
  it("returns start, center and end for the x axis", () => {
    expect(axisAnchors({ x: 10, y: 20, width: 30, height: 40 }, "x")).toEqual([
      { anchor: "start", value: 10 },
      { anchor: "center", value: 25 },
      { anchor: "end", value: 40 },
    ]);
  });

  it("returns start, center and end for the y axis", () => {
    expect(axisAnchors({ x: 10, y: 20, width: 30, height: 40 }, "y")).toEqual([
      { anchor: "start", value: 20 },
      { anchor: "center", value: 40 },
      { anchor: "end", value: 60 },
    ]);
  });
});

describe("computeSnapCandidates", () => {
  it("produces three candidates per axis for each target", () => {
    const candidates = computeSnapCandidates([box]);
    expect(candidates).toHaveLength(6);
    expect(candidates.filter((c) => c.axis === "x").map((c) => c.value)).toEqual([
      100, 125, 150,
    ]);
    expect(candidates.filter((c) => c.axis === "y").map((c) => c.value)).toEqual([
      100, 120, 140,
    ]);
  });

  it("skips excluded ids", () => {
    const other = target("other", { x: 0, y: 0, width: 10, height: 10 });
    const candidates = computeSnapCandidates([box, other], ["box"]);
    expect(candidates.every((c) => c.targetId === "other")).toBe(true);
    expect(candidates).toHaveLength(6);
  });

  it("skips targets with invalid bounds", () => {
    const bad = target("bad", { x: NaN, y: 0, width: 10, height: 10 });
    const negative = target("neg", { x: 0, y: 0, width: -5, height: 10 });
    expect(computeSnapCandidates([bad, negative])).toEqual([]);
  });

  it("returns an empty list when there are no targets", () => {
    expect(computeSnapCandidates([])).toEqual([]);
  });
});

describe("snapShape", () => {
  it("snaps the left edge of the shape to the left edge of a target", () => {
    const result = snapShape({ x: 103, y: 300, width: 20, height: 20 }, [box]);
    expect(result.x).toBe(100);
    expect(result.snappedX).toBe(true);
    expect(result.targetIdX).toBe("box");
    expect(result.snappedY).toBe(false);
    expect(result.y).toBe(300);
    expect(result.guides).toHaveLength(1);
    expect(result.guides[0]).toMatchObject({
      axis: "x",
      position: 100,
      targetId: "box",
      shapeAnchor: "start",
      targetAnchor: "start",
    });
  });

  it("snaps the right edge of the shape to the right edge of a target", () => {
    // shape end = 145 + 10 = 155, target end = 150
    const result = snapShape({ x: 145, y: 500, width: 10, height: 10 }, [box]);
    expect(result.x).toBe(140);
    expect(result.guides[0]).toMatchObject({
      shapeAnchor: "end",
      targetAnchor: "end",
      position: 150,
    });
  });

  it("snaps centers together", () => {
    // shape center x = 118 + 10 = 128 -> target center 125
    const result = snapShape({ x: 118, y: 500, width: 20, height: 20 }, [box]);
    expect(result.x).toBe(115);
    expect(result.guides[0]).toMatchObject({
      shapeAnchor: "center",
      targetAnchor: "center",
    });
  });

  it("snaps to the adjacent side (shape start to target end)", () => {
    const result = snapShape({ x: 153, y: 500, width: 20, height: 20 }, [box]);
    expect(result.x).toBe(150);
    expect(result.guides[0]).toMatchObject({
      shapeAnchor: "start",
      targetAnchor: "end",
    });
  });

  it("snaps both axes to land on a corner", () => {
    const result = snapShape({ x: 102, y: 98, width: 20, height: 20 }, [box]);
    expect(result.x).toBe(100);
    expect(result.y).toBe(100);
    expect(result.snappedX).toBe(true);
    expect(result.snappedY).toBe(true);
    expect(result.guides).toHaveLength(2);
    expect(result.guides.map((g) => g.axis).sort()).toEqual(["x", "y"]);
  });

  it("snaps each axis independently", () => {
    const result = snapShape({ x: 500, y: 142, width: 20, height: 20 }, [box]);
    expect(result.snappedX).toBe(false);
    expect(result.x).toBe(500);
    expect(result.snappedY).toBe(true);
    expect(result.y).toBe(140);
  });

  it("chooses the closest candidate when several are in range", () => {
    const a = target("a", { x: 100, y: 0, width: 10, height: 10 });
    const b = target("b", { x: 104, y: 0, width: 10, height: 10 });
    const result = snapShape({ x: 103, y: 500, width: 5, height: 5 }, [a, b]);
    expect(result.x).toBe(104);
    expect(result.targetIdX).toBe("b");
  });

  it("does not move when the position already aligns", () => {
    const result = snapShape({ x: 100, y: 100, width: 50, height: 40 }, [box]);
    expect(result.x).toBe(100);
    expect(result.y).toBe(100);
    expect(result.snappedX).toBe(true);
    expect(result.snappedY).toBe(true);
  });
});

describe("threshold behavior", () => {
  it("uses the default threshold", () => {
    const within = snapShape(
      { x: 100 + DEFAULT_SNAP_THRESHOLD, y: 500, width: 20, height: 20 },
      [box]
    );
    expect(within.snappedX).toBe(true);

    const outside = snapShape(
      { x: 100 + DEFAULT_SNAP_THRESHOLD + 1, y: 500, width: 20, height: 20 },
      [box]
    );
    // 109 start is 9 from 100 and 16 from center 125 ... nothing in range
    expect(outside.snappedX).toBe(false);
    expect(outside.x).toBe(109);
  });

  it("respects a custom threshold", () => {
    const shape = { x: 103, y: 500, width: 20, height: 20 };
    expect(snapShape(shape, [box], { threshold: 2 }).snappedX).toBe(false);
    expect(snapShape(shape, [box], { threshold: 3 }).snappedX).toBe(true);
  });

  it("snaps only on exact alignment when the threshold is zero", () => {
    expect(
      snapShape({ x: 101, y: 500, width: 20, height: 20 }, [box], { threshold: 0 })
        .snappedX
    ).toBe(false);
    expect(
      snapShape({ x: 100, y: 500, width: 20, height: 20 }, [box], { threshold: 0 })
        .snappedX
    ).toBe(true);
  });

  it("returns the input untouched for a negative threshold", () => {
    const result = snapShape({ x: 101, y: 101, width: 20, height: 20 }, [box], {
      threshold: -1,
    });
    expect(result).toMatchObject({ x: 101, y: 101, snappedX: false, snappedY: false });
  });

  it("returns the input untouched when disabled", () => {
    const result = snapShape({ x: 101, y: 101, width: 20, height: 20 }, [box], {
      enabled: false,
    });
    expect(result).toEqual({
      x: 101,
      y: 101,
      snappedX: false,
      snappedY: false,
      guides: [],
      targetIdX: null,
      targetIdY: null,
    });
  });

  it("ignores excluded targets", () => {
    const result = snapShape({ x: 101, y: 101, width: 20, height: 20 }, [box], {
      excludeIds: ["box"],
    });
    expect(result.snappedX).toBe(false);
    expect(result.snappedY).toBe(false);
  });

  it("returns the input untouched when there are no targets", () => {
    const result = snapShape({ x: 5, y: 6, width: 20, height: 20 }, []);
    expect(result).toMatchObject({ x: 5, y: 6, snappedX: false, snappedY: false });
    expect(result.guides).toEqual([]);
  });

  it("returns the input untouched for an invalid shape", () => {
    const result = snapShape({ x: NaN, y: 0, width: 10, height: 10 }, [box]);
    expect(result.snappedX).toBe(false);
    expect(result.snappedY).toBe(false);
  });
});

describe("snapPosition", () => {
  it("behaves like snapShape using a separate position and size", () => {
    const result = snapPosition({ x: 103, y: 98 }, { width: 20, height: 20 }, [box]);
    expect(result.x).toBe(100);
    expect(result.y).toBe(100);
  });
});

describe("nested-child coordinate handling", () => {
  const parentOrigin = { x: 200, y: 100 };

  it("converts a relative rect to absolute space", () => {
    expect(
      toAbsoluteRect({ x: 10, y: 20, width: 30, height: 40 }, parentOrigin)
    ).toEqual({ x: 210, y: 120, width: 30, height: 40 });
  });

  it("converts an absolute position back to relative space", () => {
    expect(toRelativePosition({ x: 210, y: 120 }, parentOrigin)).toEqual({
      x: 10,
      y: 20,
    });
  });

  it("round-trips between relative and absolute coordinates", () => {
    const relative = { x: 7, y: -3, width: 12, height: 9 };
    const absolute = toAbsoluteRect(relative, parentOrigin);
    expect(toRelativePosition(absolute, parentOrigin)).toEqual({ x: 7, y: -3 });
  });

  it("snaps a nested child to a sibling and returns a parent-relative position", () => {
    // Sibling lives at relative (50, 30) inside the parent -> absolute (250, 130).
    const sibling = target(
      "sibling",
      toAbsoluteRect({ x: 50, y: 30, width: 40, height: 40 }, parentOrigin)
    );

    // New child dropped at relative (53, 33) -> absolute (253, 133).
    const childAbsolute = toAbsoluteRect(
      { x: 53, y: 33, width: 20, height: 20 },
      parentOrigin
    );

    const result = snapShape(childAbsolute, [sibling]);
    expect(result.x).toBe(250);
    expect(result.y).toBe(130);

    const relative = toRelativePosition(result, parentOrigin);
    expect(relative).toEqual({ x: 50, y: 30 });
  });

  it("snaps a nested child to the parent's own bounds", () => {
    const parent = target("parent", { x: 200, y: 100, width: 200, height: 150 });
    const childAbsolute = toAbsoluteRect(
      { x: 4, y: 3, width: 20, height: 20 },
      parentOrigin
    );

    const result = snapShape(childAbsolute, [parent]);
    expect(result.targetIdX).toBe("parent");
    expect(result.targetIdY).toBe("parent");
    expect(toRelativePosition(result, parentOrigin)).toEqual({ x: 0, y: 0 });
  });
});