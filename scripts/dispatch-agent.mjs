#!/usr/bin/env node

import { execSync } from "node:child_process";

/**
 * Format the dispatch comment body for an agent.
 */
export function formatDispatchComment({ issueNumber, branchName }) {
  return `🤖 **Agent Dispatcher**: L'issue è stata etichettata come \`ready-for-agent\`.

- **Branch di lavoro assegnato**: \`${branchName}\`
- **Strategia di merge richiesta**: Squash and Merge
- **Istruzioni operative**: Consulta \`AGENTS.md\`, \`CONTEXT.md\` e \`skills/tdd/SKILL.md\`.

@copilot procedi con la risoluzione creando il branch e la Pull Request.`;
}

/**
 * Execute agent dispatch with specified adapter.
 */
export function dispatchAgent({ issueNumber, title = "", branchName, dryRun = false }) {
  if (!issueNumber || isNaN(Number(issueNumber))) {
    throw new Error("A valid numeric --issue number is required.");
  }

  const num = Number(issueNumber);
  const targetBranch = branchName || `agent/issue-${num}`;
  const body = formatDispatchComment({ issueNumber: num, branchName: targetBranch });

  console.log(`🤖 Dispatching agent for Issue #${num}${title ? `: "${title}"` : ""}`);
  console.log(`📌 Target branch: ${targetBranch}`);

  if (dryRun) {
    console.log("🔍 [DRY-RUN] Would post the following comment via gh CLI:");
    console.log("----------------------------------------");
    console.log(body);
    console.log("----------------------------------------");
    return { success: true, dryRun: true, body };
  }

  try {
    execSync(`gh issue comment "${num}" --body "${body.replace(/"/g, '\\"')}"`, {
      stdio: "inherit",
    });
    console.log(`✅ Notification sent successfully for issue #${num}.`);
    return { success: true, dryRun: false, body };
  } catch (err) {
    console.error(`❌ Failed to send notification via gh CLI: ${err.message}`);
    process.exit(1);
  }
}

// CLI entry point
function parseArgs() {
  const args = process.argv.slice(2);
  let issueNumber = null;
  let title = "";
  let branchName = null;
  let dryRun = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--issue" || arg === "-i") {
      issueNumber = args[++i];
    } else if (arg === "--title" || arg === "-t") {
      title = args[++i];
    } else if (arg === "--branch" || arg === "-b") {
      branchName = args[++i];
    } else if (arg === "--dry-run") {
      dryRun = true;
    }
  }

  return { issueNumber, title, branchName, dryRun };
}

if (process.argv[1] && process.argv[1].endsWith("dispatch-agent.mjs")) {
  const { issueNumber, title, branchName, dryRun } = parseArgs();
  if (!issueNumber) {
    console.error("Usage: node scripts/dispatch-agent.mjs --issue <number> [--title <title>] [--branch <branch>] [--dry-run]");
    process.exit(1);
  }

  dispatchAgent({ issueNumber, title, branchName, dryRun });
}
