# Reference Documentation

Complete reference for oh-my-gemini-cli. For quick start, see the main [README.md](../README.md).

---

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [CLI Commands: ask/team/session](#cli-commands-askteamsession)
- [Legacy MCP Team Runtime Tools (Deprecated)](#legacy-mcp-team-runtime-tools-deprecated)
- [Agents (29 Total)](#agents-29-total)
- [Skills (32 Total)](#skills-32-total)
- [Slash Commands](#slash-commands)
- [Hooks System](#hooks-system)
- [Magic Keywords](#magic-keywords)
- [Platform Support](#platform-support)
- [Performance Monitoring](#performance-monitoring)
- [Troubleshooting](#troubleshooting)
- [Changelog](#changelog)

---

## Installation

**Only the Gemini Code Plugin method is supported.** Other installation methods (npm, bun, curl) are deprecated and may not work correctly.

### Gemini Code Plugin (Required)

```bash
# Step 1: Add the marketplace
/plugin marketplace add https://github.com/Yeachan-Heo/oh-my-gemini-cli

# Step 2: Install the plugin
/plugin install oh-my-gemini-cli
```

This integrates directly with Gemini Code's plugin system and uses Node.js hooks.

> **Note**: Direct npm/bun global installs are **not supported**. The plugin system handles all installation and hook setup automatically.

### Requirements

- [Gemini Code](https://docs.anthropic.com/gemini-code) installed
- One of:
  - **Gemini Max/Pro subscription** (recommended for individuals)
  - **Anthropic API key** (`ANTHROPIC_API_KEY` environment variable)

---

## Configuration

### Project-Scoped Configuration (Recommended)

Configure omg for the current project only:

```
/oh-my-gemini-cli:omg-setup --local
```

- Creates `./.gemini/GEMINI.md` in your current project
- Configuration applies only to this project
- Won't affect other projects or global settings
- **Safe**: Preserves your global GEMINI.md

### Global Configuration

Configure omg for all Gemini Code sessions:

```
/oh-my-gemini-cli:omg-setup
```

- Creates `~/.gemini/GEMINI.md` globally
- Configuration applies to all projects
- **Warning**: Completely overwrites existing `~/.gemini/GEMINI.md`

### What Configuration Enables

| Feature           | Without     | With omg Config            |
| ----------------- | ----------- | -------------------------- |
| Agent delegation  | Manual only | Automatic based on task    |
| Keyword detection | Disabled    | ultrawork, search |
| Todo continuation | Basic       | Enforced completion        |
| Model routing     | Default     | Smart tier selection       |
| Skill composition | None        | Auto-combines skills       |

### Configuration Precedence

If both configurations exist, **project-scoped takes precedence** over global:

```
./.gemini/GEMINI.md  (project)   →  Overrides  →  ~/.gemini/GEMINI.md  (global)
```

### Environment Variables

| Variable                   | Default              | Description                                                                                                                                                                                                                                                                 |
| -------------------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OMC_STATE_DIR`            | _(unset)_            | Centralized state directory. When set, OMC stores state at `$OMC_STATE_DIR/{project-id}/` instead of `{worktree}/.omg/`. This preserves state across worktree deletions. The project identifier is derived from the git remote URL (or worktree path for local-only repos). |
| `OMC_BRIDGE_SCRIPT`        | _(auto-detected)_    | Path to the Python bridge script                                                                                                                                                                                                                                            |
| `OMC_PARALLEL_EXECUTION`   | `true`               | Enable/disable parallel agent execution                                                                                                                                                                                                                                     |
| `OMC_CODEX_DEFAULT_MODEL`  | _(provider default)_ | Default model for Codex CLI workers                                                                                                                                                                                                                                         |
| `OMC_GEMINI_DEFAULT_MODEL` | _(provider default)_ | Default model for Gemini CLI workers                                                                                                                                                                                                                                        |
| `OMC_LSP_TIMEOUT_MS`       | `15000`              | Timeout (ms) for LSP requests. Increase for large repos or slow language servers                                                                                                                                                                                            |
| `DISABLE_OMC`              | _(unset)_            | Set to any value to disable all OMC hooks                                                                                                                                                                                                                                   |
| `OMC_SKIP_HOOKS`           | _(unset)_            | Comma-separated list of hook names to skip                                                                                                                                                                                                                                  |

#### Centralized State with `OMC_STATE_DIR`

By default, OMC stores state in `{worktree}/.omg/`. This is lost when worktrees are deleted. To preserve state across worktree lifecycles, set `OMC_STATE_DIR`:

```bash
# In your shell profile (~/.bashrc, ~/.zshrc, etc.)
export OMC_STATE_DIR="$HOME/.gemini/omg"
```

This resolves to `~/.gemini/omg/{project-identifier}/` where the project identifier uses a hash of the git remote URL (stable across worktrees/clones) with a fallback to the directory path hash for local-only repos.

If both a legacy `{worktree}/.omg/` directory and a centralized directory exist, OMC logs a notice and uses the centralized directory. You can then migrate data from the legacy directory and remove it.

### When to Re-run Setup

- **First time**: Run after installation (choose project or global)
- **After updates**: Re-run to get the latest configuration
- **Different machines**: Run on each machine where you use Gemini Code
- **New projects**: Run `/oh-my-gemini-cli:omg-setup --local` in each project that needs omg

> **NOTE**: After updating the plugin (via `npm update`, `git pull`, or Gemini Code's plugin update), you MUST re-run `/oh-my-gemini-cli:omg-setup` to apply the latest GEMINI.md changes.

### Remote OMC / Remote MCP Access

Issue #1653 asked whether OMC can "connect to a remote OMC" so one development machine can browse files on lab/test machines without opening an interactive SSH session.

The narrow, coherent answer today is:

- **Supported**: connect to a **remote MCP server** through the unified MCP registry
- **Not implemented**: a general "OMC cluster", shared remote filesystem view, or automatic remote-OMC federation
- **Still appropriate for full remote shell workflows**: SSH, worktrees, or a mounted/network filesystem

If a remote host already exposes an MCP endpoint, add it to your MCP registry (or Gemini settings and then re-run setup so OMC syncs the registry to Codex too):

```json
{
  "mcpServers": {
    "remoteOmc": {
      "url": "https://lab.example.com/mcp",
      "timeout": 30
    }
  }
}
```

This gives OMC a coherent remote connection surface for MCP-backed tools. It does **not** make all remote files magically appear as a local workspace, and it does **not** replace SSH for arbitrary shell access.

If you need richer cross-machine behavior in the future, that would require a separate authenticated remote execution/filesystem design rather than stretching the current local-workspace architecture.

### Agent Customization

Edit agent files in `~/.gemini/agents/` to customize behavior:

```yaml
---
name: architect
description: Your custom description
tools: Read, Grep, Glob, Bash, Edit
model: opus # or sonnet, haiku
---
Your custom system prompt here...
```

### Project-Level Config

Create `.gemini/GEMINI.md` in your project for project-specific instructions:

```markdown
# Project Context

This is a TypeScript monorepo using:

- Bun runtime
- React for frontend
- PostgreSQL database

## Conventions

- Use functional components
- All API routes in /src/api
- Tests alongside source files
```

### Stop Callback Notification Tags

Configure tags for Telegram/Discord stop callbacks with `omg config-stop-callback`.

```bash
# Set/replace tags
omg config-stop-callback telegram --enable --token <bot_token> --chat <chat_id> --tag-list "@alice,bob"
omg config-stop-callback discord --enable --webhook <url> --tag-list "@here,123456789012345678,role:987654321098765432"

# Incremental updates
omg config-stop-callback telegram --add-tag charlie
omg config-stop-callback discord --remove-tag @here
omg config-stop-callback discord --clear-tags

# Inspect current callback config
omg config-stop-callback telegram --show
omg config-stop-callback discord --show
```

Tag behavior:

- Telegram: `alice` is normalized to `@alice`
- Discord: supports `@here`, `@everyone`, numeric user IDs (`<@id>`), and role tags (`role:<id>` -> `<@&id>`)
- `file` callbacks ignore tag options

---

## CLI Commands: ask/team/session

### `omg ask`

```bash
omg ask gemini "review this patch"
omg ask codex "review this patch from a security perspective"
omg ask gemini --prompt "suggest UX improvements"
omg ask gemini --agent-prompt executor --prompt "create an implementation plan"
```

- Provider matrix: `gemini | codex | gemini`
- Artifacts: `.omg/artifacts/ask/{provider}-{slug}-{timestamp}.md`
- Canonical env vars: `OMC_ASK_ADVISOR_SCRIPT`, `OMC_ASK_ORIGINAL_TASK`
- Phase-1 aliases (deprecated warning): `OMX_ASK_ADVISOR_SCRIPT`, `OMX_ASK_ORIGINAL_TASK`
- Skill entrypoint: `/oh-my-gemini-cli:ask <gemini|codex|gemini> <prompt>` routes to this command

### `omg team` (CLI runtime surface)

```bash
omg team 2:codex "review auth flow"
omg team status review-auth-flow
omg team shutdown review-auth-flow --force
omg team api claim-task --input '{"team_name":"auth-review","task_id":"1","worker":"worker-1"}' --json
```

Supported entrypoints: direct start (`omg team [N:agent] "<task>"`), `status`, `shutdown`, and `api`.

Topology behavior:
- inside classic tmux (`$TMUX` set): reuse the current tmux surface for split-pane or `--new-window` layouts
- inside cmux (`CMUX_SURFACE_ID` without `$TMUX`): launch a detached tmux session for team workers
- plain terminal: launch a detached tmux session for team workers

### `omg session search`

```bash
omg session search "team leader stale"
omg session search notify-hook --since 7d
omg session search provider-routing --project all --json
```

- Defaults to the current project/worktree scope
- Use `--project all` to search across all local Gemini project transcripts
- Supports `--limit`, `--session`, `--since`, `--context`, `--case-sensitive`, and `--json`
- MCP/tool surface: `session_search` returns structured JSON for agents and automations

---

## Legacy MCP Team Runtime Tools (Deprecated, Opt-In Only)

The Team MCP runtime server is **not enabled by default**. If manually enabled, runtime tools are still **CLI-only deprecated** and return a deterministic error envelope:

```json
{
  "code": "deprecated_cli_only",
  "message": "Legacy team MCP runtime tools are deprecated. Use the omg team CLI instead."
}
```

Use `omg team ...` replacements instead:

| Tool                   | Purpose                                                    |
| ---------------------- | ---------------------------------------------------------- |
| `omg_run_team_start`   | **Deprecated** → `omg team [N:agent-type] "<task>"`        |
| `omg_run_team_status`  | **Deprecated** → `omg team status <team-name>`             |
| `omg_run_team_wait`    | **Deprecated** → monitor via `omg team status <team-name>` |
| `omg_run_team_cleanup` | **Deprecated** → `omg team shutdown <team-name> [--force]` |

Optional compatibility enablement (manual only):

```json
{
  "mcpServers": {
    "team": {
      "command": "node",
      "args": ["${CLAUDE_PLUGIN_ROOT}/bridge/team-mcp.cjs"]
    }
  }
}
```

### Runtime status semantics

- **Artifact-first terminal convergence**: team monitors prefer finalized state artifacts when present.
- **Deterministic parse-failure handling**: malformed result artifacts are treated as terminal `failed`.
- **Cleanup scope**: shutdown/cleanup only clears `.omg/state/team/{teamName}` for the target team (never sibling teams).

## Agents (29 Total)

Always use `oh-my-gemini-cli:` prefix when calling via Task tool.

### By Domain and Tier

| Domain           | LOW (Haiku)             | MEDIUM (Sonnet)       | HIGH (Opus)         |
| ---------------- | ----------------------- | --------------------- | ------------------- |
| **Analysis**     | `architect-low`         | `architect-medium`    | `architect`         |
| **Execution**    | `executor-low`          | `executor`            | `executor-high`     |
| **Search**       | `explore`               | -                     | `explore-high`      |
| **Research**     | -                       | `document-specialist` | -                   |
| **Frontend**     | `designer-low`          | `designer`            | `designer-high`     |
| **Docs**         | `writer`                | -                     | -                   |
| **Visual**       | -                       | `vision`              | -                   |
| **Planning**     | -                       | -                     | `planner`           |
| **Critique**     | -                       | -                     | `critic`            |
| **Pre-Planning** | -                       | -                     | `analyst`           |
| **Testing**      | -                       | `qa-tester`           | -                   |
| **Tracing**      | -                       | `tracer`              | -                   |
| **Security**     | `security-reviewer-low` | -                     | `security-reviewer` |
| **Build**        | -                       | `debugger`            | -                   |
| **TDD**          | -                       | `test-engineer`       | -                   |
| **Code Review**  | -                       | -                     | `code-reviewer`     |
| **Data Science** | -                       | `scientist`           | `scientist-high`    |

### Agent Selection Guide

| Task Type                    | Best Agent                    | Model  |
| ---------------------------- | ----------------------------- | ------ |
| Quick code lookup            | `explore`                     | haiku  |
| Find files/patterns          | `explore`                     | haiku  |
| Complex architectural search | `explore-high`                | opus   |
| Simple code change           | `executor-low`                | haiku  |
| Feature implementation       | `executor`                    | sonnet |
| Complex refactoring          | `executor-high`               | opus   |
| Debug simple issue           | `architect-low`               | haiku  |
| Debug complex issue          | `architect`                   | opus   |
| UI component                 | `designer`                    | sonnet |
| Complex UI system            | `designer-high`               | opus   |
| Write docs/comments          | `writer`                      | haiku  |
| Research docs/APIs           | `document-specialist` (repo docs first; optional Context Hub / `chub`) | sonnet |
| Analyze images/diagrams      | `vision`                      | sonnet |
| Strategic planning           | `planner`                     | opus   |
| Review/critique plan         | `critic`                      | opus   |
| Pre-planning analysis        | `analyst`                     | opus   |
| Test CLI interactively       | `qa-tester`                   | sonnet |
| Evidence-driven causal tracing | `tracer`                    | sonnet |
| Security review              | `security-reviewer`           | opus   |
| Quick security scan          | `security-reviewer-low`       | haiku  |
| Fix build errors             | `debugger`                    | sonnet |
| Simple build fix             | `debugger` (model=haiku)      | haiku  |
| TDD workflow                 | `test-engineer`               | sonnet |
| Quick test suggestions       | `test-engineer` (model=haiku) | haiku  |
| Code review                  | `code-reviewer`               | opus   |
| Quick code check             | `code-reviewer` (model=haiku) | haiku  |
| Data analysis/stats          | `scientist`                   | sonnet |
| Quick data inspection        | `scientist` (model=haiku)     | haiku  |
| Complex ML/hypothesis        | `scientist-high`              | opus   |

---

## Skills (32 Total)

Includes **31 canonical skills + 1 deprecated alias** (`psm`). Runtime truth comes from the builtin skill loader scanning `skills/*/SKILL.md` and expanding aliases declared in frontmatter.

| Skill                     | Description                                                      | Manual Command                              |
| ------------------------- | ---------------------------------------------------------------- | ------------------------------------------- |
| `ai-slop-cleaner`         | Anti-slop cleanup workflow with optional reviewer-only `--review` pass | `/oh-my-gemini-cli:ai-slop-cleaner`         |
| `ask`                     | Ask Gemini, Codex, or Gemini via local CLI and capture a reusable artifact | `/oh-my-gemini-cli:ask`               |
| `autopilot`               | Full autonomous execution from idea to working code              | `/oh-my-gemini-cli:autopilot`               |
| `cancel`                  | Unified cancellation for active modes                            | `/oh-my-gemini-cli:cancel`                  |
| `ccg`                     | Tri-model workflow via `ask codex` + `ask gemini`, then Gemini synthesis | `/oh-my-gemini-cli:ccg`                     |
| `configure-notifications` | Configure notification integrations (Telegram, Discord, Slack) via natural language | `/oh-my-gemini-cli:configure-notifications` |
| `deep-dive`               | Two-stage trace → deep-interview pipeline with context handoff   | `/oh-my-gemini-cli:deep-dive`               |
| `deep-interview`          | Socratic deep interview with ambiguity gating                    | `/oh-my-gemini-cli:deep-interview`          |
| `deepinit`                | Generate hierarchical AGENTS.md docs                             | `/oh-my-gemini-cli:deepinit`                |
| `external-context`        | Parallel document-specialist research                            | `/oh-my-gemini-cli:external-context`        |
| `hud`                     | Configure HUD/statusline                                         | `/oh-my-gemini-cli:hud`                     |
| `learner`                 | Extract reusable skill from session                              | `/oh-my-gemini-cli:learner`                 |
| `mcp-setup`               | Configure MCP servers                                            | `/oh-my-gemini-cli:mcp-setup`               |
| `omg-doctor`              | Diagnose and fix installation issues                             | `/oh-my-gemini-cli:omg-doctor`              |
| `omg-plan`                | Planning workflow (`/plan` safe alias)                           | `/oh-my-gemini-cli:omg-plan`                |
| `omg-reference`           | Detailed OMC agent/tools/team/commit reference skill             | Auto-loaded reference only                  |
| `omg-setup`               | One-time setup wizard                                            | `/oh-my-gemini-cli:omg-setup`               |
| `omg-teams`               | Spawn `gemini`/`codex`/`gemini` tmux workers for parallel execution | `/oh-my-gemini-cli:omg-teams`             |
| `project-session-manager` | Manage isolated dev environments (git worktrees + tmux)          | `/oh-my-gemini-cli:project-session-manager` |
| `psm` | **Deprecated** compatibility alias for `project-session-manager` | `/oh-my-gemini-cli:psm` |
| `ralph`                   | Persistence loop until verified completion                       | `/oh-my-gemini-cli:ralph`                   |
| `ralplan`                 | Consensus planning alias for `/omg-plan --consensus`             | `/oh-my-gemini-cli:ralplan`                 |
| `release`                 | Automated release workflow                                       | `/oh-my-gemini-cli:release`                 |
| `setup`                   | Unified setup entrypoint for install, diagnostics, and MCP configuration | `/oh-my-gemini-cli:setup`              |
| `sciomg`                  | Parallel scientist orchestration                                 | `/oh-my-gemini-cli:sciomg`                  |
| `skill`                   | Manage local skills (list/add/remove/search/edit)                | `/oh-my-gemini-cli:skill`                   |
| `team`                    | Coordinated multi-agent workflow                                 | `/oh-my-gemini-cli:team`                    |
| `trace`                   | Evidence-driven tracing lane with parallel tracer hypotheses     | `/oh-my-gemini-cli:trace`                   |
| `ultraqa`                 | QA cycle until goal is met                                       | `/oh-my-gemini-cli:ultraqa`                 |
| `ultrawork`               | Maximum parallel throughput mode                                 | `/oh-my-gemini-cli:ultrawork`               |
| `visual-verdict`          | Structured visual QA verdict for screenshot/reference comparisons | `/oh-my-gemini-cli:visual-verdict`          |
| `writer-memory`           | Agentic memory system for writing projects                       | `/oh-my-gemini-cli:writer-memory`           |


---

## Slash Commands

Each installed skill is exposed as `/oh-my-gemini-cli:<skill-name>`. The skills table above is the full runtime-backed list; the commands below highlight common entrypoints and aliases. Compatibility keyword modes like `deep-analyze` and `tdd` are prompt-triggered behaviors, not standalone slash commands.

| Command                                     | Description                                                                                   |
| ------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `/oh-my-gemini-cli:ai-slop-cleaner <target>`    | Run the anti-slop cleanup workflow (`--review` for reviewer-only pass)                    |
| `/oh-my-gemini-cli:ask <gemini|codex|gemini> <prompt>` | Route a prompt through the selected advisor CLI and capture an ask artifact         |
| `/oh-my-gemini-cli:autopilot <task>`            | Full autonomous execution                                                                  |
| `/oh-my-gemini-cli:configure-notifications`     | Configure notification integrations                                                       |
| `/oh-my-gemini-cli:deep-dive <problem>`         | Run the trace → deep-interview pipeline                                                   |
| `/oh-my-gemini-cli:deep-interview <idea>`       | Socratic interview with ambiguity scoring before execution                                 |
| `/oh-my-gemini-cli:deepinit [path]`             | Index codebase with hierarchical AGENTS.md files                                           |
| `/oh-my-gemini-cli:mcp-setup`                   | Configure MCP servers                                                                      |
| `/oh-my-gemini-cli:omg-doctor`                  | Diagnose and fix installation issues                                                       |
| `/oh-my-gemini-cli:omg-plan <description>`      | Start planning session (supports consensus structured deliberation)                        |
| `/oh-my-gemini-cli:omg-setup`                   | One-time setup wizard                                                                      |
| `/oh-my-gemini-cli:omg-teams <N>:<agent> <task>`       | Spawn `gemini`/`codex`/`gemini` tmux workers for legacy parallel execution                |
| `/oh-my-gemini-cli:project-session-manager <arguments>` | Manage isolated dev environments with git worktrees + tmux                         |
| `/oh-my-gemini-cli:psm <arguments>`             | Deprecated alias for project session manager                                               |
| `/oh-my-gemini-cli:ralph <task>`                | Self-referential loop until task completion (`--critic=architect|critic|codex`)           |
| `/oh-my-gemini-cli:ralplan <description>`       | Iterative planning with consensus structured deliberation (`--deliberate` for high-risk mode) |
| `/oh-my-gemini-cli:release`                     | Automated release workflow                                                                 |
| `/oh-my-gemini-cli:setup`                       | Unified setup entrypoint (`setup`, `setup doctor`, `setup mcp`)                           |
| `/oh-my-gemini-cli:sciomg <topic>`              | Parallel research orchestration                                                            |
| `/oh-my-gemini-cli:team <N>:<agent> <task>`     | Coordinated native team workflow                                                           |
| `/oh-my-gemini-cli:trace`                       | Evidence-driven tracing lane that orchestrates parallel tracer hypotheses in team mode     |
| `/oh-my-gemini-cli:ultraqa <goal>`              | Autonomous QA cycling workflow                                                             |
| `/oh-my-gemini-cli:ultrawork <task>`            | Maximum performance mode with parallel agents                                              |
| `/oh-my-gemini-cli:visual-verdict <task>`       | Structured visual QA verdict for screenshot/reference comparisons                          |

### Skill Pipeline Metadata (Preview)

Built-in skills and slash-loaded skills can now declare a lightweight pipeline/handoff contract in frontmatter:

```yaml
pipeline: [deep-interview, omg-plan, autopilot]
next-skill: omg-plan
next-skill-args: --consensus --direct
handoff: .omg/specs/deep-interview-{slug}.md
```

When present, OMC appends a standardized **Skill Pipeline** section to the rendered skill prompt so the current stage, handoff artifact, and explicit next `Skill("oh-my-gemini-cli:...")` invocation are carried forward consistently.

### Skills 2.0 Compatibility (MVP)

OMC's canonical project-local skill directory remains `.omg/skills/`, but the runtime now also reads compatibility skills from `.agents/skills/`.

For builtin and slash-loaded skills, OMC also appends a standardized **Skill Resources** section when the skill directory contains bundled assets such as helper scripts, templates, or support libraries. This helps agents reuse packaged skill resources instead of recreating them ad hoc.

---

## Hooks System

Oh-my-gemini-cli includes 31 lifecycle hooks that enhance Gemini Code's behavior.

### Execution Mode Hooks

| Hook              | Description                                                                 |
| ----------------- | --------------------------------------------------------------------------- |
| `autopilot`       | Full autonomous execution from idea to working code                         |
| `ultrawork`       | Maximum parallel agent execution                                            |
| `ralph`           | Persistence until verified complete                                         |
| `team-pipeline`   | Native team staged pipeline orchestration                                   |
| `ultraqa`         | QA cycling until goal met                                                   |
| `mode-registry`   | Tracks active execution mode state (including team/ralph/ultrawork/ralplan) |
| `persistent-mode` | Maintains mode state across sessions                                        |

### Core Hooks

| Hook                 | Description                                           |
| -------------------- | ----------------------------------------------------- |
| `rules-injector`     | Dynamic rules injection with YAML frontmatter parsing |
| `omg-orchestrator`   | Enforces orchestrator behavior and delegation         |
| `auto-slash-command` | Automatic slash command detection and execution       |
| `keyword-detector`   | Magic keyword detection (ultrawork, ralph, etc.)      |
| `todo-continuation`  | Ensures todo list completion                          |
| `notepad`            | Compaction-resilient memory system                    |
| `learner`            | Skill extraction from conversations                   |

### Context & Recovery

| Hook                        | Description                                      |
| --------------------------- | ------------------------------------------------ |
| `recovery`                  | Edit error, session, and context window recovery |
| `preemptive-compaction`     | Context usage monitoring to prevent limits       |
| `pre-compact`               | Pre-compaction processing                        |
| `directory-readme-injector` | README context injection                         |

### Quality & Validation

| Hook                       | Description                                            |
| -------------------------- | ------------------------------------------------------ |
| `comment-checker`          | BDD detection and directive filtering                  |
| `thinking-block-validator` | Extended thinking validation                           |
| `empty-message-sanitizer`  | Empty message handling                                 |
| `permission-handler`       | Permission requests and validation                     |
| `think-mode`               | Extended thinking detection                            |
| `code-simplifier`          | Auto-simplify recently modified files on Stop (opt-in) |

### Code Simplifier Hook

The `code-simplifier` Stop hook automatically delegates recently modified source files to the
`code-simplifier` agent after each Gemini turn. It is **disabled by default** and must be
explicitly enabled via `~/.omg/config.json`.

**Enable:**

```json
{
  "codeSimplifier": {
    "enabled": true
  }
}
```

**Full config options:**

```json
{
  "codeSimplifier": {
    "enabled": true,
    "extensions": [".ts", ".tsx", ".js", ".jsx", ".py", ".go", ".rs"],
    "maxFiles": 10
  }
}
```

| Option       | Type       | Default                                         | Description                        |
| ------------ | ---------- | ----------------------------------------------- | ---------------------------------- |
| `enabled`    | `boolean`  | `false`                                         | Opt-in to automatic simplification |
| `extensions` | `string[]` | `[".ts",".tsx",".js",".jsx",".py",".go",".rs"]` | File extensions to consider        |
| `maxFiles`   | `number`   | `10`                                            | Maximum files simplified per turn  |

**How it works:**

1. When Gemini stops, the hook runs `git diff HEAD --name-only` to find modified files
2. If modified source files are found, the hook injects a message asking Gemini to delegate to the `code-simplifier` agent
3. The agent simplifies the files for clarity and consistency without changing behavior
4. A turn-scoped marker prevents the hook from triggering more than once per turn cycle

### Coordination & Environment

| Hook                      | Description                              |
| ------------------------- | ---------------------------------------- |
| `subagent-tracker`        | Tracks spawned sub-agents                |
| `session-end`             | Session termination handling             |
| `non-interactive-env`     | CI/non-interactive environment handling  |
| `agent-usage-reminder`    | Reminder to use specialized agents       |
| `background-notification` | Background task completion notifications |
| `plugin-patterns`         | Plugin pattern detection                 |
| `setup`                   | Initial setup and configuration          |

---

## Magic Keywords

Use these trigger phrases in natural language prompts to activate enhanced modes:

| Keyword                                                 | Effect                                                                                        |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `ultrawork`, `ulw`                                      | Activates parallel agent orchestration                                                        |
| `autopilot`, `build me`, `I want a`                     | Full autonomous execution                                                                     |
| `deslop`, `anti-slop`, cleanup/refactor + slop smells         | Anti-slop cleanup workflow (`ai-slop-cleaner`)                                               |
| `ralph`, `don't stop`, `must complete`                  | Persistence until verified complete                                                           |
| `ccg`, `gemini-codex-gemini`                            | Gemini-Codex-Gemini orchestration                                                             |
| `ralplan`                                               | Iterative planning consensus with structured deliberation (`--deliberate` for high-risk mode) |
| `deep interview`, `ouroboros`                           | Deep Socratic interview with mathematical clarity gating                                      |
| `deepsearch`, `search the codebase`, `find in codebase` | Codebase-focused search mode                                                                  |
| `deepanalyze`, `deep-analyze`                           | Deep analysis mode                                                                            |
| `ultrathink`                                            | Deep reasoning mode                                                                           |
| `tdd`, `test first`, `red green`                        | TDD workflow enforcement                                                                      |
| `cancelomg`, `stopomg`                                  | Unified cancellation                                                                          |

### Examples

```bash
# In Gemini Code:

# Maximum parallelism
ultrawork implement user authentication with OAuth

# Enhanced search
deepsearch for files that import the utils module

# Deep analysis
deep-analyze why the tests are failing

# Autonomous execution
autopilot: build a todo app with React

# Parallel autonomous execution
team 3:executor "build a fullstack todo app"

# Persistence mode
ralph: refactor the authentication module

# Planning session
ralplan this feature

# TDD workflow
tdd: implement password validation

# Stop active orchestration
stopomg
```

---

## Platform Support

### Operating Systems

| Platform    | Install Method              | Hook Type      |
| ----------- | --------------------------- | -------------- |
| **Windows** | WSL2 recommended (see note) | Node.js (.mjs) |
| **macOS**   | Gemini Code Plugin          | Bash (.sh)     |
| **Linux**   | Gemini Code Plugin          | Bash (.sh)     |

> **Note**: Bash hooks are fully portable across macOS and Linux (no GNU-specific dependencies).

> **Windows**: Native Windows (win32) support is experimental. OMC requires tmux, which is not available on native Windows. **WSL2 is strongly recommended** for Windows users. See the [WSL2 installation guide](https://learn.microsoft.com/en-us/windows/wsl/install). Native Windows issues may have limited support.

> **Advanced**: Set `OMC_USE_NODE_HOOKS=1` to use Node.js hooks on macOS/Linux.

### Available Tools

| Tool          | Status       | Description           |
| ------------- | ------------ | --------------------- |
| **Read**      | ✅ Available | Read files            |
| **Write**     | ✅ Available | Create files          |
| **Edit**      | ✅ Available | Modify files          |
| **Bash**      | ✅ Available | Run shell commands    |
| **Glob**      | ✅ Available | Find files by pattern |
| **Grep**      | ✅ Available | Search file contents  |
| **WebSearch** | ✅ Available | Search the web        |
| **WebFetch**  | ✅ Available | Fetch web pages       |
| **Task**      | ✅ Available | Spawn subagents       |
| **TodoWrite** | ✅ Available | Track tasks           |

### LSP Tools (Real Implementation)

| Tool                        | Status         | Description                                 |
| --------------------------- | -------------- | ------------------------------------------- |
| `lsp_hover`                 | ✅ Implemented | Get type info and documentation at position |
| `lsp_goto_definition`       | ✅ Implemented | Jump to symbol definition                   |
| `lsp_find_references`       | ✅ Implemented | Find all usages of a symbol                 |
| `lsp_document_symbols`      | ✅ Implemented | Get file outline (functions, classes, etc.) |
| `lsp_workspace_symbols`     | ✅ Implemented | Search symbols across workspace             |
| `lsp_diagnostics`           | ✅ Implemented | Get errors, warnings, hints                 |
| `lsp_prepare_rename`        | ✅ Implemented | Check if rename is valid                    |
| `lsp_rename`                | ✅ Implemented | Rename symbol across project                |
| `lsp_code_actions`          | ✅ Implemented | Get available refactorings                  |
| `lsp_code_action_resolve`   | ✅ Implemented | Get details of a code action                |
| `lsp_servers`               | ✅ Implemented | List available language servers             |
| `lsp_diagnostics_directory` | ✅ Implemented | Project-level type checking                 |

> **Note**: LSP tools require language servers to be installed (typescript-language-server, pylsp, rust-analyzer, gopls, etc.). Use `lsp_servers` to check installation status.

### AST Tools (ast-grep Integration)

| Tool               | Status         | Description                                  |
| ------------------ | -------------- | -------------------------------------------- |
| `ast_grep_search`  | ✅ Implemented | Pattern-based code search using AST matching |
| `ast_grep_replace` | ✅ Implemented | Pattern-based code transformation            |

> **Note**: AST tools use [@ast-grep/napi](https://ast-grep.github.io/) for structural code matching. Supports meta-variables like `$VAR` (single node) and `$$$` (multiple nodes).

---

## Performance Monitoring

oh-my-gemini-cli includes comprehensive monitoring for agent performance, token usage, and debugging parallel workflows.

For complete documentation, see **[Performance Monitoring Guide](./PERFORMANCE-MONITORING.md)**.

### Quick Overview

| Feature                 | Description                                     | Access                               |
| ----------------------- | ----------------------------------------------- | ------------------------------------ |
| **Agent Observatory**   | Real-time agent status, efficiency, bottlenecks | HUD / API                            |
| **Session-End Summaries** | Persisted per-session summaries and callback payloads | `.omg/sessions/*.json`, `session-end` |
| **Session Replay**      | Event timeline for post-session analysis        | `.omg/state/agent-replay-*.jsonl`    |
| **Session Search**      | Search prior local transcript/session artifacts  | `omg session search`, `session_search` |
| **Intervention System** | Auto-detection of stale agents, cost overruns   | Automatic                            |

### CLI Commands

```bash
omg hud                              # Render the current HUD statusline
omg team status <team-name>          # Inspect a running team job
tail -20 .omg/state/agent-replay-*.jsonl
ls .omg/sessions/*.json
```

### HUD Presets

Enable a supported preset for agent and context visibility in your status line:

```json
{
  "omgHud": {
    "preset": "focused"
  }
}
```

### External Resources

- **[MarginLab.ai](https://marginlab.ai)** - SWE-Bench-Pro performance tracking with statistical significance testing for detecting Gemini model degradation

---

## Troubleshooting

### Diagnose Installation Issues

```bash
/oh-my-gemini-cli:omg-doctor
```

Checks for:

- Missing dependencies
- Configuration errors
- Hook installation status
- Agent availability
- Skill registration

### Configure HUD Statusline

```bash
/oh-my-gemini-cli:hud setup
```

Installs or repairs the HUD statusline for real-time status updates.

### HUD Configuration (settings.json)

Configure HUD elements in `~/.gemini/settings.json`:

```json
{
  "omgHud": {
    "preset": "focused",
    "elements": {
      "cwd": true,
      "gitRepo": true,
      "gitBranch": true,
      "showTokens": true
    }
  }
}
```

| Element      | Description                                                                                       | Default |
| ------------ | ------------------------------------------------------------------------------------------------- | ------- |
| `cwd`        | Show current working directory                                                                    | `false` |
| `gitRepo`    | Show git repository name                                                                          | `false` |
| `gitBranch`  | Show current git branch                                                                           | `false` |
| `omgLabel`   | Show [OMC] label                                                                                  | `true`  |
| `contextBar` | Show context window usage                                                                         | `true`  |
| `agents`     | Show active agents count                                                                          | `true`  |
| `todos`      | Show todo progress                                                                                | `true`  |
| `ralph`      | Show ralph loop status                                                                            | `true`  |
| `autopilot`  | Show autopilot status                                                                             | `true`  |
| `showTokens` | Show transcript-derived token usage (`tok:i1.2k/o340`, plus `r...` reasoning and `s...` session total when reliable) | `false` |

Additional `omgHud` layout options (top-level):

| Option     | Description                                                                       | Default    |
| ---------- | --------------------------------------------------------------------------------- | ---------- |
| `maxWidth` | Maximum HUD line width (terminal columns)                                         | unset      |
| `wrapMode` | `truncate` (ellipsis) or `wrap` (break at `\|` boundaries) when `maxWidth` is set | `truncate` |

Available presets: `minimal`, `focused`, `full`, `dense`, `analytics`, `opencode`

### Common Issues

| Issue                 | Solution                                                                         |
| --------------------- | -------------------------------------------------------------------------------- |
| Commands not found    | Re-run `/oh-my-gemini-cli:omg-setup`                                             |
| Hooks not executing   | Check hook permissions: `chmod +x ~/.gemini/hooks/**/*.sh`                       |
| Agents not delegating | Verify GEMINI.md is loaded: check `./.gemini/GEMINI.md` or `~/.gemini/GEMINI.md` |
| LSP tools not working | Install language servers: `npm install -g typescript-language-server`            |
| Token limit errors    | Use `/oh-my-gemini-cli:` for token-efficient execution                           |

### Auto-Update

Oh-my-gemini-cli includes a silent auto-update system that checks for updates in the background.

Features:

- **Rate-limited**: Checks at most once every 24 hours
- **Concurrent-safe**: Lock file prevents simultaneous update attempts
- **Cross-platform**: Works on both macOS and Linux

To manually update, re-run the plugin install command or use Gemini Code's built-in update mechanism.

### Uninstall

Use Gemini Code's plugin management:

```
/plugin uninstall oh-my-gemini-cli@oh-my-gemini-cli
```

Or manually remove the installed files:

```bash
rm ~/.gemini/agents/{architect,document-specialist,explore,designer,writer,vision,critic,analyst,executor,qa-tester}.md
rm ~/.gemini/commands/{analyze,autopilot,deepsearch,plan,review,ultrawork}.md
```

---

## Changelog

See [CHANGELOG.md](../CHANGELOG.md) for version history and release notes.

---

## License

MIT - see [LICENSE](../LICENSE)

## Credits

Inspired by [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) by code-yeongyu.
