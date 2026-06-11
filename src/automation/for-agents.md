---
sidebar: auto
title: For agents
---

# For agents

Integration notes for the common agent runtimes. Every path is local-only
(runs on `localhost:7655`): no cloud dependencies, no account linking.

## TL;DR: what to call

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

> **Async-by-default.** Every state-mutating tool now returns
> `changes.jobId` immediately and finishes in the background. Before
> depending on the result, agents MUST call `wait_for_job` (or
> `sas job wait` from a shell). See
> [Status & async jobs](./status-and-jobs.md) for the full contract.

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
  sas apply plan.json          # auto-checkpoint pre-apply, returns jobId
  sas job wait <jobId>         # block until apply finishes
  sas preview                  # hear it
  sas history undo <name>      # revert if needed

Async-by-default: every state-mutating tool returns `changes.jobId`. Call
`sas job wait <jobId>` (or `wait_for_job` via `sas run`) before any tool
that depends on the result.

Direct tools work too; discover with `sas list-actions` / `sas help
<action>`. Every action returns JSON; pipe through `jq`.

Exit codes: 0 success; 1 plan-validation failure; 2 bad args / tool
failure; 3 connection refused (app not running); 4 `sas job wait`
timeout; 5 job ended in failed state.
```

That's it. The agent reads tools on demand and writes shell scripts
against them.

### OpenClaw

Same as Claude Code: OpenClaw has shell access and is bash-fluent. Just
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
clients), use the MCP path. S&S runs an in-process MCP server automatically
inside the Electron main process while the app is open:

- **Transport:** SSE over HTTP
- **Endpoint:** `http://localhost:19100/sse`
- **Discovery file:** `~/.signals-and-sorcery/mcp.json` (written by S&S at
  startup; contains the active port and auth token if applicable)

The MCP server exposes **8 tools** following the Anthropic six-primitive
ceiling plus two meta-tools for progressive disclosure. All eight funnel
through the same `ToolRegistry.execute()` chokepoint as the CLI and HTTP
paths, so behaviour and remediation envelopes are identical across
surfaces.

| MCP tool | Purpose | Async? |
|---|---|---|
| `sas_inspect` | Read-only view; `resource: project\|scene\|track\|history` | No (sub-second) |
| `sas_create_plan` | Free-text intent → typed JSON Plan | No |
| `sas_validate_plan` | Validate a Plan; errors carry `suggestedFix` | No |
| `sas_apply_plan` | Execute Plan reversibly (auto-checkpoint) | **Yes, returns `jobId`** |
| `sas_render_preview` | Content-addressed audio preview | No (cache-aware) |
| `sas_undo_checkpoint` | Restore to a named checkpoint | No |
| `tool_search` | Find a tool by keyword in the granular catalog | No |
| `sas_run` | Invoke any registered action by name (post-discovery) | Depends on action |

The flow for an MCP-only agent:

1. `sas_inspect` to read state.
2. `sas_create_plan` → `sas_validate_plan` → `sas_apply_plan`.
3. Because `sas_apply_plan` is async-wrapped, it returns
   `changes.jobId`. Call `sas_run` with `action: "wait_for_job"` and the
   `jobId` to block until the work is done.
4. `sas_render_preview` to hear the result.
5. `sas_undo_checkpoint` if the result missed.

Granular tools (`scene_create`, `dsl_track_create`, `make_beat`, etc.)
are discoverable via `tool_search` and invokable via `sas_run`. Each
async wrapped tool returns the same `{ jobId, status, operation }`
envelope; the agent always reaches for `wait_for_job` afterwards. See
[Status & async jobs](./status-and-jobs.md) for the full list.

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

### Claude Code (via MCP, an alternative to the CLI)

```bash
claude mcp add signals-and-sorcery --transport sse http://localhost:19100/sse
```

When `sas` is also on PATH, Claude Code can use either surface; the CLI
is more ergonomic for shell scripting, MCP for tool-call discovery.

### MCP-only tips

Without a shell, the agent can't pipe results or assign variables. That's
what **composite tools** are for: they bundle multi-step operations so
MCP-only agents aren't stuck chaining 10+ tool calls:

- `compose_scene` instead of `scene_create` + N × `dsl_track_create` + N ×
  `dsl_generate_midi` (creates scene + LLM contract + all tracks in one call)
- `compose_contract` for the "contract first, then instruments" flow:
  creates the scene + LLM contract (genre/key/chords/BPM) with **no
  tracks**, then the agent calls `add_instrument` N times. Use this when
  the user wants to nail the contract before committing to instruments.
- `add_instrument` instead of `dsl_track_create` + `dsl_generate_midi`
- `play_scene` instead of `scene_activate` + `dsl_play`
- `render_to_performance` for main-output playback
- `create_transition` for bridges between scenes

### Scene loop length: pass `barLength` (2, 4, 8, or 16)

`compose_scene` and `compose_contract` both accept a `barLength` input,
the SCENE's loop length in bars. Must be one of `{2, 4, 8, 16}`, default
`4`. Pass it when the user specifies a scene length:

