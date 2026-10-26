{
  "tasks": [
    {
      "path": "src/hoverSide.ts",
      "action": "create",
      "description": "Add a pure helper that, given a pointer position and an object's bounds, returns the nearest side (top/right/bottom/left) within a hover threshold, or null.",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": "src/hoverSide.test.ts",
      "action": "create",
      "description": "Add unit tests for the nearest-side hit-testing helper (each side, corners, threshold, outside).",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": "src/components/WorkArea.tsx",
      "action": "modify",
      "description": "While a shape is armed, compute the hovered side of the existing object under the pointer from measured bounds, store it as state, and pass it to that object's canvas for highlighting.",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": "src/components/ShapeCanvas.tsx",
      "action": "modify",
      "description": "Accept an optional highlighted side and draw a highlight line along that side of the shape's bounding box.",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": "src/styles.css",
      "action": "modify",
      "description": "Add styles for the hovered-side highlight line, visible in light and dark themes.",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": "src/App.test.tsx",
      "action": "modify",
      "description": "Add UI tests that a side highlight appears on a hovered existing object while armed and disappears when unarmed or the pointer leaves.",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": "docs/verification.md",
      "action": "modify",
      "description": "Document manual verification steps for the hovered snap side highlight.",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    }
  ]
}