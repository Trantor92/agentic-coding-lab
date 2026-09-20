import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildAgentCliCommand,
  buildAgentPrompt,
  fetchIssueMetadata,
  parseHarnessArgs,
  resolveModel,
} from "../scripts/run-agent-harness.mjs";
import { buildPrBody } from "../scripts/validate-pr.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const harnessScriptPath = path.resolve(__dirname, "../scripts/run-agent-harness.mjs");

console.log("🧪 Testing Agent Harness functions and CLI...");

// 1. Model resolution
assert.equal(
  resolveModel({ adapter: "copilot", modelProfile: "fast" }),
  "gpt-5-mini",
  "Copilot fast model should map to gpt-5-mini",
);
assert.equal(
  resolveModel({ adapter: "copilot", modelProfile: "smart" }),
  "claude-sonnet-5",
  "Copilot smart model should map to claude-sonnet-5",
);
assert.equal(
  resolveModel({ adapter: "claude", modelProfile: "fast" }),
  "claude-3-5-haiku-latest",
  "Claude fast model should map to claude-3-5-haiku-latest",
);
assert.equal(
  resolveModel({ adapter: "claude", modelProfile: "smart" }),
  "claude-3-7-sonnet-latest",
  "Claude smart model should map to claude-3-7-sonnet-latest",
);

// 2. Prompt construction
const prompt = buildAgentPrompt({
  issueNumber: 42,
  title: "Add feature X",
  body: "Requirements for feature X",
});
assert.match(prompt, /skills\/tdd\/SKILL\.md/, "Prompt must reference TDD skill");
assert.match(prompt, /skills\/code-review\/SKILL\.md/, "Prompt must reference code-review skill");
assert.match(prompt, /CONTEXT\.md/, "Prompt must reference domain context");
assert.match(prompt, /Issue #42/, "Prompt must include issue number");

// 3. CLI command building
const copilotCmd = buildAgentCliCommand({
  adapter: "copilot",
  model: "gpt-5-mini",
  prompt: "Solve issue",
});
assert.equal(copilotCmd.command, "copilot");
assert.ok(
  copilotCmd.args.includes("--allow-all-tools") || copilotCmd.args.includes("--allow-all"),
  "Copilot CLI args must include --allow-all-tools for autonomous headless execution",
);
assert.ok(copilotCmd.args.includes("-p"), "Copilot CLI args must include -p flag");
assert.ok(copilotCmd.args.includes("gpt-5-mini"), "Copilot CLI args must include model");

const claudeCmd = buildAgentCliCommand({
  adapter: "claude",
  model: "claude-3-5-haiku-latest",
  prompt: "Solve issue",
});
assert.equal(claudeCmd.command, "claude");
assert.ok(
  claudeCmd.args.includes("--dangerously-skip-permissions"),
  "Claude CLI args must include --dangerously-skip-permissions for autonomous execution",
);

// 4. PR Body formatting
const prBody = buildPrBody({
  issueNumber: 42,
  title: "Add feature X",
  adapter: "copilot",
  model: "gpt-5-mini",
  reviewSummary: "All standards and spec checks passed.",
});
assert.match(prBody, /Closes #42/, "PR Body must include issue closing keyword");
assert.match(prBody, /gpt-5-mini/, "PR Body must include model used");
assert.match(prBody, /copilot/, "PR Body must include adapter used");

// 5. Args parsing
const parsed = parseHarnessArgs([
  "--issue",
  "42",
  "--title",
  "Test issue",
  "--runner",
  "local",
  "--adapter",
  "copilot",
  "--model",
  "fast",
  "--dry-run",
]);
assert.equal(parsed.issueNumber, 42);
assert.equal(parsed.title, "Test issue");
assert.equal(parsed.runner, "local");
assert.equal(parsed.adapter, "copilot");
assert.equal(parsed.modelProfile, "fast");
assert.equal(parsed.dryRun, true);

// 6. Metadata fallback testing
const defaultMeta = fetchIssueMetadata({ issueNumber: 999999, dryRun: true });
assert.ok(typeof defaultMeta === "object");
assert.ok("title" in defaultMeta);
assert.ok("body" in defaultMeta);

// 7. CLI execution in dry-run mode
const cliResult = spawnSync(process.execPath, [
  harnessScriptPath,
  "--issue",
  "42",
  "--title",
  "Test issue",
  "--dry-run",
], {
  encoding: "utf8",
});
assert.equal(cliResult.status, 0, "CLI dry-run should exit with 0");
assert.match(cliResult.stdout, /Agent Harness dry-run execution/i);
assert.match(cliResult.stdout, /agent\/issue-42/i);
assert.match(cliResult.stdout, /\.worktrees[/\\]issue-42/i, "Dry run must display worktree isolation path");

console.log("✅ Agent Harness tests passed successfully.");
