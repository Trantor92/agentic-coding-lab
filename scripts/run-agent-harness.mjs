#!/usr/bin/env node

import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildBranchName, buildPrBody } from "./validate-pr.mjs";

export const MODEL_MAP = {
  copilot: {
    fast: "gpt-5-mini",
    smart: "claude-sonnet-5",
  },
  claude: {
    fast: "claude-3-5-haiku-latest",
    smart: "claude-3-7-sonnet-latest",
  },
};

/**
 * Resolve the concrete model name given the adapter and model profile.
 */
export function resolveModel({ adapter = "copilot", modelProfile = "fast" }) {
  const adapterMap = MODEL_MAP[adapter] || MODEL_MAP.copilot;
  return adapterMap[modelProfile] || adapterMap.fast;
}

/**
 * Build the structured prompt instructing the agent to apply engineering skills.
 */
export function buildAgentPrompt({ issueNumber, title = "", body = "" }) {
  return `Tu sei un agente AI incaricato di risolvere l'Issue #${issueNumber}: "${title}".

### Istruzioni Operative e Metodologie:
1. **Dominio e Glossario**: Consulta \`CONTEXT.md\` e \`AGENTS.md\` per rispettare i termini canonici del repository.
2. **Sviluppo TDD**: Segui rigorosamente \`skills/tdd/SKILL.md\`. Scrivi i test prima del codice e procedi a fette verticali red-green-refactor.
3. **Code Review**: Prima di completare il lavoro, applica la metodologia definita in \`skills/code-review/SKILL.md\` per verificare i due assi (Standards e Spec).
4. **Validazione**: Assicurati che \`npm test\` passi con successo prima di finalizzare.

### Dettagli dell'Issue #${issueNumber}:
- **Titolo**: ${title}
- **Descrizione**:
${body || "(Nessuna descrizione aggiuntiva fornita)"}
`;
}

/**
 * Build the CLI command and arguments for the chosen agent harness.
 */
export function buildAgentCliCommand({ adapter = "copilot", model, prompt }) {
  const concreteModel = model || resolveModel({ adapter, modelProfile: "fast" });

  if (adapter === "claude") {
    return {
      command: "claude",
      args: ["-p", prompt, "--model", concreteModel, "--dangerously-skip-permissions"],
    };
  }

  return {
    command: "copilot",
    args: ["-p", prompt, "--model", concreteModel, "--allow-all-tools", "--no-ask-user"],
  };
}

/**
 * Fetch issue metadata from GitHub CLI when not provided in arguments.
 */
export function fetchIssueMetadata({ issueNumber, dryRun = false }) {
  if (!issueNumber || dryRun) {
    return { title: "", body: "", modelProfile: null };
  }

  try {
    const raw = execFileSync(
      "gh",
      ["issue", "view", String(issueNumber), "--json", "title,body,labels"],
      { encoding: "utf8" },
    );
    const data = JSON.parse(raw);
    const labels = Array.isArray(data.labels) ? data.labels.map((l) => l.name) : [];
    const modelProfile = labels.includes("model:smart")
      ? "smart"
      : labels.includes("model:fast")
        ? "fast"
        : null;

    return {
      title: data.title || "",
      body: data.body || "",
      modelProfile,
    };
  } catch {
    return { title: "", body: "", modelProfile: null };
  }
}

/**
 * Create an isolated Git worktree for the issue to ensure zero host collision.
 */
export function createWorktree({ issueNumber, targetBranch, repoRoot }) {
  const worktreePath = path.resolve(repoRoot, ".worktrees", `issue-${issueNumber}`);

  console.log(`🌲 Creating isolated Git worktree at: ${worktreePath}`);

  // Cleanup existing directory or registered worktree if present
  try {
    execFileSync("git", ["worktree", "remove", "--force", worktreePath], {
      cwd: repoRoot,
      stdio: "pipe",
    });
  } catch {
    // Ignore if not present
  }

  if (fs.existsSync(worktreePath)) {
    fs.rmSync(worktreePath, { recursive: true, force: true });
  }

  // Create worktree on target branch based on current HEAD
  execFileSync("git", ["worktree", "add", "-B", targetBranch, worktreePath, "HEAD"], {
    cwd: repoRoot,
    stdio: "inherit",
  });

  // Symlink node_modules from repo root to avoid re-install overhead
  const rootNodeModules = path.resolve(repoRoot, "node_modules");
  const worktreeNodeModules = path.resolve(worktreePath, "node_modules");
  if (fs.existsSync(rootNodeModules) && !fs.existsSync(worktreeNodeModules)) {
    try {
      fs.symlinkSync(rootNodeModules, worktreeNodeModules, "junction");
      console.log("🔗 Symlinked node_modules into isolated worktree.");
    } catch (symErr) {
      console.warn(`⚠️ Warning: Failed to symlink node_modules: ${symErr.message}`);
    }
  }

  // Ensure skill symlinks inside the worktree are synced
  const skillsScript = path.resolve(worktreePath, "scripts/skills-manager.mjs");
  if (fs.existsSync(skillsScript)) {
    try {
      execFileSync("node", [skillsScript, "sync"], { cwd: worktreePath, stdio: "pipe" });
      console.log("🔄 Synced engineering skills inside worktree.");
    } catch {
      // Non-blocking
    }
  }

  return worktreePath;
}

