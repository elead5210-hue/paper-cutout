{
  "tasks": [
    {
      "path": "package.json",
      "action": "modify",
      "description": "Add engines.node pin, add typecheck and verify scripts (tsc --noEmit + npm test), upgrade vite/vitest/jsdom and related dev deps to patched versions, and replace the deprecated whatwg-encoding dependency",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": "package-lock.json",
      "action": "modify",
      "description": "Regenerate lockfile to reflect upgraded dev dependencies, removal of whatwg-encoding and resolved npm audit findings",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": false
    },
    {
      "path": ".nvmrc",
      "action": "modify",
      "description": "Pin Node version consistently with package.json engines and the Dockerfile base image",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": "Dockerfile",
      "action": "modify",
      "description": "Align Node base image tag with the pinned version and run typecheck and tests in the build stage before building",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": ".github/workflows/ci.yml",
      "action": "create",
      "description": "Add CI workflow using .nvmrc that runs npm ci, tsc typecheck, npm test and npm run build, plus npm audit, before deploy",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": "docs/verification.md",
      "action": "modify",
      "description": "Document the pre-deploy verification steps, Node version pin and the npm audit triage outcome",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": "README.md",
      "action": "modify",
      "description": "Note the required Node version and the verify script for local pre-deploy checks",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": false
    }
  ]
}