{
  "tasks": [
    {
      "path": "src/circleSnap.ts",
      "action": "create",
      "description": "Add pure helpers for circle snap points: the fixed angle list (0, 45, 90, 135, 180, 225, 270, 315 with wrap-around back to 0/360), nearest-angle lookup from a pointer position with wrap-around, and the point and outward placement position for a new shape at a given angle.",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": "src/circleSnap.test.ts",
      "action": "create",
      "description": "Add unit tests for the angle list, nearest-angle selection (including wrap-around near 0/360), pointer-to-angle conversion, and placement positions at each snap angle.",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": "src/components/WorkArea.tsx",
      "action": "modify",
      "description": "When the hovered existing object is a circle, compute the nearest snap angle from the pointer and the circle's measured bounds, store it as hover state, and use it (instead of a side) to compute the placement position on click.",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": "src/components/ShapeCanvas.tsx",
      "action": "modify",
      "description": "Accept an optional highlighted snap angle for circles and draw a marker on the circle's outline at that angle instead of a side line.",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": "src/styles.css",
      "action": "modify",
      "description": "Add styles for the circle snap-angle marker, visible in light and dark themes.",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": "src/App.test.tsx",
      "action": "modify",
      "description": "Add UI tests that hovering a circle while armed marks the nearest fixed angle, that clicking places the new shape at that angle, and that non-circle shapes still use side snapping.",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": "docs/verification.md",
      "action": "modify",
      "description": "Document manual verification steps for circle angular snap points, including wrap-around between 315 and 0/360 degrees.",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    }
  ]
}