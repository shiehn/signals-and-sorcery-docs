---
sidebar: auto
title: sas CLI reference
---

# `sas` CLI reference

The `sas` command is a thin wrapper around the local S&S HTTP API. It
auto-discovers tools from `/api/v1/actions`, so every tool registered in
the app is available as a CLI subcommand *with zero CLI rebuild*.

## Install

**macOS** — the installer runs automatically on first launch:

1. Launch Signals & Sorcery.
2. On the final wizard screen ("You're all set!") leave
   **"Add `sas` command to your terminal"** checked.
3. Approve the admin prompt. The app writes a small wrapper to
   `/usr/local/bin/sas` that runs the CLI through the app's own
   bundled runtime — you don't need Node.js installed.
4. Open a **new** terminal window (your existing shells don't
   inherit PATH changes).

Want to install later, reinstall after moving the app, or remove it?
**Settings → Developer Tools → sas CLI** has Install / Reinstall /
Uninstall buttons that read the current status and kick off the same
one-prompt flow.

### If you decline the admin prompt

We don't leave you empty-handed. If you click **Cancel** on the admin
dialog, the app offers to install for just your account — no admin
required. The wrapper lands at `~/.local/bin/sas` instead of
`/usr/local/bin/sas`. Two follow-ups you'll need to do yourself:

1. **Add `~/.local/bin` to your PATH.** It's not on PATH by default
   on macOS. Add this to your shell profile (`~/.zshrc`,
   `~/.bashrc`, or equivalent):

   ```bash
   export PATH="$HOME/.local/bin:$PATH"
   ```

   …then open a new terminal and `sas --version` should work.

2. **Or invoke by full path:** `~/.local/bin/sas get_status`.
   Works immediately, no profile editing required.

You can switch to the admin-backed system-wide install at any time
from **Settings → Developer Tools → sas CLI** — click **Uninstall**
(removes the user-local copy without a prompt), then **Install**.

### If `sas` is not found after install

The install writes to two places: `/usr/local/bin/sas` (the wrapper)
and `/etc/paths.d/signals-and-sorcery` (for shells that don't have
`/usr/local/bin` on PATH by default, like fish). A few scenarios can
still leave `sas` out of reach:

| Symptom | Fix |
|---|---|
| `zsh: command not found: sas` in a terminal you had open during install | Open a *new* terminal — the old shell still has the pre-install PATH |
| *New* terminal also says `command not found` | Open **Settings → Developer Tools → sas CLI** and click **Reinstall**. The status line will read `stale` or `not-installed` and the fix is one click. |
| Preferences shows `Status: stale — the app moved since install` | Click **Reinstall** — the wrapper hard-codes the app path at install time; moving the app bundle invalidates the wrapper. |
| Preferences shows `Status: managed by Homebrew` (or Nix, or another app) | Remove the foreign `/usr/local/bin/sas` first (`brew uninstall …`), then click Install. The app refuses to clobber binaries it didn't write. |
| You use a non-default shell with a custom PATH that drops `/usr/local/bin` | Run `export PATH=/usr/local/bin:$PATH` to verify the wrapper works, then add that line to your shell rc. |

