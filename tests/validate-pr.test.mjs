import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const scriptPath = path.resolve(__dirname, "../scripts/validate-pr.mjs");

function runValidatePr(args = [], env = {}) {
  return spawnSync(process.execPath, [scriptPath, ...args], {
    encoding: "utf8",
    env: {
      ...process.env,
      ...env,
    },
  });
}

console.log("🧪 Testing PR compliance validation CLI...");

const invalidTitle = runValidatePr(["--title", "invalid title", "--dry-run"]);
assert.equal(invalidTitle.status, 1, "Invalid title should fail validation.");
assert.match(invalidTitle.stdout + invalidTitle.stderr, /Conventional Commits/i);

const missingIssueReference = runValidatePr([
  "--title",
  "feat(ci): add check",
  "--branch",
  "ci/pr-compliance",
  "--dry-run",
]);
assert.equal(missingIssueReference.status, 1, "Missing linked issue should fail validation.");
assert.match(missingIssueReference.stdout + missingIssueReference.stderr, /closing keyword linked to an issue/i);

const validPullRequest = runValidatePr([
  "--title",
  "feat(ci): add check",
  "--body",
  "Closes Trantor92/agentic-coding-lab#12",
  "--branch",
  "ci/pr-compliance",
  "--dry-run",
]);
assert.equal(validPullRequest.status, 0, "Valid PR metadata should pass validation.");
assert.match(validPullRequest.stdout, /Validation passed/i);

const unconventionalBranch = runValidatePr([
  "--title",
  "chore(ci): validate PR metadata",
  "--body",
  "Resolves #4",
  "--branch",
  "topic/pr-compliance",
  "--dry-run",
]);
assert.equal(unconventionalBranch.status, 0, "Branch naming should warn without failing validation.");
assert.match(unconventionalBranch.stdout, /does not match the recommended prefixes/i);

const spacedRepositoryReference = runValidatePr([
  "--title",
  "fix(ci): validate PR metadata",
  "--body",
  "Resolves Trantor92/agentic-coding-lab #4",
  "--branch",
  "fix/pr-compliance",
  "--dry-run",
]);
assert.equal(spacedRepositoryReference.status, 0, "Repository issue references may include whitespace before #.");

const envDrivenPullRequest = runValidatePr([], {
  PR_TITLE: "fix(ci): validate PR metadata",
  PR_BODY: "Resolves Trantor92/agentic-coding-lab#4",
  PR_BRANCH: "agent/issue-4",
  PR_DRY_RUN: "true",
});
assert.equal(envDrivenPullRequest.status, 0, "Environment variables should be accepted.");
assert.match(envDrivenPullRequest.stdout, /agent\/issue-4/i);

console.log("✅ PR compliance validation test passed successfully.");
