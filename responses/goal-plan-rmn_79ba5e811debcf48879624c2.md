{
  "tasks": [
    {
      "path": "src/sideSnap.ts",
      "action": "create",
      "description": "Add a pure helper that computes the position of a new shape so that its facing side sits flush against the chosen side of an existing object's bounds.",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": "src/sideSnap.test.ts",
      "action": "create",
      "description": "Add unit tests for flush placement against each side (top, right, bottom, left) and for the alignment of the cross axis.",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": "src/placed.ts",
      "action": "modify",
      "description": "Add an optional position field to PlacedShape so a snapped shape can store where it was placed relative to the canvas centre.",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": "src/component.ts",
      "action": "modify",
      "description": "Allow createComponent to accept an optional initial position for the new shape.",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": "src/components/WorkArea.tsx",
      "action": "modify",
      "description": "On the second click while a side is highlighted, compute the snapped position from the hovered object's measured bounds and the armed shape's size, and report it when placing; also apply stored positions when rendering placed shapes.",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": "src/App.tsx",
      "action": "modify",
      "description": "Accept the optional snapped position from the work area when placing the armed shape and pass it to createComponent.",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": "src/styles.css",
      "action": "modify",
      "description": "Let placed shapes be offset from the centre using CSS custom properties for their stored position.",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": "src/App.test.tsx",
      "action": "modify",
      "description": "Add UI tests that clicking while a side is highlighted places the new shape flush against that side, and that clicking with no highlight places it at the default position.",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": "docs/verification.md",
      "action": "modify",
      "description": "Document manual verification steps for clicking to snap the new shape to the highlighted side.",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    }
  ]
}