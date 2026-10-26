{
  "tasks": [
    {
      "path": "index.html",
      "action": "modify",
      "description": "Change the page title from the generic 'Shape viewer' to 'paper-cutout' so the deployed site is identifiable",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    },
    {
      "path": "docs/verification.md",
      "action": "modify",
      "description": "Update the automated checks table for the final commit, add production-build steps (`npm run build`, then `npm run preview`) and a page-title check to the checklist, and leave the browser result fields for the tester to fill in",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    }
  ]
}