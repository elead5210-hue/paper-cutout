{
  "tasks": [
    {
      "path": "deploy-manager.json",
      "action": "delete",
      "description": "Remove the stray manifest, since Deploy-Manager builds the Dockerfile and the README says no separate manifest exists.",
      "needsFileContent": false,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": "src/components/ShapeSelect.tsx",
      "action": "delete",
      "description": "Remove the unused ShapeSelect component, which nothing imports.",
      "needsFileContent": false,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": "README.md",
      "action": "modify",
      "description": "Update the project structure and how-it-works sections to list snapping, sideSnap, circleSnap, hoverSide and CursorPreview and describe the arm-then-click-to-place flow; drop ShapeSelect.",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    }
  ]
}