**Can't make the CLI work?** You don't need it. The CLI is a thin
wrapper around the local HTTP API — `curl` against
`http://localhost:7655/api/v1/execute` gives you every action the
CLI has. See the [automation overview](./README.md#quick-start) for
worked examples.

**Windows / Linux**: the auto-installer is macOS-only today (the
admin-elevation mechanism differs per platform). Use the HTTP or
MCP paths instead — they work uniformly.

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

# Plan-as-artifact surface (recommended for agents)
sas inspect project [--include …]    Read-only project snapshot
sas inspect scene [sceneId]          One scene + its tracks
sas inspect track <trackId>          One track's mute/solo/vol/pan
sas inspect history [--limit n]      Recent checkpoints
sas plan <intent…> [--plan-out f]    Free-text → typed JSON Plan
sas validate <plan-file|->           Validate a plan against current state
sas apply <plan-file|-> [--checkpoint name|--dry-run|--skip-checkpoint]
sas preview [sceneId] [--track-id …] [--refresh] [--bpm …] [--bars …]
sas history list [--limit n]         List checkpoints (newest first)
sas history checkpoint <name> [--notes …]   Manual checkpoint
sas history undo <name>              Restore to checkpoint
sas history delete <name>            Drop one checkpoint
sas history prune                    Drop expired checkpoints
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

By default `list-actions` returns the curated core tool set (~24 scene-scoped
verbs covering create, mix, transport, scene navigation, plus the plan-loop
verbs). Less-common tools (samples, export, advanced scene plumbing, etc.)
are *deferred* — agents discover them via `tool_search`:

```bash
# Agent: I need something to export audio. Let me search.
sas tool_search --query "export wav" --limit 3
# Returns matches ranked by name + description relevance, with schemas
# so the agent can invoke directly.
```

The same default-curated set is what the in-app chat-plugin agent sees —
`/api/v1/actions` (used by the `sas` CLI) and `host.listAppTools` (used by
the chat-plugin) share a single filter implementation. Adding a tool to
the registry exposes it on both surfaces atomically; promoting a deferred
tool reaches both at once.

### Filter parameters

| Query | Effect |
|---|---|
| *(none)* | Curated default — non-deferred tools across all scopes |
| `?scope=scene` | Non-deferred, scene-scoped only (mirrors the chat-plugin's default) |
| `?scope=project` | Non-deferred, project-scoped only |
| `?include_deferred=true` | All registered tools incl. deferred |
| `?all=true` | Legacy alias of `?include_deferred=true` |

```bash
# What the chat-plugin's agent sees by default
curl 'http://localhost:7655/api/v1/actions?scope=scene'

# Every registered tool (admin/debug visibility)
curl 'http://localhost:7655/api/v1/actions?include_deferred=true'
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

## Scene loop length: `--bar-length`

`compose_scene` and `compose_contract` both accept `--bar-length` (one of
`2`, `4`, `8`, `16`; default `4`). It sets the SCENE's loop length —
distinct from the per-track `bars` field inside the `tracks[]` array
(which controls how many bars of MIDI to generate for each track).

```bash
# Two-bar disco contract — no tracks yet, agent adds instruments next
sas compose_contract \
  --name "Disco" \
  --description "punchy 2-bar disco" \
  --bar-length 2

# Long 16-bar ambient intro, three tracks generated at once
sas compose_scene \
  --description "ambient 16-bar intro in F minor" \
  --scene-name "Intro" \
  --bar-length 16 \
  --json '{"tracks":[
    {"name":"Pad","role":"pads","prompt":"slow swell"},
    {"name":"Bass","role":"bass","prompt":"sub drone"},
    {"name":"Lead","role":"lead","prompt":"sparse melodic line"}
  ]}'
```

Passing an invalid `--bar-length` returns a structured remediation
envelope pointing at the allowed values; the LLM-extracted bars from the
prompt (when detectable) override the hint.

### `compose_contract` vs `compose_scene`

| Use case | Tool |
|---|---|
| One-shot "scene + contract + tracks" | `compose_scene` |
| "Contract first, then I'll pick instruments" | `compose_contract` then N × `add_instrument` |

`compose_contract` returns the new scene's `sceneId` / `engineSceneId` in
its result and a `nextSteps` array pre-substituted with the scene ID, so
the agent can pipe straight into `add_instrument`.

## Change a track's sound without re-rolling MIDI: `dsl_shuffle_preset`

`dsl_shuffle_preset` swaps the Surge XT preset on a synth track without
touching its MIDI clip. It's the CLI/agent counterpart of the 🎲 button
on the track row in the UI.

```bash
# Pick a fresh preset for the snare — MIDI stays, only the timbre changes
sas dsl_shuffle_preset --track Snare