```bash
# "A 2-bar disco beat": pass barLength=2 so the scene loops every 2 bars
sas compose_contract --name "Disco" --description "2-bar disco beat" --bar-length 2

# "A long 16-bar intro": pass barLength=16
sas compose_scene --description "ambient 16-bar intro" --scene-name "Intro" --bar-length 16 \
  --json '{"tracks":[{"name":"Pad","role":"pads","prompt":"slow swell"}]}'
```

Don't confuse `barLength` (scene loop length) with the per-track `bars`
field inside the `tracks[]` array (how many bars of MIDI to generate for
that track). They're independent.

If you find yourself wanting to do something that requires composing
results across tool calls, check if a composite exists via
`tool_search`. If not, that's a missing composite; file an issue.

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
# Default curated set: what every agent sees out of the box
curl http://localhost:7655/api/v1/actions

# Just scene-scoped tools (matches the in-app chat-plugin's default surface)
curl 'http://localhost:7655/api/v1/actions?scope=scene'

# Every registered tool, including deferred (admin/debug)
curl 'http://localhost:7655/api/v1/actions?include_deferred=true'
```

The CLI (`sas list-actions`) and the in-app chat-plugin agent both read
from the same registry with the same default filter; Errantry's CLI tests
therefore exercise the chat-plugin's surface too. **Whatever's reachable
via `sas` is reachable from the chat agent**, and vice versa.

## Tool surface summary

The default curated set (`?scope=scene` or chat-plugin default) covers
the natural verbs an agent reaches for during music production. Tools
marked **deferred** require `tool_search` to discover.

| Category | Tools (default surface unless noted) |
|---|---|
| **MCP primitives** (always visible to MCP clients) | `sas_inspect`, `sas_create_plan`, `sas_validate_plan`, `sas_apply_plan`, `sas_render_preview`, `sas_undo_checkpoint`, `tool_search`, `sas_run`. See [MCP-capable agents](#mcp-capable-agents) for routing details |
| **Plan loop** (CLI surface) | `sas inspect project\|scene\|track\|history`, `sas plan`, `sas validate`, `sas apply` (async), `sas preview`, `sas history list\|checkpoint\|undo\|delete\|prune` |
| **Async job control** | `sas job list\|status\|wait\|cancel` (CLI) · `wait_for_job` (via `sas_run` for MCP). See [Status & async jobs](./status-and-jobs.md) |
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
| **Composites** | `compose_scene`, `compose_contract`, `add_instrument`, `play_scene`, `render_to_performance`, `create_transition` |
| **Preset shuffle** | `dsl_shuffle_preset`: re-roll the Surge XT preset on a track without touching MIDI (agent parity with the UI 🎲 button) |
| **Capability tools** (consent-gated) | `fs_list_directory`, `fs_read_file`, `fs_search`, `fs_write_file`, `shell_exec`. See [Capability tools](./capability-tools.md). Every call pops a per-action consent dialog on the user's machine. |
| **Discovery** | `tool_search` (always visible; finds any registered tool, deferred or not) |

## Pattern: observe → reason → act

Modern agents work best when they check state before mutating. The
canonical pattern is the [plan-as-artifact loop](./plan-loop.md):

1. **Observe**: `sas inspect project` returns scenes, tracks, key/BPM,
   and recent checkpoints in one call.
2. **Plan**: `sas plan "<intent>" --plan-out plan.json` produces a
   typed Plan grounded in current state.
3. **Validate**: `sas validate plan.json` checks preconditions; errors
   include `suggestedFix` so the agent can self-correct without a
   round-trip to the user.
4. **Apply**: `sas apply plan.json` auto-creates a checkpoint, runs
   the steps, and rolls compensate hooks LIFO on failure.
5. **Preview**: `sas preview` returns a content-addressed audio URL.
6. **Iterate or undo**: `sas history undo <checkpoint>` restores the
   project byte-for-byte if the result missed.

Direct tool calls (`scene_create`, `dsl_track_create`, …) still work
and are the right choice for trivial one-shots, but the plan loop is
the recommended path for anything stateful, multi-step, or worth
undoing. Every tool response includes a `changes` field with semantic
names (not just UUIDs), so chaining conversationally still works on the
direct path.

## When a tool fails

Every failure response has:

- `error`: the reason, short
- `message`: human-readable one-liner
- `suggestion`: *what the agent should do next* (concrete: tool name,
  often with example params)
- `changes.availableX`: when a referenced entity (track, scene,
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

- [Plan-as-artifact loop](./plan-loop.md): the six-verb agent surface
  end-to-end, covering the Plan schema, validator semantics, checkpoints, recovery.
- [Status & async jobs](./status-and-jobs.md): `sas health` / `sas
  status`, the `/api/v1/jobs*` endpoints, SSE event names, the
  `wait_for_job` MCP tool, and the list of async-wrapped tools.
- [CLI reference](./cli-reference.md)
- [Capability tools](./capability-tools.md): filesystem + shell access from the agent, gated by per-call user consent.
- [Worked examples](./examples.md)
- [Plugin SDK](/plugin-sdk/): for building your own generator plugins
- Full design rationale: [`sas-app/docs-ai-planning/ai-orchestration-design.md`](https://github.com/shiehn/sas-platform/blob/main/sas-app/docs-ai-planning/ai-orchestration-design.md)
