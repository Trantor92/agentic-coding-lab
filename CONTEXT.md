# agentic-coding-lab Context

Collaborative workspace exploring AI agent workflows, software engineering skills, and human-in-the-loop developer interactions.

## Language

### Core Entities

**Laboratory**:
The `agentic-coding-lab` repository and ecosystem providing verified skills, automated workflows, and guidelines for AI coding agents.
_Avoid_: Workspace, sandbox, playground

**Skill**:
A modular instruction set with engineering practices versioned in `skills/` and symlinked to agent configurations (`.agents/skills/`, `.github/skills/`, `.claude/skills/`).
_Avoid_: Plugin, prompt pack, extension, tool

**Agent**:
An autonomous or semi-autonomous AI collaborator (e.g. GitHub Copilot, Claude Code) operating on tasks, issues, and code reviews.
_Avoid_: Bot, AI worker, copilot assistant

### Triage & Workflow

**Ready-for-Agent**:
A canonical triage role and issue label indicating an issue is fully specified and ready for autonomous agent execution.
_Avoid_: AFK-ready, copilot-ready, auto-fix, pending-agent

**Squash and Merge**:
The mandatory git integration strategy combining all commits of a Pull Request into a single conventional commit on the `main` branch.
_Avoid_: Merge commit, rebase-and-merge, fast-forward merge

**Branch Prefix**:
Standardized git branch prefix (`agent/issue-<n>`, `feat/`, `fix/`, `ci/`, `docs/`) identifying branch purpose and authoring context.
_Avoid_: Branch tag, branch category

### Architecture & Design

**Module**:
Anything with an interface and an implementation designed for depth and locality.
_Avoid_: Component, service, unit

**Interface**:
Everything a caller or test must know to use a module correctly (signatures, invariants, error modes, configuration).
_Avoid_: API, signature

**Depth**:
The ratio of leverage at the interface relative to its complexity: high capability behind a concise interface.
_Avoid_: Density, thickness

**Seam**:
A location where a module's interface lives and behaviour can be substituted without editing in that place.
_Avoid_: Boundary, abstraction layer

**Adapter**:
A concrete implementation that satisfies an interface at a seam.
_Avoid_: Provider, driver, handler

**Locality**:
The property where change, bugs, invariants, and verification concentrate in one module rather than spreading across callers.
_Avoid_: Cohesion, encapsulation