# Or by engine track id (from `sas dsl_list_tracks`)
sas dsl_shuffle_preset --track engine-track-1067
```

When to reach for it (vs. neighbouring tools):

| User intent | Tool |
|---|---|
| "Change the sound of the snare" / "give me a different bass preset" | `dsl_shuffle_preset` |
| "Change the snare pattern" / "regenerate the kick" | `dsl_generate_midi` |
| "Add reverb to the lead" / "compress the drums" | `dsl_set_track_fx` |

The category is auto-derived from the track's role + MIDI note range
(via the same `buildPresetCategory` helper the UI uses), so a bass track
gets a bass preset, a low-range bass gets a `basses-low` preset, etc.
Failure envelopes follow the standard remediation taxonomy —
`no_project_bound`, `track_not_found`, `clarification_needed` (when the
selector matches multiple tracks), `unsupported_value` (track has no
role, or no presets installed for the category), `engine_unreachable`
(Surge XT couldn't be loaded or applied).

## Plan-as-artifact surface

Granular tools (`scene_create`, `dsl_track_create`, …) remain available
and stable, but the **recommended path for agents** is the six-verb
plan-as-artifact loop:

```
inspect → plan → validate → apply → preview → undo
```

Each verb is its own subcommand; together they let an agent reason about
the project, propose a typed change, check it against current state,
mutate the world reversibly, hear the result, and roll back without
losing data.

### `sas inspect …` — read-only views

```bash
sas inspect project                     # everything: scenes, tracks, context, history
sas inspect project --include scenes,tracks
sas inspect scene                       # active scene
sas inspect scene <sceneId>             # specific scene
sas inspect track <trackId>             # one track's surface state
sas inspect history --limit 10          # recent checkpoints
```

`inspect` never mutates. The output is structured JSON in `--json` mode;
human mode prints compact summaries. Names are resolved from UUIDs so
agents can chain conversationally without a second lookup.

### `sas plan <intent…>` — emit a typed JSON Plan

```bash
# Free-text intent → typed plan, printed to stdout
sas plan "make me a chill lo-fi beat"

# Save the plan for later
sas plan "make me a chill lo-fi beat" --plan-out beat.plan.json

# Force a specific PlanType (when goal-router would guess wrong)
sas plan "add a sub bass" --type track_revise

# Legacy Phase 4 prereq-chain preview (no typed plan, just the chain)
sas plan "play the scene" --chain-only
```

The plan is the **contract**: a JSON document the agent can read, edit,
explain to the user, and hand to `validate` / `apply`. Plan shape lives
at `src/shared/types/agent-plan.ts` and is versioned via
`metadata.plan_schema_version` (currently `1`).

Top-level shape:

```jsonc
{
  "id": "plan-scene_create-1714850000-abc123",
  "intent": "make me a chill lo-fi beat",
  "type": "scene_create",
  "preconditions": { "project_bound": true },
  "steps": [
    { "id": "plan-…0.scene_create",     "type": "scene_create",     "inputs": { "name": "lo-fi" } },
    { "id": "plan-…1.dsl_track_create", "type": "dsl_track_create", "inputs": { "name": "Bass", "role": "bass" } }
  ],
  "rollback": { "strategy": "checkpoint_undo" },
  "metadata": {
    "created_at": "2026-05-04T15:00:00.000Z",
    "created_by": "cli",
    "plan_schema_version": 1
  }
}
```

PlanTypes recognized today: `scene_create`, `scene_revise`,
`track_revise`, `transition_create`, `mix_balance`, `render_preview`,
`composite`.

### `sas validate <plan-file|->` — check before apply

```bash
sas validate beat.plan.json
sas plan "make a beat" --plan-out /tmp/p.json && sas validate /tmp/p.json

# Pipe directly — validate reads stdin when the file arg is "-"
sas plan "make a beat" --json | jq '.data.changes.plan' | sas validate -
```

Returns a `PlanValidationResult`:

```jsonc
{
  "valid": false,
  "errors": [
    {
      "path": "$.preconditions.project_bound",
      "code": "missing_precondition",
      "message": "No project is bound — open or create one first.",
      "suggestedFix": { "tool": "list_projects", "args": {} }
    }
  ],
  "warnings": [],
  "preview": {
    "wouldCreate": { "scenes": 1, "tracks": 4 },
    "riskLevel": "medium",
    "requiresConfirmation": false
  }
}
```

Exit codes:

- `0` — valid, no errors
- `1` — invalid (one or more errors); script can branch on this
- `2` — bad input (file not found, malformed JSON)

`suggestedFix` is the agent's recovery hook: it points at the exact
tool + args that would unblock the failed precondition, so the agent
can self-correct without re-prompting the user.

### `sas apply <plan-file|->` — execute reversibly

```bash
# Auto-checkpoint pre-apply (default). Restorable via `sas history undo`.
sas apply beat.plan.json

