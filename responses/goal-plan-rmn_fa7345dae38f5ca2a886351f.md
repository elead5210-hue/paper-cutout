{
  "tasks": [
    {
      "path": "src/circleSnap.test.ts",
      "action": "modify",
      "description": "Change the wrap-around assertion so nearestSnapAngle(338) expects 0 (338 is closer to 360 than to 315), or use 336 for the 315 case.",
      "needsFileContent": true,
      "needsMetadata": false,
      "confident": true
    }
  ]
}