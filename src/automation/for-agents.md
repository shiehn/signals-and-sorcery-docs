---
sidebar: auto
title: For AI agents
---

# For AI agents

Integration notes for the common agent runtimes. Every path is local-only
(runs on `localhost:7655`) — no cloud dependencies, no account linking.

## TL;DR — what to call

If your runtime supports a shell, **prefer the
[plan-as-artifact loop](./plan-loop.md)**:

```
sas inspect → sas plan → sas validate → sas apply → sas preview → sas history undo
```

It's six typed verbs, every mutation is reversible via auto-saved
checkpoints, and the validator's `suggestedFix` tells the agent exactly
how to recover from a missing precondition. Direct tool calls (the
~70-tool catalog further down) still work, but the loop is the
recommended path for any change you might want to undo or iterate on.

## Shell-capable agents (recommended)

### Claude Code

Just run `claude` in a terminal while Signals & Sorcery is open. The
agent will automatically use the `sas` CLI if it's on your `$PATH`.

Optional: drop a note in your project's `CLAUDE.md` (in whichever dir you
run Claude Code from):

```md
# S&S is running locally
You can drive Signals & Sorcery via the `sas` CLI.

Preferred path for any non-trivial change: the plan-as-artifact loop.
  sas inspect project          # see current state
  sas plan "<intent>" --plan-out plan.json
  sas validate plan.json       # check, read errors[].suggestedFix
  sas apply plan.json          # auto-checkpoint pre-apply
  sas preview                  # hear it
  sas history undo <name>      # revert if needed

Direct tools work too — discover with `sas list-actions` / `sas help
<action>`. Every action returns JSON; pipe through `jq`. Exit codes:
0 success, 1 tool/validation failure, 2 bad args.
```

That's it — the agent reads tools on demand and writes shell scripts
against them.

### OpenClaw

Same as Claude Code — OpenClaw has shell access and is bash-fluent. Just
make sure `sas` is on `$PATH` and give the agent a one-line heads-up that
S&S is running.

### Terminal (you, a human)

```bash
# Bookmark these for day-to-day use
alias sas-list='sas list-actions'
alias sas-help='sas help'
alias sas-events='sas events stream'
```

Write shell functions for workflows you repeat:

```bash
compose-lofi() {
  sas compose_scene \
    --description "chill lo-fi beat, $1 BPM" \
    --scene-name "$2" \
    --json '{"tracks":[
      {"name":"Bass","role":"bass","prompt":"deep lo-fi"},
      {"name":"Drums","role":"drums","prompt":"laid-back swung"},
      {"name":"Keys","role":"chords","prompt":"jazzy Rhodes"}
    ]}'
}

# Usage: compose-lofi 85 Verse
```

## MCP-capable agents

For agents without shell (Cursor Agent, Claude Desktop, some Anthropic API
clients), use the MCP path. S&S spawns a local MCP server automatically:

- **Transport:** SSE over HTTP
- **Endpoint:** `http://localhost:19100/sse`
- **Discovery file:** `~/.signals-and-sorcery/mcp.json` (written by S&S at
  startup; contains the active port and auth token if applicable)

### Cursor Agent

Add to your Cursor settings → MCP Servers:

```json
{
  "signals-and-sorcery": {
    "transport": "sse",
    "url": "http://localhost:19100/sse"
  }
}
```

Tools auto-register. Cursor's agent then sees the same typed tool surface
the CLI wraps.

### Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "signals-and-sorcery": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/sse-client", "http://localhost:19100/sse"]
    }
  }
}
```

### MCP-only tips

Without a shell, the agent can't pipe results or assign variables. That's
what **composite tools** are for — they bundle multi-step operations so
MCP-only agents aren't stuck chaining 10+ tool calls:

- `compose_scene` instead of `scene_create` + N × `dsl_track_create` + N ×
  `dsl_generate_midi`
- `add_instrument` instead of `dsl_track_create` + `dsl_generate_midi`
- `play_scene` instead of `scene_activate` + `dsl_play`
- `render_to_performance` for main-output playback
- `create_transition` for bridges between scenes

If you find yourself wanting to do something that requires composing
results across tool calls, check if a composite exists via
`tool_search`. If not, that's a missing composite — file an issue.

## HTTP-direct (Python, notebooks, custom clients)

Every tool lives under `POST /api/v1/execute` on `localhost:7655`.

### Python example

```python
import requests, json

API = "http://localhost:7655"

def execute(action, **params):
    r = requests.post(f"{API}/api/v1/execute",
                      json={"action": action, "params": params})
    r.raise_for_status()
    return r.json()["data"]

# Compose a scene
execute("compose_scene",
        description="chill lo-fi",
        sceneName="Verse",
        tracks=[
            {"name": "Bass",  "role": "bass",  "prompt": "deep slow"},
            {"name": "Drums", "role": "drums", "prompt": "laid-back"},
        ])

# Stream events
with requests.get(f"{API}/api/v1/events/stream", stream=True) as r:
    for line in r.iter_lines():
        if line.startswith(b'event: domainEvent'):
            print(line.decode())
```

### Tool discovery

```bash
# Default curated set — what every agent sees out of the box
curl http://localhost:7655/api/v1/actions

