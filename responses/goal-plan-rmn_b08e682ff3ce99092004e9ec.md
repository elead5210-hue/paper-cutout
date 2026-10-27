{
  "tasks": [
    {
      "path": "src/components/WorkArea.tsx",
      "action": "modify",
      "description": "Rewrite the empty file as the default-exported WorkArea component: centre point, placed shapes centred and selectable, cursor preview while armed, and snapping on placement via snapping, sideSnap, circleSnap and hoverSide.",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": "src/styles.css",
      "action": "modify",
      "description": "Add or adjust work-area styles (centre point, centred shape positioning, cursor preview, snap guides) only if the restored component needs classes not already defined.",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": false
    }
  ]
}