#!/usr/bin/env node

import { execFileSync } from "node:child_process";

export function checkNodeVersion(versionStr = process.version) {
  const match = versionStr.match(/^v?(\d+)/);
  const major = match ? parseInt(match[1], 10) : 0;
  return {
    name: "Node.js (>= v20)",
    passed: major >= 20,
    current: versionStr,
    required: ">= v20.0.0",
  };
}

export function checkGit() {
  try {
    const out = execFileSync("git", ["--version"], { encoding: "utf8" }).trim();
    return {
      name: "Git CLI",
      passed: true,
      current: out,
    };
  } catch {
    return {
      name: "Git CLI",
      passed: false,
      error: "git is not installed or not available in PATH.",
    };
  }
}

export function checkGhCli() {
  try {
    const ver = execFileSync("gh", ["--version"], { encoding: "utf8" }).split("\n")[0].trim();
    const authStatus = execFileSync("gh", ["auth", "status"], { encoding: "utf8", stdio: "pipe" });
    return {
      name: "GitHub CLI (gh)",
      passed: true,
      current: `${ver} (authenticated)`,
    };
  } catch (err) {
    // gh auth status might output to stderr
    if (err.stderr && err.stderr.includes("Logged in to")) {
      return {
        name: "GitHub CLI (gh)",
        passed: true,
        current: "gh authenticated",
      };
    }
    return {
      name: "GitHub CLI (gh)",
      passed: false,
      error: "gh is not authenticated or not installed. Run `gh auth login`.",
    };
  }
}

export function checkAgentCli() {
  let copilotPassed = false;
  let claudePassed = false;
  let details = [];

  try {
    const copilotOut = execFileSync("copilot", ["--version"], { encoding: "utf8" }).trim();
    copilotPassed = true;
    details.push(`Copilot CLI (${copilotOut})`);
  } catch {
    // copilot not found
  }

  try {
    const claudeOut = execFileSync("claude", ["--version"], { encoding: "utf8" }).trim();
    claudePassed = true;
    details.push(`Claude Code (${claudeOut})`);
  } catch {
    // claude not found
  }

  return {
    name: "Agent CLI (copilot or claude)",
    passed: copilotPassed || claudePassed,
    current: details.length > 0 ? details.join(", ") : "None found",
    error: !(copilotPassed || claudePassed)
      ? "Neither `copilot` nor `claude` CLI found in PATH. Install GitHub Copilot CLI or Claude Code."
      : undefined,
  };
}

export function runAllPrerequisiteChecks() {
  console.log("🔍 Verifying Self-Hosted Runner Environment Prerequistes...\n");

  const checks = [
    checkNodeVersion(),
    checkGit(),
    checkGhCli(),
    checkAgentCli(),
  ];

  let allPassed = true;

  for (const check of checks) {
    if (check.passed) {
      console.log(`  ✅ ${check.name}: ${check.current || "OK"}`);
    } else {
      console.log(`  ❌ ${check.name}: FAILED`);
      if (check.error) console.log(`     👉 ${check.error}`);
      if (check.required) console.log(`     👉 Required: ${check.required}, Current: ${check.current}`);
      allPassed = false;
    }
  }

  console.log("");
  if (allPassed) {
    console.log("🎉 All runner prerequisites are satisfied! Ready to accept agent jobs.");
    return 0;
  } else {
    console.error("⚠️ Some prerequisites are missing. Please resolve them before starting the self-hosted runner.");
    return 1;
  }
}

if (process.argv[1] && process.argv[1].endsWith("check-runner-prerequisites.mjs")) {
  process.exit(runAllPrerequisiteChecks());
}
