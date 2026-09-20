# Local Runner and Worktree Isolation Architecture

To guarantee strict repository skill compliance, granular model selection, and zero interference with the host working tree, we standardize all automated issue resolution on a dedicated Self-Hosted Local Runner with Git Worktree Isolation.

## Context & Decision

Relying on GitHub-hosted cloud runners and default Copilot cloud assignments introduced operational issues:

- Inability to specify fine-grained model profiles, risking uncontrolled token/AIC consumption.
- Lack of support for local skill tooling and multi-agent interactive loops.
- Fixed `copilot/*` branch naming conflicting with repository standards (`agent/issue-<n>`).

To resolve this, we mandate:

1. **Exclusive Self-Hosted Local Runner**: All issue resolutions triggered by `ready-for-agent` execute strictly on the local runner environment via `.github/workflows/agent-issue-resolver.yml`.
2. **Worktree Isolation**: Each issue execution is isolated in `.worktrees/issue-<number>` using `git worktree add`. This enables parallel runs without branch switching conflicts on the host and keeps the root working directory clean.
3. **Automated Resource Management**: `node_modules` is symlinked instantly into the worktree, repository skills are synced via `npm run skills:sync`, and the worktree is unconditionally cleaned up (`git worktree remove --force`) upon completion or failure.
4. **Model Tiering**: Defaulting to `model:fast` (`gpt-5-mini` / `claude-3-5-haiku-latest`) for cost efficiency, with explicit elevation to `model:smart` via issue labels.

## Considered Options

- **Hybrid Cloud / Local Routing**: Deprecated in favor of a unified local runner to eliminate duplicate workflows and ensure uniform execution quality and skill fidelity.
- **Root Repository Branch Checkout**: Rejected because parallel tasks or dirty local working trees cause git index conflicts.
- **Full Clone per Task**: Rejected due to network and disk overhead compared to instant `git worktree` creation.
