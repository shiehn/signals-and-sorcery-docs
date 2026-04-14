---
sidebar: auto
title: sas CLI reference
---

# `sas` CLI reference

The `sas` command is a thin wrapper around the local S&S HTTP API. It
auto-discovers tools from `/api/v1/actions`, so every tool registered in
the app is available as a CLI subcommand *with zero CLI rebuild*.

## Install

The CLI ships with the app. For local development:

```bash
# From the app's install directory
npm run build:cli    # compiles to dist/cli/sas.js
ln -s "$(pwd)/dist/cli/sas.js" /usr/local/bin/sas
```

Production users will eventually get it via:

```bash
npm install -g signals-and-sorcery
```

## Verify

```bash
sas health
# { "status": "ok", "timestamp": "2026-04-14T..." }
```

If that fails with *"Cannot reach S&S API at http://localhost:7655"*, the
app isn't running. Start it and try again.

## Usage shape

```
sas <action> [--key value]...        Run a tool action by name
sas list-actions                     List every registered tool
sas help [action]                    Show top-level help, or per-action help
sas health                           Reachability check
sas events stream                    SSE stream of typed domain events
sas jobs list [--status <s>]         Background jobs
sas jobs get <id>                    One job's state
sas jobs wait <id> [--timeout <ms>]  Long-poll until a job completes
sas jobs cancel <id>                 Cancel a running job
```

## Global flags

| Flag | Effect |
|---|---|
| `--pretty` | Indent JSON output (default is compact for pipe-friendliness) |
| `--quiet` | Suppress error messages on stderr |
| `--api <url>` | Override API base URL (also via `$SAS_API_URL`) |
| `-h`, `--help` | Top-level help, or per-action help if passed after an action name |

## Argument conventions

- **Kebab-case flags → camelCase params:** `--scene-id abc` maps to
  `sceneId: "abc"` in the underlying tool call.
- **Booleans:** `--enabled` (true), `--no-enabled` or `--enabled=false`
  (false).
- **Numbers:** `--bpm 90` — coerced from the tool's input schema; non-numeric
  values error out early with exit 2.
- **Arrays:** repeat the flag — `--paths a.wav --paths b.wav`.
- **Nested objects (escape hatch):** `--json '{"key":"value"}'`.

## Exit codes

| Code | Meaning |
|---|---|
| `0` | Success |
| `1` | Tool returned `success: false`, OR a runtime error (engine offline, bad JSON, etc.) |
| `2` | Argument parsing failure (bad flag, missing required value, bad type) |

This means `set -e` works in shell scripts — a failing tool stops the
script unless you explicitly handle it.

## Tool discovery

```bash
# Every action
sas list-actions

# One action's full help (parameters + when-to-use)
sas help compose_scene
sas help dsl_set_track_fx
```

Help output follows the [4-section template][template] every tool is
enforced to have:

- **WHEN TO USE** — scenarios that fit this tool
- **WHEN NOT TO USE** — when another tool fits better (named)
- **INPUTS** — parameter list with example values
- **OUTPUTS** — success / failure envelope shape and emitted events

## Progressive disclosure

By default `list-actions` returns the core tool set (~15 tools). Less-common
tools (samples, export, etc.) are *deferred* — agents discover them via
`tool_search`:

```bash
# Agent: I need something to export audio. Let me search.
sas tool_search --query "export wav" --limit 3
# Returns matches ranked by name + description relevance, with schemas
# so the agent can invoke directly.
```

To see every registered tool (including deferred), pass `--all` on the
HTTP API or set the env var:

```bash
curl 'http://localhost:7655/api/v1/actions?all=true'
```

## Events

Every mutating tool emits typed domain events. Stream them to react in
real time:

```bash
# Raw JSON event stream (one event per line)
sas events stream

# Filter for specific event types
sas events stream | grep 'track:created'

# Pretty-print with jq
sas events stream | jq -r 'select(.event == "domainEvent") | .data'
```

Event types include: `scene:created`, `scene:activated`, `track:created`,
`track:midi-written`, `track:fx-changed`, `bpm:changed`,
`deck:state-changed`, `sample:imported`, `transition:created`, and more.

## Jobs

Long-running tools (like `compose_scene`) open a `JobManager` job so
consumers can watch progress:

```bash
# Start a compose and capture the response
JOB=$(sas compose_scene --description "chill lo-fi" --scene-name "Verse" \
  --json '{"tracks":[{"name":"Bass","role":"bass","prompt":"deep slow"}]}' \
  | jq -r '.jobId // empty')

# If job-based, wait for completion
[ -n "$JOB" ] && sas jobs wait "$JOB" --timeout 60000
```

Even without `jobs wait`, the tool returns the final result when the
composite finishes — the job is for progress observers, not callers.

## Idempotency keys

All mutating tools accept a top-level `--idempotency-key`:

```bash
# Same key + same params = same result (cached within 60s, per project)
sas dsl_track_create --idempotency-key "retry-abc-1" --name "Bass" --role bass
sas dsl_track_create --idempotency-key "retry-abc-1" --name "Bass" --role bass
# ↑ second call returns the first's result — no duplicate track
```

Safe to retry on transient errors without corrupting state. See the
[AI orchestration design doc][design] § 8 for the full spec.

## The `--json` escape hatch

For tools with complex nested inputs (like `compose_scene` which takes a
`tracks` array), pass them as JSON directly:

```bash
sas compose_scene \
  --description "chill lo-fi" \
  --scene-name "Verse" \
  --json '{
    "tracks": [
      {"name": "Bass",  "role": "bass",  "prompt": "deep, slow lo-fi"},
      {"name": "Drums", "role": "drums", "prompt": "laid-back swung"},
      {"name": "Keys",  "role": "chords","prompt": "jazzy extensions"}
    ]
  }'
```

[template]: https://github.com/shiehn/sas-platform/blob/main/sas-assistant/docs-ai-planning/ai-orchestration-design.md#236-tool-description-template
[design]: https://github.com/shiehn/sas-platform/blob/main/sas-assistant/docs-ai-planning/ai-orchestration-design.md
