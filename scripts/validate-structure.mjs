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
  "scripts/validate-pr.mjs",
  "tests/validate-pr.test.mjs",
  ".github/workflows/pr-compliance.yml",
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

const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, "package.json"), "utf8"));
const testPrScript = packageJson.scripts?.["test:pr"] || "";
const workflowContents = fs.readFileSync(
  path.join(rootDir, ".github/workflows/pr-compliance.yml"),
  "utf8",
);

if (!testPrScript.includes("node scripts/validate-pr.mjs") || !testPrScript.includes("--dry-run")) {
  errors.push("package.json must define a test:pr script that runs scripts/validate-pr.mjs in dry-run mode.");
} else {
  console.log("  ✓ Found expected package.json test:pr script");
}

if (!packageJson.scripts?.["test:unit"]) {
  errors.push("package.json must define a test:unit script for PR validator coverage.");
} else {
  console.log("  ✓ Found package.json test:unit script");
}

if (!workflowContents.includes("Fail job when PR is not compliant")) {
  errors.push("PR compliance workflow must fail the job when validation reports a non-zero exit code.");
} else {
  console.log("  ✓ PR compliance workflow propagates validation failures");
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
