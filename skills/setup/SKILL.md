---
name: setup
description: Unified setup entrypoint for install, diagnostics, and MCP configuration
level: 2
---

# Setup

Use `/oh-my-gemini-cli:setup` as the unified setup/configuration entrypoint.

## Usage

```bash
/oh-my-gemini-cli:setup                # full setup wizard
/oh-my-gemini-cli:setup doctor         # installation diagnostics
/oh-my-gemini-cli:setup mcp            # MCP server configuration
/oh-my-gemini-cli:setup wizard --local # explicit wizard path
```

## Routing

Route by the first argument:

- No argument, `wizard`, `local`, `global`, or `--force` -> run `/oh-my-gemini-cli:omg-setup {{ARGUMENTS}}`
- `doctor` -> run `/oh-my-gemini-cli:omg-doctor {{ARGUMENTS_AFTER_DOCTOR}}`
- `mcp` -> run `/oh-my-gemini-cli:mcp-setup {{ARGUMENTS_AFTER_MCP}}`

Examples:

```bash
/oh-my-gemini-cli:omg-setup {{ARGUMENTS}}
/oh-my-gemini-cli:omg-doctor {{ARGUMENTS_AFTER_DOCTOR}}
/oh-my-gemini-cli:mcp-setup {{ARGUMENTS_AFTER_MCP}}
```

## Notes

- `/oh-my-gemini-cli:omg-setup`, `/oh-my-gemini-cli:omg-doctor`, and `/oh-my-gemini-cli:mcp-setup` remain valid compatibility entrypoints.
- Prefer `/oh-my-gemini-cli:setup` in new documentation and user guidance.

Task: {{ARGUMENTS}}
