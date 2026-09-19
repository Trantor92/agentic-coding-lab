# Hybrid Agent Harness and Runner Routing Architecture

To enable advanced autonomous issue resolution with full fidelity to repository engineering skills (`tdd`, `code-review`), we adopt a unified Agent Harness (`scripts/run-agent-harness.mjs`) orchestrated via GitHub Actions with deterministic runner routing (`runner:local` for self-hosted runners vs `runner:cloud` for GitHub-hosted runners) and model profile selection (`model:fast`, `model:smart`).

## Context & Decision

Remote cloud agent executions (e.g. standard Copilot cloud assignments) lack direct interactive slash-command capabilities and model selection granularity, risking high token credit usage and unverified pull requests. By implementing an explicit routing architecture:

- Triage labels (`ready-for-agent`, `runner:local` / `runner:cloud`, `model:fast` / `model:smart`) deterministically assign workload to the appropriate runner environment and compute budget.
- The dual-mode Agent Harness executes the full engineering skill cycle locally or in CI (branch checkout, TDD verification, automated code review, and PR opening).
- Automated diagnostic feedback transitions failing tasks to `ready-for-human` to prevent retry loops.

## Considered Options

- **Cloud-Only Native Copilot Assignment**: Rejected due to lack of model selection control, fixed `copilot/*` branch naming, and inability to run multi-agent code-review sub-agents.
- **Local-Only Manual CLI Execution**: Rejected as the sole solution because it lacks CI-driven orchestration when maintainers are away.
- **Hybrid Runner Routing via GitHub Actions**: Selected for maximal flexibility, cost control, and full parity between local and remote agent workflows.
