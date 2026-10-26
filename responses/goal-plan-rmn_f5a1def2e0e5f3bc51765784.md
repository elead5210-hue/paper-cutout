{
  "tasks": [
    {
      "path": "deploy-manager.json",
      "action": "create",
      "description": "Add Deploy-Manager manifest declaring a static site with Node 18+, install command `npm install`, build command `npm run build`, and output directory `dist`, plus SPA fallback to index.html",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": ".nvmrc",
      "action": "create",
      "description": "Pin the Node.js version used for builds (18 or newer, e.g. 20)",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": "vite.config.ts",
      "action": "modify",
      "description": "Set base to './' so built asset paths are relative and work at any deployment URL or sub-path",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": "package.json",
      "action": "modify",
      "description": "Add an `engines` field requiring Node >=18 so the deploy environment matches the README requirement",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": ".gitignore",
      "action": "modify",
      "description": "Keep node_modules and dist ignored, add a trailing newline and common extras (logs, .env, .DS_Store)",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": "README.md",
      "action": "modify",
      "description": "Add a Deployment section covering Deploy-Manager setup, Node version, build steps, dist/ output, base path, and local production preview, and list the new files in the project structure",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    }
  ]
}