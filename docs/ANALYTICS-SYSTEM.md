# Analytics System (Removed)

## Status

The legacy analytics subsystem referenced by issue #1533 no longer exists on current `dev`.

The original code paths (`src/analytics/session-manager.ts`, `src/analytics/query-engine.ts`, and the related `omc-analytics` / `omc cost` / `omc backfill` workflow) were removed in commit `8011af06` as part of the broader analytics cleanup.

## What Replaced It

Current builds still expose useful monitoring surfaces, but they are different from the removed analytics stack:

- **Agent Observatory** — real-time agent status in the HUD / API
- **Session Replay** — `.omc/state/agent-replay-*.jsonl` event timelines
- **Session-end summaries** — `.omc/sessions/<sessionId>.json` written by the `session-end` hook
- **Session-end notifications/callbacks** — summary payloads sent through configured notification channels

## What Is No Longer Available

The following legacy surfaces should be treated as removed:

- `omc-analytics`
- `omc cost`, `omc sessions`, `omc export`, `omc backfill`
- the HUD `analytics` preset
- `src/analytics/*` implementation files
- the old metrics cleanup pipeline described in issue #1533

## If You Need Session Metrics Today

Use the currently supported surfaces instead:

```bash
omc hud
tail -20 .omc/state/agent-replay-*.jsonl
ls .omc/sessions/*.json
```

For integration hooks, inspect the `session-end` summary JSON and notification payloads rather than looking for the removed analytics commands.
