---
sidebar: auto
title: For AI agents
---

# For AI agents

Integration notes for the common agent runtimes. Every path is local-only
(runs on `localhost:7655`) — no cloud dependencies, no account linking.

## Shell-capable agents (recommended)

### Claude Code

Just run `claude` in a terminal while Signals & Sorcery is open. The
agent will automatically use the `sas` CLI if it's on your `$PATH`.

Optional: drop a note in your project's `CLAUDE.md` (in whichever dir you
run Claude Code from):

```md
# S&S is running locally
You can drive Signals & Sorcery via the `sas` CLI. Discover tools with
`sas list-actions` and `sas help <action>`. Every action returns JSON;
pipe through `jq` to extract fields. Exit codes follow Unix conventions
(0 success, 1 tool failure, 2 bad args).
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
# List the default core tool set
curl http://localhost:7655/api/v1/actions

# List every tool (including deferred)
curl 'http://localhost:7655/api/v1/actions?all=true'
```

## Tool surface summary

| Category | Tools |
|---|---|
| **Project** | `project_get_status`, `list_projects` |
| **Scenes** | `scene_create`, `scene_activate`, `scene_delete`, `scene_get_all`, `scene_get_tracks`, `scene_set_mute`, `scene_add_track`, `scene_move_track`, `scene_find_by_name` |
| **Tracks** | `dsl_track_create`, `dsl_track_delete`, `dsl_track_mute`, `dsl_track_solo`, `dsl_list_tracks` |
| **MIDI generation** | `dsl_generate_midi`, `dsl_generate_drums` |
| **FX** | `dsl_set_track_fx`, `dsl_get_track_fx`, `set_scene_fx`, `dsl_load_fx_chain` |
| **Transport** | `dsl_play`, `dsl_stop`, `dsl_set_tempo`, `dsl_get_tempo_info` |
| **Musical context** | `get_musical_context`, `set_musical_context` |
| **Samples** | `search_samples`, `import_samples`, `add_sample_track` |
| **Export** | `export_audio` |
| **Composites** | `compose_scene`, `add_instrument`, `play_scene`, `render_to_performance`, `create_transition` |
| **Discovery** | `tool_search` (finds deferred tools by keyword) |

## Pattern: observe → reason → act

Modern agents work best when they check state before mutating. The
standard pattern:

1. `project_get_status` — am I bound to a project? What scenes exist?
2. `get_musical_context` — what's the key / BPM / chords?
3. `dsl_list_tracks` or `scene_get_tracks` — what's already there?
4. Make the change (compose / mutate / play)
5. Observe the resulting state via the returned `changes` field (it
   always includes a semantic snapshot) and any emitted events

Our tool responses are designed for this. Every success returns enough
state that the agent doesn't need to re-query — the `changes` field
contains names, not just UUIDs, so an agent can chain operations
conversationally.

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

- [CLI reference](./cli-reference.md)
- [Worked examples](./examples.md)
- [Plugin SDK](/plugin-sdk/) — for building your own generator plugins
- Full design rationale: [`sas-assistant/docs-ai-planning/ai-orchestration-design.md`](https://github.com/shiehn/sas-platform/blob/main/sas-assistant/docs-ai-planning/ai-orchestration-design.md)
