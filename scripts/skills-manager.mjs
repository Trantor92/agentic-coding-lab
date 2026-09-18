#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const skillsDir = path.join(rootDir, "skills");
const lockFile = path.join(rootDir, "skills-lock.json");

const targetDirs = [
  { parent: ".agents", symlink: ".agents/skills", target: "../skills" },
  { parent: ".github", symlink: ".github/skills", target: "../skills" },
  { parent: ".claude", symlink: ".claude/skills", target: "../skills" },
];

/**
 * Synchronize skill symlinks across all agent directories.
 */
export function syncSkills() {
  console.log("🔗 Synchronizing agent skills symlinks...");

  if (!fs.existsSync(skillsDir)) {
    throw new Error(`Skills source directory does not exist: ${skillsDir}`);
  }

  for (const { parent, symlink, target } of targetDirs) {
    const parentPath = path.join(rootDir, parent);
    const symlinkPath = path.join(rootDir, symlink);

    if (!fs.existsSync(parentPath)) {
      fs.mkdirSync(parentPath, { recursive: true });
    }

    try {
      const stat = fs.lstatSync(symlinkPath);
      if (stat.isSymbolicLink() || stat.isDirectory() || stat.isFile()) {
        fs.unlinkSync(symlinkPath);
      }
    } catch {
      // File does not exist, continue
    }

    fs.symlinkSync(target, symlinkPath, "junction");
    console.log(`  ✓ Linked ${symlink} -> ${target}`);
  }

  console.log("✅ Skills symlinks synchronized successfully.");
}

/**
 * Verify integrity of skills symlinks and skills-lock.json.
 */
export function verifySkills() {
  console.log("🔍 Verifying skills integrity...");
  const errors = [];

  if (!fs.existsSync(skillsDir)) {
    errors.push(`Missing skills directory: ${skillsDir}`);
  }

  for (const { symlink } of targetDirs) {
    const symlinkPath = path.join(rootDir, symlink);
    try {
      const lstat = fs.lstatSync(symlinkPath);
      if (!lstat.isSymbolicLink()) {
        errors.push(`${symlink} exists but is not a symbolic link`);
        continue;
      }

      // Check if destination exists
      if (!fs.existsSync(symlinkPath)) {
        errors.push(`${symlink} symlink is broken (target does not resolve)`);
      }
    } catch {
      errors.push(`Missing expected symlink: ${symlink}`);
    }
  }

  if (fs.existsSync(lockFile)) {
    try {
      const lockData = JSON.parse(fs.readFileSync(lockFile, "utf8"));
      const skillsInLock = Object.keys(lockData.skills || lockData || {});
      for (const skillName of skillsInLock) {
        const skillPath = path.join(skillsDir, skillName);
        if (!fs.existsSync(skillPath)) {
          errors.push(`Skill '${skillName}' defined in lockfile missing from skills/`);
        }
      }
    } catch (err) {
      errors.push(`Invalid skills-lock.json: ${err.message}`);
    }
  }

  if (errors.length > 0) {
    console.error("❌ Skills verification failed:");
    for (const error of errors) {
      console.error(`  - ${error}`);
    }
    process.exit(1);
  }

  console.log("✅ All skills and symlinks verified successfully.");
}

/**
 * Update vendor skills and re-synchronize.
 */
export function updateSkills() {
  console.log("📦 Updating vendor skills via npx skills@latest update...");
  execSync("npx skills@latest update", { stdio: "inherit", cwd: rootDir });
  syncSkills();
  verifySkills();
}

const command = process.argv[2] || "verify";

switch (command) {
  case "sync":
    syncSkills();
    break;
  case "verify":
    verifySkills();
    break;
  case "update":
    updateSkills();
    break;
  default:
    console.error(`Unknown command: ${command}. Use 'sync', 'verify', or 'update'.`);
    process.exit(1);
}
