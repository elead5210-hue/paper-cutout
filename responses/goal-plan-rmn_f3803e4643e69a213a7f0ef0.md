{
  "tasks": [
    {
      "path": "src/snapping.ts",
      "action": "modify",
      "description": "In findBestAxisMatch, only compare a shape anchor with the candidate of the same anchor (start-start, center-center, end-end) instead of every anchor pair.",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    }
  ]
}