# Just scene-scoped tools (matches the in-app chat-plugin's default surface)
curl 'http://localhost:7655/api/v1/actions?scope=scene'

# Every registered tool, including deferred (admin/debug)
curl 'http://localhost:7655/api/v1/actions?include_deferred=true'
```

The CLI (`sas list-actions`) and the in-app chat-plugin agent both read
from the same registry with the same default filter — Errantry's CLI tests
therefore exercise the chat-plugin's surface too. **Whatever's reachable
via `sas` is reachable from the chat agent**, and vice versa.

## Tool surface summary

The default curated set (`?scope=scene` or chat-plugin default) covers
the natural verbs an agent reaches for during music production. Tools
marked **deferred** require `tool_search` to discover.

| Category | Tools (default surface unless noted) |
|---|---|
| **Plan loop** (recommended) | `sas_inspect_project`, `sas_inspect_scene`, `sas_inspect_track`, `sas_inspect_history`, `sas_create_plan`, `sas_validate_plan`, `sas_apply_plan`, `sas_render_preview`, `sas_history_list`, `sas_history_checkpoint`, `sas_history_undo`, `sas_history_delete`, `sas_history_prune` |
| **Project** | `project_get_status`, `list_projects` |
| **Scene navigation** | `scene_get_all`, `scene_activate`, `scene_duplicate`, `scene_delete`, `scene_find_by_name` |
| **Scene plumbing** *(deferred)* | `scene_create`, `scene_get_tracks`, `scene_set_mute`, `scene_add_track`, `scene_move_track`, `scene_queue`, `scene_set_collapsed` |
| **Tracks** | `dsl_track_create`, `dsl_list_tracks`, `dsl_track_delete`, `dsl_track_mute`, `dsl_track_solo`, `dsl_track_volume`, `dsl_track_pan`, `dsl_track_rename` |
| **Transport** | `dsl_play`, `dsl_stop`, `dsl_set_tempo` (deferred: `dsl_get_tempo_info`) |
| **MIDI generation** | `dsl_generate_midi` (deferred: `dsl_generate_drums`) |
| **FX** | `dsl_set_track_fx`, `dsl_get_track_fx`, `set_scene_fx`, `dsl_load_fx_chain` |
| **Musical context** | `get_musical_context`, `set_musical_context` |
| **Samples** *(deferred)* | `search_samples`, `import_samples`, `add_sample_track` |
| **Export** *(deferred)* | `export_audio` |
| **Composites** | `compose_scene`, `add_instrument`, `play_scene`, `render_to_performance`, `create_transition` |
| **Discovery** | `tool_search` (always visible — finds any registered tool, deferred or not) |

## Pattern: observe → reason → act

Modern agents work best when they check state before mutating. The
canonical pattern is the [plan-as-artifact loop](./plan-loop.md):

1. **Observe** — `sas inspect project` returns scenes, tracks, key/BPM,
   and recent checkpoints in one call.
2. **Plan** — `sas plan "<intent>" --plan-out plan.json` produces a
   typed Plan grounded in current state.
3. **Validate** — `sas validate plan.json` checks preconditions; errors
   include `suggestedFix` so the agent can self-correct without a
   round-trip to the user.
4. **Apply** — `sas apply plan.json` auto-creates a checkpoint, runs
   the steps, and rolls compensate hooks LIFO on failure.
5. **Preview** — `sas preview` returns a content-addressed audio URL.
6. **Iterate or undo** — `sas history undo <checkpoint>` restores the
   project byte-for-byte if the result missed.

Direct tool calls (`scene_create`, `dsl_track_create`, …) still work
and are the right choice for trivial one-shots, but the plan loop is
the recommended path for anything stateful, multi-step, or worth
undoing. Every tool response includes a `changes` field with semantic
names (not just UUIDs), so chaining conversationally still works on the
direct path.

## When a tool fails

Every failure response has:

- `error` — the reason, short
- `message` — human-readable one-liner
- `suggestion` — *what the agent should do next* (concrete: tool name,
  often with example params)
- `changes.availableX` — when a referenced entity (track, scene,
  project) doesn't resolve, the response lists what DOES exist

Example:

```json
{
  "success": false,
  "error": "Track not found",
  "message": "Track not found: 'Synth Lead'",
  "suggestion": "Check the track name. Available tracks: Bass, Drums, Keys.",
  "changes": {
    "availableTracks": [
      {"id": "t1", "name": "Bass"},
      {"id": "t2", "name": "Drums"},
      {"id": "t3", "name": "Keys"}
    ]
  }
}
```

Agents read the `suggestion`, adjust, and retry. No guesswork, no
round-trips to `get_status`.

## Further reading

- [Plan-as-artifact loop](./plan-loop.md) — the six-verb agent surface
  end-to-end: Plan schema, validator semantics, checkpoints, recovery.
- [CLI reference](./cli-reference.md)
- [Worked examples](./examples.md)
- [Plugin SDK](/plugin-sdk/) — for building your own generator plugins
- Full design rationale: [`sas-assistant/docs-ai-planning/ai-orchestration-design.md`](https://github.com/shiehn/sas-platform/blob/main/sas-assistant/docs-ai-planning/ai-orchestration-design.md)
