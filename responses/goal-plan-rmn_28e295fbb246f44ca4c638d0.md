{
  "tasks": [
    {
      "path": "src/components/CursorPreview.tsx",
      "action": "create",
      "description": "Add a component that renders the armed shape's drawing at the pointer position and follows mouse movement over the work area.",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": "src/App.tsx",
      "action": "modify",
      "description": "Hold the armed (selected-for-placement) shape id in state, set it from the toolbar and clear it on placement or cancel, and pass it to the work area.",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": "src/components/ShapeToolbar.tsx",
      "action": "modify",
      "description": "Mark the armed shape's button as pressed and report clicks so the shape becomes the one following the cursor.",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": "src/components/WorkArea.tsx",
      "action": "modify",
      "description": "Track pointer position over the work area, render the cursor preview for the armed shape, and place the shape on click or cancel on Escape.",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": "src/styles.css",
      "action": "modify",
      "description": "Add styles for the cursor preview (absolute positioning, semi-transparent, pointer-events none) and the pressed toolbar button state.",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": "src/App.test.tsx",
      "action": "modify",
      "description": "Update existing placement tests for the new arm-then-place flow and add tests that the preview appears, follows the pointer, and disappears after placement or Escape.",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": "docs/verification.md",
      "action": "modify",
      "description": "Document manual verification steps for the cursor-following shape preview.",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    }
  ]
}