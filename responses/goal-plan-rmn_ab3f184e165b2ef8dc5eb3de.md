{
  "tasks": [
    {
      "path": ".dockerignore",
      "action": "modify",
      "description": "Remove stray `// FILE:` header line so ignore rules apply correctly",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": ".nvmrc",
      "action": "modify",
      "description": "Remove stray `// FILE:` header line so the Node version pin is valid",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": "src/sideSnap.ts",
      "action": "modify",
      "description": "Remove stray `// FILE:` header line",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": "src/snapping.ts",
      "action": "modify",
      "description": "Remove stray `// FILE:` header line",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": "src/circleSnap.ts",
      "action": "modify",
      "description": "Remove stray `// FILE:` header line",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": "src/hoverSide.ts",
      "action": "modify",
      "description": "Remove stray `// FILE:` header line",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": "src/components/CursorPreview.tsx",
      "action": "modify",
      "description": "Remove stray `// FILE:` header line",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": "src/sideSnap.test.ts",
      "action": "modify",
      "description": "Remove stray `// FILE:` header and fix the syntax error around line 26 that breaks tsc",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": "src/snapping.test.ts",
      "action": "modify",
      "description": "Remove stray `// FILE:` header line",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": "src/circleSnap.test.ts",
      "action": "modify",
      "description": "Remove stray `// FILE:` header line",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": "src/hoverSide.test.ts",
      "action": "modify",
      "description": "Remove stray `// FILE:` header line",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    }
  ]
}