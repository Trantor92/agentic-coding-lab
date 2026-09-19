import assert from "node:assert/strict";
import { formatDispatchComment } from "../scripts/dispatch-agent.mjs";

console.log("🧪 Testing dispatch-agent formatting and escaping...");

const comment = formatDispatchComment({
  issueNumber: 42,
  branchName: "agent/issue-42",
});

assert.ok(comment.includes("`ready-for-agent`"), "Must preserve markdown backticks for ready-for-agent");
assert.ok(comment.includes("`agent/issue-42`"), "Must preserve markdown backticks for branch name");
assert.ok(comment.includes("`AGENTS.md`"), "Must preserve AGENTS.md reference");
assert.ok(comment.includes("@copilot"), "Must mention @copilot");

console.log("✅ dispatch-agent test passed successfully.");
