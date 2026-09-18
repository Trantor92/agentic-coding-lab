#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { verifySkills } from "./skills-manager.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const requiredFiles = [
  "README.md",
  "CONTRIBUTING.md",
  "LICENSE",
  ".github/PULL_REQUEST_TEMPLATE.md",
  "CONTEXT.md",
  "AGENTS.md",
  "package.json",
];

console.log("🏗️  Validating project structure and invariants...");

const errors = [];

for (const relPath of requiredFiles) {
  const fullPath = path.join(rootDir, relPath);
  if (!fs.existsSync(fullPath)) {
    errors.push(`Missing required file: ${relPath}`);
  } else {
    console.log(`  ✓ Found ${relPath}`);
  }
}

if (errors.length > 0) {
  console.error("❌ Structure validation failed:");
  for (const err of errors) {
    console.error(`  - ${err}`);
  }
  process.exit(1);
}

// Check skills integrity
try {
  verifySkills();
} catch (err) {
  console.error("❌ Skills verification check failed:", err.message);
  process.exit(1);
}

console.log("✅ Project structure and required files verified successfully.");
