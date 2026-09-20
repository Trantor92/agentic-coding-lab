Branch: agent/issue-18-copilot-auth

Title: ci: add non-interactive Copilot token to workflow

Summary:
This PR prepares the self-hosted runner workflow and the Agent Harness for non-interactive Copilot authentication and allows skipping the agent CLI invocation using environment flags.

Changes:
1. **GitHub Workflow (`.github/workflows/agent-issue-resolver.yml`)**:
   - Injects the repository secret `COPILOT_PAT` as `COPILOT_GITHUB_TOKEN` into the runner's environment.
   - Adds a short diagnostic step to output the version of `copilot` if installed.
2. **Agent Harness (`scripts/run-agent-harness.mjs`)**:
   - Supports `USE_TEST_ADAPTER` and `SKIP_AGENT_CLI` environment variables to bypass actual CLI invocation during testing or non-interactive runs.

Closes #19
