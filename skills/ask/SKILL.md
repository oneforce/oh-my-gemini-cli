---
name: ask
description: Ask Gemini, Codex, or Gemini via local CLI and capture a reusable artifact
---

# Ask

Use OMC's canonical advisor skill to route a prompt through the local Gemini, Codex, or Gemini CLI and persist the result as an ask artifact.

## Usage

```bash
/oh-my-gemini-cli:ask <gemini|codex|gemini> <question or task>
```

Examples:

```bash
/oh-my-gemini-cli:ask codex "review this patch from a security perspective"
/oh-my-gemini-cli:ask gemini "suggest UX improvements for this flow"
/oh-my-gemini-cli:ask gemini "draft an implementation plan for issue #123"
```

## Routing

**Required execution path — always use this command:**

```bash
omg ask {{ARGUMENTS}}
```

**Do NOT manually construct raw provider CLI commands.** Never run `codex`, `gemini`, or `gemini` directly to fulfill this skill. The `omg ask` wrapper handles correct flag selection, artifact persistence, and provider-version compatibility automatically. Manually assembling provider CLI flags will produce incorrect or outdated invocations.

## Requirements

- The selected local CLI must be installed and authenticated.
- Verify availability with the matching command:

```bash
gemini --version
codex --version
gemini --version
```

## Artifacts

`omg ask` writes artifacts to:

```text
.omg/artifacts/ask/<provider>-<slug>-<timestamp>.md
```

Task: {{ARGUMENTS}}
