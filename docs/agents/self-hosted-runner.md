# Setup and Operation: Self-Hosted Local Runner

This guide explains how to install, configure, and operate a dedicated **Self-Hosted Local Runner** for autonomous agent issue resolution on `agentic-coding-lab`.

---

## 1. Overview and Architecture

The local runner executes the **Agent Harness** (`scripts/run-agent-harness.mjs`) on your local machine whenever an issue is labeled with `ready-for-agent`.

### Key Benefits

- **Full Model Control**: Use cost-effective models (`model:fast` as default) or elevate to `model:smart` without unpredictable token usage.
- **Strict Skill Fidelity**: Direct access to local repository skills (`tdd`, `code-review`), pre-commit hooks, and test suites.
- **Worktree Isolation**: Each issue executes in an isolated Git worktree (`.worktrees/issue-<number>`), enabling concurrent processing and keeping your working tree pristine.

---

## 2. Prerequisites

Run the automated verification script to check your local environment:

```bash
npm run check:runner
```

### Required Tools

1. **Node.js**: Version 20.0.0 or higher.
2. **Git**: Version 2.30+ (with support for `git worktree`).
3. **GitHub CLI (`gh`)**: Authenticated with write permissions (`gh auth login`).
4. **GitHub Copilot CLI** or **Claude Code**: Installed globally and authenticated.

---

## 3. GitHub Actions Runner Installation

### Step A: Download and Configure the Runner

1. In your GitHub repository, navigate to **Settings** > **Actions** > **Runners**.
2. Click **New self-hosted runner**.
3. Select your Operating System (e.g. **macOS** or **Linux**) and architecture (e.g. **ARM64** or **x64**).
4. Run the generated download commands in a dedicated folder outside your workspace (e.g. `~/actions-runner`):

```bash
# Example for macOS ARM64
mkdir ~/actions-runner && cd ~/actions-runner
curl -o actions-runner-osx-arm64.tar.gz -L https://github.com/actions/runner/releases/download/v2.322.0/actions-runner-osx-arm64-2.322.0.tar.gz
tar xzf ./actions-runner-osx-arm64.tar.gz
```

### Step B: Configure the Runner Token

Run the configuration script with the registration token provided in the GitHub UI:

```bash
./config.sh --url https://github.com/Trantor92/agentic-coding-lab --token <YOUR_REGISTRATION_TOKEN>
```

- When prompted for runner group: Press **Enter** (default).
- When prompted for runner name: Choose a descriptive name (e.g. `macbook-pro-agent-runner`).
- When prompted for custom labels: Press **Enter** (default includes `self-hosted`).

---

## 4. Running the Runner

### Option 1: Interactive Mode (Recommended for testing)

To run the runner interactively in a terminal session:

```bash
cd ~/actions-runner
./run.sh
```

### Option 2: Background Service (Recommended for unattended operation)

To run the runner as a background daemon:

```bash
cd ~/actions-runner
./svc.sh install
./svc.sh start
```

To stop or check status:

```bash
./svc.sh status
./svc.sh stop
```

---

## 5. End-to-End Workflow

1. **Issue Creation**: Create an issue specifying requirements.
2. **Model Labeling**:
   - Default: No extra label needed (defaults to `model:fast` / `gpt-5-mini`).
   - Complex/Architecture: Add label `model:smart` (uses `claude-sonnet-5`).
3. **Trigger**: Add the `ready-for-agent` label.
4. **Execution**:
   - The local runner picks up the job.
   - Creates an isolated worktree at `.worktrees/issue-<number>`.
   - Symlinks `node_modules` and runs `npm run skills:sync`.
   - Copilot CLI executes TDD steps, commits changes, verifies with `npm test`, and creates a PR (`agent/issue-<number>`).
   - The worktree is automatically cleaned up and pruned.
5. **Human Review**: Maintainer reviews the opened Pull Request and completes Squash and Merge.
