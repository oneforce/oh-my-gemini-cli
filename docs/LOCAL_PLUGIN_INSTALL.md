# Local Plugin Installation

How to install oh-my-gemini-cli from a local development directory as a Gemini Code plugin.

## Quick Install

```bash
# 1. Add local directory as a marketplace
gemini plugin marketplace add /path/to/oh-my-gemini-cli

# 2. Install the plugin from the local marketplace
gemini plugin install oh-my-gemini-cli@oh-my-gemini-cli

# 3. Restart Gemini Code to pick up the plugin
```

## Commands Reference

```bash
# List configured marketplaces
gemini plugin marketplace list

# Update marketplace (re-read from source)
gemini plugin marketplace update oh-my-gemini-cli

# Update the installed plugin
gemini plugin update oh-my-gemini-cli@oh-my-gemini-cli

# List installed plugins
gemini plugin list

# Uninstall
gemini plugin uninstall oh-my-gemini-cli@oh-my-gemini-cli

# Remove marketplace
gemini plugin marketplace remove oh-my-gemini-cli
```

## Plugin Structure

The plugin requires a `plugin.json` manifest:

```json
{
  "name": "oh-my-gemini-cli",
  "version": "3.4.0",
  "description": "Multi-agent orchestration system for Gemini Code",
  "hooks": {
    "PreToolUse": ["scripts/pre-tool-enforcer.mjs"],
    "PostToolUse": ["scripts/post-tool-verifier.mjs"],
    "SessionStart": ["scripts/session-start.mjs"]
  },
  "agents": ["agents/*.md"],
  "commands": ["commands/**/*.md"],
  "skills": ["skills/*.md"]
}
```

## Development Workflow

After making changes to the plugin:

```bash
# 1. Build (if TypeScript changes)
npm run build

# 2. Update the marketplace cache
gemini plugin marketplace update oh-my-gemini-cli

# 3. Update the installed plugin
gemini plugin update oh-my-gemini-cli@oh-my-gemini-cli

# 4. Restart Gemini Code session
```

## Vs. npm Global Install

| Method | Command | Files Location |
|--------|---------|----------------|
| Plugin | `gemini plugin install` | `~/.gemini/plugins/cache/` |
| npm global | `npm install -g` | `~/.gemini/agents/`, `~/.gemini/commands/` |

**Plugin mode is preferred** - it keeps files isolated and uses the native Gemini Code plugin system with `${CLAUDE_PLUGIN_ROOT}` variable for path resolution.

## Troubleshooting

**Plugin not loading:**
- Restart Gemini Code after installation
- Check `gemini plugin list` shows status as "enabled"
- Verify plugin.json exists and is valid JSON

**Old version showing:**
- The cache directory name may show old version, but the actual code is from latest commit
- Run `gemini plugin marketplace update` then `gemini plugin update`
