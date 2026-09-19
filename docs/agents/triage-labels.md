# Triage Labels

The skills speak in terms of five canonical triage roles. This file maps those roles to the actual label strings used in this repo's issue tracker.

| Label in mattpocock/skills | Label in our tracker | Meaning                                  |
| -------------------------- | -------------------- | ---------------------------------------- |
| `needs-triage`             | `needs-triage`       | Maintainer needs to evaluate this issue  |
| `needs-info`               | `needs-info`         | Waiting on reporter for more information |
| `ready-for-agent`          | `ready-for-agent`    | Fully specified, ready for an AFK agent  |
| `ready-for-human`          | `ready-for-human`    | Requires human implementation            |
| `wontfix`                  | `wontfix`            | Will not be actioned                     |

## Execution Routing and Model Profile Labels

| Label          | Type          | Purpose                                                            |
| -------------- | ------------- | ------------------------------------------------------------------ |
| `runner:local` | Runner Route  | Executes the Agent Harness on a connected self-hosted runner       |
| `runner:cloud` | Runner Route  | Executes the Cloud Agent workflow on GitHub-hosted runners         |
| `model:fast`   | Model Profile | Uses lightweight, economical compute tier (e.g. `gpt-5-mini`)      |
| `model:smart`  | Model Profile | Uses high-reasoning compute tier (e.g. `claude-sonnet-5`)          |

When a skill mentions a role (e.g. "apply the AFK-ready triage label"), use the corresponding label string from this table.

Edit the right-hand column to match whatever vocabulary you actually use.
