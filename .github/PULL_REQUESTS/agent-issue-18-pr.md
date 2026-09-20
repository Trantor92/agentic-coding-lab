Branch: agent/issue-18-copilot-auth

Title: ci: add non-interactive Copilot token to workflow

Summary:
This PR adds a preparatory step to .github/workflows/agent-issue-resolver.yml that exports the repository secret COPILOT_PAT as COPILOT_GITHUB_TOKEN and prints a small diagnostic (copilot --version) before running the agent harness. The goal is to enable non-interactive Copilot CLI usage on self-hosted runners and avoid the authentication failures observed in run 35519955965.

Files changed (intended):
- .github/workflows/agent-issue-resolver.yml (already edited locally)

Notes for reviewers:
- If the Copilot CLI requires a different non-interactive flag or token name, update the workflow accordingly. The diagnostic step will help determine the correct behavior on the runner.
- If a non-interactive login command is later required, prefer using COPILOT_GITHUB_TOKEN env or a small adapter that uses the token directly rather than interactive logins.

How to push & create remote issue + PR (run locally):

# 1. Create branch and commit
git checkout -b agent/issue-18-copilot-auth
git add .github/workflows/agent-issue-resolver.yml .github/ISSUES/add-non-interactive-copilot-token.md .github/PULL_REQUESTS/agent-issue-18-pr.md
git commit -m "ci: add non-interactive Copilot token to workflow

Closes: <replace-with-issue-number-if-known>

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"

# 2. Push branch
git push -u origin agent/issue-18-copilot-auth

# 3. Create the GitHub issue (if you want remote issue rather than local file)
# Using gh CLI (recommended):
gh issue create --title "Add non-interactive Copilot token to agent workflow" \
  --body-file .github/ISSUES/add-non-interactive-copilot-token.md \
  --label "ready-for-agent,runner:local,enhancement" \
  --assignee @me

# 4. Create PR linking to the issue (replace ISSUE_NUMBER with the created issue number):
gh pr create --title "ci: add non-interactive Copilot token to workflow" \
  --body-file .github/PULL_REQUESTS/agent-issue-18-pr.md \
  --head agent/issue-18-copilot-auth --base main

# 5. After PR is created, edit the PR body to include: "Closes #<issue-number>" to auto-link/close the issue when merged.

If you prefer, I can prepare the commit patch or attempt to run git/gh commands from this environment—confirm if I should try to push and open the remote issue/PR from here (requires repo remotes and auth).