/**
 * Clean up and prune isolated Git worktree.
 */
export function cleanupWorktree({ worktreePath, repoRoot }) {
  if (!worktreePath) return;

  console.log(`🧹 Cleaning up Git worktree at: ${worktreePath}`);
  try {
    execFileSync("git", ["worktree", "remove", "--force", worktreePath], {
      cwd: repoRoot,
      stdio: "pipe",
    });
  } catch {
    // Ignore error if already removed
  }

  try {
    execFileSync("git", ["worktree", "prune"], {
      cwd: repoRoot,
      stdio: "pipe",
    });
  } catch {
    // Ignore error
  }

  if (fs.existsSync(worktreePath)) {
    try {
      fs.rmSync(worktreePath, { recursive: true, force: true });
    } catch {
      // Ignore
    }
  }
}

/**
 * Ensure all agent modifications are committed and verify branch has commits against main.
 */
export function ensureGitCommit({ issueNumber, title = "", cwd = process.cwd() }) {
  const statusOut = execFileSync("git", ["status", "--porcelain"], {
    cwd,
    encoding: "utf8",
  }).trim();
  if (statusOut) {
    console.log("📝 Staging and committing changes made by agent...");
    execFileSync("git", ["add", "-A"], { cwd, stdio: "inherit" });
    const commitMsg = `feat(agent): resolve issue #${issueNumber}${title ? ` - ${title}` : ""}\n\nCo-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>`;
    execFileSync("git", ["commit", "-m", commitMsg], { cwd, stdio: "inherit" });
  }

  const commitCount = Number(
    execFileSync("git", ["rev-list", "--count", "main..HEAD"], {
      cwd,
      encoding: "utf8",
    }).trim(),
  );

  if (commitCount === 0) {
    throw new Error(`No commits or file changes were produced for issue #${issueNumber}.`);
  }

  return commitCount;
}

// PR body formatting builders are provided by scripts/validate-pr.mjs (buildPrBody, buildBranchName)

/**
 * Format failure diagnostic comment when agent execution fails.
 */
export function formatFailureComment({ issueNumber, error, logs = "" }) {
  return `⚠️ **Agent Harness Failure Report**: L'esecuzione automatica per l'issue #${issueNumber} non è andata a buon fine.

- **Errore**: ${error}
${logs ? `\n<details><summary>Log di esecuzione</summary>\n\n\`\`\`text\n${logs.slice(-2000)}\n\`\`\`\n</details>` : ""}

