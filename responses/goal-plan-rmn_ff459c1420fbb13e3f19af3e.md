{
  "tasks": [
    {
      "path": "src/snapping.ts",
      "action": "create",
      "description": "Add pure snapping helpers that compute snap candidates (edges, centers, corners) from existing objects and return the snapped position for a newly placed shape.",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": "src/snapping.test.ts",
      "action": "create",
      "description": "Add unit tests for snap-candidate calculation, threshold behavior, and nested-child coordinate handling.",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": "src/placed.ts",
      "action": "modify",
      "description": "Extend placed-shape logic to apply snapping when a new shape is added as a nested child in the component tree and store the snapped position/anchor.",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": "src/component.ts",
      "action": "modify",
      "description": "Add component-tree helpers to look up existing objects and resolve a new child's position relative to its parent for snap targeting.",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": "src/components/ShapeCanvas.tsx",
      "action": "modify",
      "description": "Apply snapping during placement/drag of a new shape and render snap guide indicators on the canvas.",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": "src/components/WorkArea.tsx",
      "action": "modify",
      "description": "Wire snap state and the snap on/off setting between toolbar, canvas, and component tree when a shape is placed.",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": "src/components/ShapeToolbar.tsx",
      "action": "modify",
      "description": "Add a toggle control to enable or disable snapping to existing objects.",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": "src/App.tsx",
      "action": "modify",
      "description": "Hold snapping-enabled state and pass it down to the toolbar and work area.",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": "src/styles.css",
      "action": "modify",
      "description": "Add styles for snap guide lines and the snap toggle control.",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": "src/component.test.ts",
      "action": "modify",
      "description": "Add tests covering new component-tree lookup/relative-position helpers used by snapping.",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": "src/App.test.tsx",
      "action": "modify",
      "description": "Add a UI test verifying a newly placed nested shape snaps to an existing object and the toggle disables snapping.",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": "docs/verification.md",
      "action": "modify",
      "description": "Document manual verification steps for snapping new shapes to existing objects.",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    }
  ]
}