# Override the checkpoint name
sas apply beat.plan.json --checkpoint pre-techno

# Validate-only mode; print the preview block, don't mutate
sas apply beat.plan.json --dry-run

# Skip the checkpoint entirely (caller handles undo themselves)
sas apply beat.plan.json --skip-checkpoint

# Pipe from `plan` directly
sas plan "make me a beat" --json | jq '.data.changes.plan' | sas apply -
```

Default behavior:

1. Validate the plan. If invalid, exit `1` with the error list.
2. **Auto-create a checkpoint** named `pre-apply-<plan.id>-<ts>` capturing
   DB rows + engine surface state (mute/solo/volume/pan/plugin state).
3. Execute steps sequentially. Each step's `outputs` resolve `${steps.<id>.outputs.<key>}`
   references in later step `inputs`.
4. On any step failure, fire `compensate` hooks LIFO and return
   `failed_step_id` + `rolled_back_to`. The checkpoint is preserved so
   the user can recover with `sas history undo`.

Idempotent: re-running an interrupted plan replays from the last
non-completed step. Step ids are deterministic (`${plan.id}.${idx}.${type}`).

### `sas preview [sceneId]` — render audio

```bash
sas preview                              # active scene
sas preview <sceneId>
sas preview --track-id <trackId>         # bounce just this track
sas preview <sceneId> --refresh          # force re-render (skip cache)
sas preview <sceneId> --bpm 120 --bars 8 # render-time overrides
```

Returns:

```jsonc
{
  "audio": {
    "url": "file:///…/render-cache/<hash>.wav",
    "durationSeconds": 7.74,
    "sampleRate": 48000,
    "contentHash": "sha256:…",
    "summary": "4 tracks · 4 bars @ 90 BPM",
    "cacheHit": true,
    "staleness": "fresh"
  }
}
```

Backed by the content-addressable render cache. `staleness` values:

| Value | Meaning |
|---|---|
| `fresh` | Render cache hit; the WAV reflects current state |
| `stale_render` | Cache exists but content hash drifted; pass `--refresh` to rebuild |
| `no_render` | First render request — `--refresh` not needed; we'll build it |
| `rendered_now` | We just rendered for this call |

Per-track preview uses the C++ `trackIds` filter in `SceneRenderer.cpp`
to bounce one track in isolation — handy for A/B-ing a `track_revise`
plan before applying it.

### `sas history …` — checkpoints + undo

```bash
sas history list --limit 10                       # newest first
sas history checkpoint pre-experiment             # manual save point
sas history checkpoint pre-experiment --notes "before mix tweaks"
sas history undo pre-experiment                   # restore
sas history delete pre-experiment                 # drop one
sas history prune                                 # drop expired (default TTL 24h)
```

`undo` runs in a single SQLite transaction + sequence of engine RPCs.
Render cache entries are content-addressable and survive undo
independently — restoring scene state hits the cache immediately when
you `sas preview` after the undo.

Audio bounces are **not** included in checkpoints. To preserve a render
explicitly, run `sas preview` (or `render_to_performance`) before the
checkpoint — it lands in the cache and stays there.

### Universal flags for plan/apply/preview

Following [clig.dev][clig], every plan-shaped command accepts:

| Flag | All commands | Mutating | Apply-only |
|------|-------------|----------|-----------|
| `--json` | yes | yes | yes |
| `--no-color` | yes | yes | yes |
| `--verbose` | yes | yes | yes |
| `--dry-run` | — | yes | yes |
| `--plan-out <file>` | — | yes (`plan`) | — |
| `--checkpoint <name>` | — | — | yes |
| `--skip-checkpoint` | — | — | yes |

[template]: https://github.com/shiehn/sas-platform/blob/main/sas-assistant/docs-ai-planning/ai-orchestration-design.md#236-tool-description-template
[design]: https://github.com/shiehn/sas-platform/blob/main/sas-assistant/docs-ai-planning/ai-orchestration-design.md
[clig]: https://clig.dev/