L'etichetta \`ready-for-agent\` è stata rimossa ed è stata assegnata \`ready-for-human\` per consentire l'intervento manuale.`;
}

/**
 * Parse arguments from CLI or environment.
 */
export function parseHarnessArgs(argv = process.argv.slice(2), env = process.env) {
  let issueNumber = null;
  let title = env.ISSUE_TITLE || "";
  let body = env.ISSUE_BODY || "";
  let runner = "local";
  let adapter = env.AGENT_ADAPTER || "copilot";
  let modelProfile = env.MODEL_PROFILE || "fast";
  let dryRun = false;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--issue" || arg === "-i") {
      issueNumber = Number(argv[++index]);
    } else if (arg === "--title" || arg === "-t") {
      title = argv[++index];
    } else if (arg === "--body") {
      body = argv[++index];
    } else if (arg === "--runner" || arg === "-r") {
      runner = argv[++index];
    } else if (arg === "--adapter" || arg === "-a") {
      adapter = argv[++index];
    } else if (arg === "--model" || arg === "-m") {
      modelProfile = argv[++index];
    } else if (arg === "--dry-run") {
      dryRun = true;
    }
  }

  if (env.ISSUE_NUMBER && !issueNumber) {
    issueNumber = Number(env.ISSUE_NUMBER);
  }

  return { issueNumber, title, body, runner, adapter, modelProfile, dryRun };
}

/**
 * Main execution harness.
 */
export function runAgentHarness(options = parseHarnessArgs()) {
  let { issueNumber, title, body, runner, adapter, modelProfile, dryRun } = options;

  if (!issueNumber || isNaN(issueNumber)) {
    console.error("❌ Error: A valid numeric --issue number is required.");
    return 1;
  }

  let repoRoot = process.cwd();
  try {
    repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
  } catch {
    // fallback to cwd
  }

  // Auto-fetch metadata if title or body is missing
  if (!title || !body) {
    const fetched = fetchIssueMetadata({ issueNumber, dryRun });
    if (!title && fetched.title) {
      title = fetched.title;
    }
    if (!body && fetched.body) {
      body = fetched.body;
    }
    if (!options.modelProfile && fetched.modelProfile) {
      modelProfile = fetched.modelProfile;
    }
  }

  const model = resolveModel({ adapter, modelProfile });
  const targetBranch = buildBranchName({ issueNumber });
  const prompt = buildAgentPrompt({ issueNumber, title, body });
  const cliCmd = buildAgentCliCommand({ adapter, model, prompt });

  console.log("🚀 Starting Agent Harness (Worktree Isolated)...");
  console.log(`📌 Issue: #${issueNumber} ("${title || "Untitled"}")`);
  console.log(`📌 Runner: ${runner} (Self-Hosted)`);
  console.log(`📌 Adapter: ${adapter} (Model: ${model})`);
  console.log(`📌 Target Branch: ${targetBranch}`);

  if (dryRun) {
    console.log("🔍 [DRY-RUN] Agent Harness dry-run execution:");
    console.log(`  - Target branch: ${targetBranch}`);
    console.log(`  - Worktree directory: ${path.resolve(repoRoot, ".worktrees", `issue-${issueNumber}`)}`);
    console.log(`  - Command: ${cliCmd.command} ${cliCmd.args.join(" ")}`);
    console.log("  - PR Description:");
    console.log(buildPrBody({ issueNumber, title, adapter, model }));
    return 0;
  }

  let worktreePath = null;
  try {
    // 1. Create isolated Git worktree
    worktreePath = createWorktree({ issueNumber, targetBranch, repoRoot });

    // 2. Execute Agent CLI inside the worktree
    console.log(`🤖 Executing agent CLI (${cliCmd.command}) inside worktree...`);

    // Allow test adapter or explicit skip to avoid invoking external agent CLI in CI/local tests.
    // Use env USE_TEST_ADAPTER=true or SKIP_AGENT_CLI=true to opt-out of real CLI calls.
    let agentRes = { status: 0 };
    if (process.env.USE_TEST_ADAPTER === 'true' || process.env.SKIP_AGENT_CLI === 'true') {
      console.log("ℹ️ Using test adapter / skipping external agent CLI invocation (USE_TEST_ADAPTER=true or SKIP_AGENT_CLI=true).");
    } else {
      agentRes = spawnSync(cliCmd.command, cliCmd.args, {
        cwd: worktreePath,
        stdio: "inherit",
        encoding: "utf8",
      });

      if (agentRes.status !== 0) {
        throw new Error(`Agent CLI execution failed with code ${agentRes.status}`);
      }
    }

    // 3. Stage & Commit any changes inside worktree
    console.log("📦 Verifying changes and commits...");
    ensureGitCommit({ issueNumber, title, cwd: worktreePath });

    // 4. Run validation tests inside worktree
    console.log("🧪 Running test suite inside worktree (npm test)...");
    execFileSync("npm", ["test"], { cwd: worktreePath, stdio: "inherit" });

    // 5. Push branch and create Pull Request from worktree
    console.log("📤 Pushing branch and creating Pull Request...");
    execFileSync("git", ["push", "-u", "origin", targetBranch], {
      cwd: worktreePath,
      stdio: "inherit",
    });

    const prTitle = `feat(agent): resolve issue #${issueNumber}${title ? ` - ${title}` : ""}`;
    const prBodyContent = buildPrBody({ issueNumber, title, adapter, model });

    execFileSync(
      "gh",
      [
        "pr",
        "create",
        "--title",
        prTitle,
        "--body",
        prBodyContent,
        "--head",
        targetBranch,
        "--base",
        "main",
      ],
      { cwd: worktreePath, stdio: "inherit" },
    );

    console.log(`✅ Successfully solved issue #${issueNumber} and created PR.`);
    return 0;
  } catch (err) {
    console.error(`❌ Harness execution error: ${err.message}`);

    // Rollback triage labels on failure
    try {
      console.log("🔄 Performing triage rollback to ready-for-human...");
      const failBody = formatFailureComment({ issueNumber, error: err.message });
      execFileSync("gh", ["issue", "comment", String(issueNumber), "--body", failBody], {
        stdio: "inherit",
      });
      execFileSync(
        "gh",
        [
          "issue",
          "edit",
          String(issueNumber),
          "--remove-label",
          "ready-for-agent",
          "--add-label",
          "ready-for-human",
        ],
        { stdio: "inherit" },
      );
    } catch (commentErr) {
      console.error(`⚠️ Failed to update issue labels/comment: ${commentErr.message}`);
    }

    return 1;
  } finally {
    // Always clean up isolated worktree to prevent workspace disk pollution
    cleanupWorktree({ worktreePath, repoRoot });
  }
}

const currentFilePath = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === currentFilePath) {
  process.exit(runAgentHarness());
}
