{
  "tasks": [
    {
      "path": "package.json",
      "action": "modify",
      "description": "Replace corrupted content (curly quotes and stray {\"file\": ...} wrapper) with valid JSON: straight quotes, correct name, scripts (dev/build/test/preview) and dependencies for the Vite + React + TypeScript + Vitest app.",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": false
    },
    {
      "path": "package-lock.json",
      "action": "modify",
      "description": "Regenerate the lockfile from the repaired package.json so `npm ci` finds it in sync (name, version and dependency ranges match).",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": false
    }
  ]
}