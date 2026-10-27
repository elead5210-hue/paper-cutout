// FILE: scripts/validate-config.mjs
// Validates that key JSON config files are real JSON before install/build/deploy.
// Usage: node scripts/validate-config.mjs [file ...]
// Defaults to package.json, package-lock.json, deploy-manager.json and tsconfig.json
// (tsconfig.json is allowed to contain comments and trailing commas).

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const DEFAULT_FILES = [
  "package.json",
  "package-lock.json",
  "deploy-manager.json",
  "tsconfig.json",
];

// Files that legitimately use JSONC (comments / trailing commas).
const JSONC_FILES = new Set(["tsconfig.json"]);

// Typographic characters that editors and word processors silently substitute.
const SMART_CHARS = {
  "\u201C": "left curly double quote (\u201C)",
  "\u201D": "right curly double quote (\u201D)",
  "\u2018": "left curly single quote (\u2018)",
  "\u2019": "right curly single quote (\u2019)",
  "\u00A0": "non-breaking space",
  "\u2013": "en dash (\u2013)",
  "\u2014": "em dash (\u2014)",
  "\uFEFF": "byte order mark",
};

function stripJsonc(text) {
  let out = "";
  let inString = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (inString) {
      out += ch;
      if (ch === "\\") {
        out += next ?? "";
        i++;
      } else if (ch === '"') {
        inString = false;
      }
    } else if (ch === '"') {
      inString = true;
      out += ch;
    } else if (ch === "/" && next === "/") {
      while (i < text.length && text[i] !== "\n") i++;
      out += "\n";
    } else if (ch === "/" && next === "*") {
      i += 2;
      while (i < text.length && !(text[i] === "*" && text[i + 1] === "/")) i++;
      i++;
    } else {
      out += ch;
    }
  }
  return out.replace(/,(\s*[}\]])/g, "$1");
}

function findSmartChars(text) {
  const hits = [];
  const lines = text.split(/\r?\n/);
  lines.forEach((line, idx) => {
    for (let col = 0; col < line.length; col++) {
      const name = SMART_CHARS[line[col]];
      if (name) hits.push({ line: idx + 1, col: col + 1, name });
    }
  });
  return hits;
}

function validate(file) {
  const path = resolve(process.cwd(), file);
  if (!existsSync(path)) return { skipped: true, errors: [] };

  const raw = readFileSync(path, "utf8");
  const errors = [];

  const smart = findSmartChars(raw);
  for (const hit of smart.slice(0, 5)) {
    errors.push(`${hit.line}:${hit.col} contains a ${hit.name}; use plain ASCII characters.`);
  }
  if (smart.length > 5) errors.push(`...and ${smart.length - 5} more typographic character(s).`);

  const text = JSONC_FILES.has(file) ? stripJsonc(raw) : raw;
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    errors.push(`Invalid JSON: ${err.message}`);
  }

  if (parsed && file === "package.json") {
    if (typeof parsed.name !== "string" || !parsed.name) {
      errors.push('package.json is missing a string "name" field.');
    }
    if (!parsed.scripts || typeof parsed.scripts.build !== "string") {
      errors.push('package.json is missing a "scripts.build" entry.');
    }
  }

  return { skipped: false, errors };
}

const args = process.argv.slice(2);
const files = args.length > 0 ? args : DEFAULT_FILES;

let failed = false;
for (const file of files) {
  const { skipped, errors } = validate(file);
  if (skipped) {
    if (args.length > 0) {
      console.error(`FAIL ${file}: file not found`);
      failed = true;
    }
    continue;
  }
  if (errors.length > 0) {
    failed = true;
    console.error(`FAIL ${file}`);
    for (const message of errors) console.error(`  - ${message}`);
  } else {
    console.log(`ok   ${file}`);
  }
}

if (failed) {
  console.error(
    "\nConfig validation failed. Edit these files in a plain-text or code editor " +
      "(not a word processor or chat app) so quotes are not turned into curly quotes."
  );
  process.exit(1);
}