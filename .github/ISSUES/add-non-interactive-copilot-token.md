Title: Add non-interactive Copilot token to agent workflow

Description:
Add COPILOT_PAT env and prepare Copilot CLI for non-interactive runs in .github/workflows/agent-issue-resolver.yml. This will allow self-hosted runner runs to authenticate Copilot using the repository secret, avoiding the interactive login failure seen in run 35519955965.

Acceptance criteria:
- Workflow injects the repository secret COPILOT_PAT into the job environment as COPILOT_GITHUB_TOKEN.
- A short diagnostic step checks for the copilot CLI and prints its version.
- run-agent-harness.mjs can detect COPILOT_GITHUB_TOKEN and run non-interactively or fall back to USE_TEST_ADAPTER.
- Document any manual verification steps required if copilot CLI requires a different non-interactive flag.

Links:
- Related failures: issue/17 and workflow run 35519955965
- Resolved by: PR #20

Labels: ready-for-human, runner:local, enhancement
Assignees: @Trantor92

