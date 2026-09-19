#!/usr/bin/env node

import path from "node:path";
import { fileURLToPath } from "node:url";

const CONVENTIONAL_COMMIT_TYPES = [
  "agent",
  "build",
  "chore",
  "ci",
  "docs",
  "feat",
  "fix",
  "perf",
  "refactor",
  "revert",
  "style",
  "test",
];

const conventionalCommitPattern = new RegExp(
  `^(?:${CONVENTIONAL_COMMIT_TYPES.join("|")})(?:\\([^)]+\\))?!?: .+`,
);
const issueReferencePattern = new RegExp(
  String.raw`\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s+` +
    String.raw`(?:[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\s*)?#\d+\b`,
  "i",
);
const branchPrefixes = CONVENTIONAL_COMMIT_TYPES.filter((type) => type !== "agent").join("|");
const branchPattern = new RegExp(
  `^(?:agent\\/[a-z0-9._-]+|(?:${branchPrefixes})\\/[a-z0-9._-]+)$`,
);

export function validatePullRequest({ title = "", body = "", branch = "" }) {
  const normalizedTitle = title.trim();
  const normalizedBody = body.trim();
  const normalizedBranch = branch.trim();
  const errors = [];
  const warnings = [];
  const checks = [];

  if (!normalizedTitle) {
    errors.push("PR title is required.");
  } else if (!conventionalCommitPattern.test(normalizedTitle)) {
    errors.push("PR title must follow Conventional Commits, for example `feat(ci): add check`.");
  } else {
    checks.push(`Title follows Conventional Commits: "${normalizedTitle}"`);
  }

  if (!issueReferencePattern.test(`${normalizedTitle}\n${normalizedBody}`)) {
    errors.push(
      "PR title or body must include a closing keyword linked to an issue, for example `Closes #4` or `Closes Trantor92/agentic-coding-lab#4`.",
    );
  } else {
    checks.push("Issue-closing reference found in the PR title or body.");
  }

  if (!normalizedBranch) {
    warnings.push("Branch name was not provided, so branch convention checks were skipped.");
  } else if (!branchPattern.test(normalizedBranch)) {
    warnings.push(
      "Branch name does not match the recommended prefixes (`agent/*`, `build/*`, `chore/*`, `ci/*`, `docs/*`, `feat/*`, `fix/*`, `perf/*`, `refactor/*`, `revert/*`, `style/*`, `test/*`).",
    );
  } else {
    checks.push(`Branch name follows repository conventions: "${normalizedBranch}"`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    checks,
  };
}

export function formatValidationReport(result) {
  const lines = ["🔎 Validating pull request metadata..."];

  for (const check of result.checks) {
    lines.push(`  ✓ ${check}`);
  }

  for (const warning of result.warnings) {
    lines.push(`  ⚠ ${warning}`);
  }

  if (result.valid) {
    lines.push("✅ Validation passed.");
  } else {
    lines.push(`❌ Validation failed with ${result.errors.length} error(s):`);
    for (const error of result.errors) {
      lines.push(`  - ${error}`);
    }
  }

  return `${lines.join("\n")}\n`;
}

export function parseOptions(argv = process.argv.slice(2), env = process.env) {
  let title = env.PR_TITLE || env.INPUT_TITLE || "";
  let body = env.PR_BODY || env.INPUT_BODY || "";
  let branch = env.PR_BRANCH || env.GITHUB_HEAD_REF || env.INPUT_BRANCH || "";
  let dryRun = /^(1|true|yes)$/i.test(env.PR_DRY_RUN || env.DRY_RUN || env.INPUT_DRY_RUN || "");
  let help = false;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--title") {
      title = argv[index + 1] ?? "";
      index += 1;
    } else if (arg === "--body") {
      body = argv[index + 1] ?? "";
      index += 1;
    } else if (arg === "--branch") {
      branch = argv[index + 1] ?? "";
      index += 1;
    } else if (arg === "--dry-run") {
      dryRun = true;
    } else if (arg === "--help" || arg === "-h") {
      help = true;
    }
  }

  return { title, body, branch, dryRun, help };
}

function printUsage() {
  console.log(
    "Usage: node scripts/validate-pr.mjs [--title <string>] [--body <string>] [--branch <string>] [--dry-run]",
  );
}

export function runCli(options = parseOptions()) {
  if (options.help) {
    printUsage();
    return 0;
  }

  if (options.dryRun) {
    console.log("🔍 Running in dry-run mode (GitHub API interactions are skipped).");
  }

  const result = validatePullRequest(options);
  process.stdout.write(formatValidationReport(result));
  return result.valid ? 0 : 1;
}

const currentFilePath = fileURLToPath(import.meta.url);

if (process.argv[1] && path.resolve(process.argv[1]) === currentFilePath) {
  process.exit(runCli());
}
