---
sidebar: auto
title: sas CLI reference
---

# `sas` CLI reference

The `sas` command is a thin wrapper around the local S&S HTTP API. It
auto-discovers tools from `/api/v1/actions`, so every tool registered in
the app is available as a CLI subcommand *with zero CLI rebuild*.

## Install

**macOS**: the installer runs automatically on first launch:

1. Launch Signals & Sorcery.
2. On the final wizard screen ("You're all set!") leave
   **"Add `sas` command to your terminal"** checked.
3. Approve the admin prompt. The app writes a small wrapper to
   `/usr/local/bin/sas` that runs the CLI through the app's own
   bundled runtime, so you don't need Node.js installed.
4. Open a **new** terminal window (your existing shells don't
   inherit PATH changes).

Want to install later, reinstall after moving the app, or remove it?
**Settings → Developer Tools → sas CLI** has Install / Reinstall /
Uninstall buttons that read the current status and kick off the same
one-prompt flow.

### If you decline the admin prompt

We don't leave you empty-handed. If you click **Cancel** on the admin
dialog, the app offers to install for just your account, no admin
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
from **Settings → Developer Tools → sas CLI**: click **Uninstall**
(removes the user-local copy without a prompt), then **Install**.

### If `sas` is not found after install

The install writes to two places: `/usr/local/bin/sas` (the wrapper)
and `/etc/paths.d/signals-and-sorcery` (for shells that don't have
`/usr/local/bin` on PATH by default, like fish). A few scenarios can
still leave `sas` out of reach:

| Symptom | Fix |
|---|---|
| `zsh: command not found: sas` in a terminal you had open during install | Open a *new* terminal. The old shell still has the pre-install PATH |
| *New* terminal also says `command not found` | Open **Settings → Developer Tools → sas CLI** and click **Reinstall**. The status line will read `stale` or `not-installed` and the fix is one click. |
| Preferences shows `Status: stale — the app moved since install` | Click **Reinstall**. The wrapper hard-codes the app path at install time; moving the app bundle invalidates the wrapper. |
| Preferences shows `Status: managed by Homebrew` (or Nix, or another app) | Remove the foreign `/usr/local/bin/sas` first (`brew uninstall …`), then click Install. The app refuses to clobber binaries it didn't write. |
| You use a non-default shell with a custom PATH that drops `/usr/local/bin` | Run `export PATH=/usr/local/bin:$PATH` to verify the wrapper works, then add that line to your shell rc. |

**Can't make the CLI work?** You don't need it. The CLI is a thin
wrapper around the local HTTP API. `curl` against
`http://localhost:7655/api/v1/execute` gives you every action the
CLI has. See the [automation overview](./README.md#quick-start) for
worked examples.

**Windows / Linux**: the auto-installer is macOS-only today (the
admin-elevation mechanism differs per platform). Use the HTTP or
MCP paths instead; they work uniformly.

## Verify

```bash
# Reachability: is the API server responding?
sas health
# { "status": "ok", "timestamp": "2026-04-14T..." }
```

`sas health` hits `GET /api/v1/health` and returns immediately. Use it
in CI smoke tests and `set -e` preludes; it exits `3` when the app can't
be reached.

```bash
# Service by service: API, audio engine, database, sign-in, open project
sas status
#   ✓ api
#   ✓ engine       connected=true
#   ✓ database
#   ✓ auth         signedIn=true
#   ✓ project      name=My Song, id=…
```

`sas status` hits `GET /api/v1/status`. Each service gets a ✓ or ✗ and a
short detail; being signed out is normal (everything works locally). It
exits `0` whenever the app answers (read the marks, or `--json`, for each
service), `3` if the app isn't running:

```bash
sas status --json | jq '.data.engine.connected'
```

If either command fails with *"Connection refused: is the Signals & Sorcery app
running?"*, launch the app and retry. The CLI is a thin HTTP client; it
needs the in-app API server on `http://localhost:7655`.

## Usage shape

```
sas <action> [--key value]...        Run a tool action by name
sas run <action> [key=value]... [-p key=value] [--json-body '{…}']
sas list-actions [--core-only]       List every registered tool (--core-only: the always-visible set)
sas help <action>                    Per-action help (sas --help for the top level)
sas health                           Reachability check (GET /health)
sas status                           Service by service: API, engine, database, auth, project
sas events stream [--filter <e>]     SSE stream of typed domain + job events
sas refresh                          Re-fetch the /actions manifest cache

# Async job management (every state-mutating tool returns a jobId)
sas job list [--status <s>]          List jobs (filter: queued|running|completed|failed|cancelled)
sas job status <id>                  One job's state
sas job wait <id> [--timeout <sec>]  Long-poll until a job completes (default 300s)
sas job cancel <id>                  Cancel a running job

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

> **Async jobs are the default.** Every state-mutating tool now wraps
> its workflow in an async job. Calls return a `jobId` immediately; you
> (or your agent) call `sas job wait <jobId>` before invoking anything
> that depends on the result. See
> [Status & async jobs](./status-and-jobs.md) for the full contract,
> including HTTP endpoints, SSE events, and the `wait_for_job` MCP tool.

## Global flags

Accepted anywhere after the command name, e.g. `sas arrangement get --json`.
Put them **after** a tool name you call directly (`sas compose_scene … --json`,
not `sas --json compose_scene …`); in front of it they stop the tool name from
being recognised.

| Flag | Effect |
|---|---|
| `--json` | Emit raw JSON envelopes (default is a human-friendly summary). This is an output switch; it does not take tool inputs (see [Passing JSON](#passing-json-arrays-and-objects)) |
| `--host <host>` | Override API server host (default `localhost`) |
| `--port <port>` | Override API server port (default `7655`) |
| `--token <token>` | Bearer token (also read from `~/.sas/token`) |
| `--verbose` | Accepted; currently adds no extra output |
| `--no-color` | Disable ANSI colour (also honours `NO_COLOR=1`) |
| `-h`, `--help` | Top-level help, or per-command help if passed after a command |

`--host`, `--port` and `--token` apply to tool calls and most commands; the
`sas job` and `sas status` commands currently always use the defaults.

Environment variables: `SAS_TIMEOUT_MS` overrides the default 300 s HTTP
timeout (composite tools like `make_beat` routinely run 30–120 s, so the
default is intentionally generous). `NO_COLOR=1` disables colour output.
`SAS_AUTO_REFRESH=1` refreshes the cached tool list automatically when the
app's tools change (otherwise the CLI prints a one-line hint to run
`sas refresh`).
Config persists in `~/.sas/config.json`; the bearer token in
`~/.sas/token` (mode `600`).

## Argument conventions

There are two ways to call a tool, and they parse flags slightly
differently:

- **By tool name** (`sas compose_scene --scene-name Verse …`, the same as
  `sas run compose_scene scene-name=Verse …`): every `--flag value` becomes
  a `flag=value` input.
- **By group and verb** (`sas scene compose --scene-name Verse …`,
  `sas arrangement insert …`): commands generated from the app's tool list
  (run `sas refresh` after updating the app). Each input is a declared
  flag, and `sas <group> <verb> --help` lists them.

Conventions:

- **Kebab-case flags → camelCase inputs:** `--scene-id abc` becomes
  `sceneId: "abc"` in both forms.
- **Booleans:** `--enabled` means true. For false, use `--enabled false`,
  or `--no-enabled` in the group-and-verb form (`--enabled=false` by tool
  name).
- **Numbers:** `--bpm 90` is coerced from the tool's input schema.
- **Arrays and objects:** pass JSON as the value:
  `--paths '["a.wav","b.wav"]'`, `--tracks '[{"name":"Bass","role":"bass"}]'`.
  In the group-and-verb form a list of plain values can also be a comma
  list: `--tracks kick,bass`. Repeating a flag does not build an array (the
  last value wins).
- **The whole input as JSON:** `sas run <tool> --json-body '{"key":"value"}'`.

## Exit codes

| Code | Meaning |
|---|---|
| `0` | Success (including a job that ended `cancelled`) |
| `1` | Plan validation failed (`sas validate`), or a CLI usage error (unknown option, missing argument, unknown action) |
| `2` | Tool failure, or a bad input caught before sending |
| `3` | Connection refused (the app isn't running on `http://localhost:7655`) |
| `4` | Timeout; also any `sas job wait` that could not wait (unknown job, app unreachable) |
| `5` | Job terminated with `status: 'failed'` (`sas job wait` only) |

This means `set -e` works in shell scripts: a failing tool stops the
script unless you explicitly handle it. For async-aware scripting:

```bash
sas job wait "$JOB" --timeout 120
case $? in
  0) echo "Job completed" ;;
  4) echo "Timed out; keep waiting?" ;;
  5) echo "Job failed: sas job status $JOB for details" ;;
esac
```

## Tool discovery

```bash
# Every action
sas list-actions

# One action's full help (parameters + when-to-use)
sas help compose_scene
sas help fx_add_plugin
```

Help output follows the [4-section template][template] every tool is
enforced to have:

- **WHEN TO USE**: scenarios that fit this tool
- **WHEN NOT TO USE**: when another tool fits better (named)
- **INPUTS**: parameter list with example values
- **OUTPUTS**: success / failure envelope shape and emitted events

## Progressive disclosure

About 100 tools are always visible (the curated core: create, mix,
transport, scene navigation, the plan-loop verbs); about 70 of those are
scene-scoped. Less-common tools (samples, export, arrangement, advanced
scene plumbing, etc.) are *deferred*: they don't show in an agent's
default tool list, and agents discover them via `tool_search`.
`sas list-actions` shows every tool, deferred ones included; add
`--core-only` for just the always-visible set.

```bash
# Agent: I need something to export audio. Let me search.
sas tool_search --query "export wav" --limit 3
# Returns matches ranked by name + description relevance, with schemas
# so the agent can invoke directly.
```

The same default-curated set is what the in-app chat-plugin agent sees:
`/api/v1/actions` (used by the `sas` CLI) and `host.listAppTools` (used by
the chat-plugin) share a single filter implementation. Adding a tool to
the registry exposes it on both surfaces atomically; promoting a deferred
tool reaches both at once.

### Filter parameters

| Query | Effect |
|---|---|
| *(none)* | Curated default: non-deferred tools across all scopes |
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
`deck:state-changed`, `sample:imported`, `arrangement:edited`,
`arrangement:transport`, and more.

## Async jobs (every state-mutating tool returns a `jobId`)

> **Breaking change (May 2026).** The CLI's job subcommand is now
> `sas job` (singular). The old plural `sas jobs …` form was retired
> alongside the universal async-job rollout. Update scripts accordingly.

Every state-mutating tool (`compose_scene`, `make_beat`, `dsl_generate_midi`,
`render_to_performance`, `export_audio`, `sas_split_stems`, …) now wraps
its workflow in an async job and **returns a `jobId` immediately**. The
work continues in the background.

```bash
# 1. Kick off the job. The call returns in < 1 s.
JOB=$(sas compose_scene --description "chill lo-fi" --scene-name "Verse" \
  --tracks '[{"name":"Bass","role":"bass","prompt":"deep slow"}]' --json \
  | jq -r '.data.changes.jobId')

# 2. Block until the workflow reaches terminal state.
sas job wait "$JOB" --timeout 180

# 3. Or peek without blocking.
sas job status "$JOB"

# 4. Or list everything currently running.
sas job list --status running
```

**The agent recovery rule:** if any tool response includes
`changes.jobId`, call `sas job wait <id>` (CLI) or `wait_for_job` (MCP /
HTTP) before invoking any tool that depends on the result. The async
tool's response already includes a `nextSteps` array whose first entry is
the wait call pre-substituted with the job id, so agents that follow
`nextSteps` are async-correct by construction.

`sas job` is the wrapper around four HTTP endpoints:

| Verb | HTTP | Behaviour |
|---|---|---|
| `sas job list [--status …]` | `GET /api/v1/jobs[?status=…]` | Newest-first array |
| `sas job status <id>` | `GET /api/v1/jobs/:id` | One job; `404` if unknown |
| `sas job wait <id> [--timeout N]` | `GET /api/v1/jobs/:id/wait?timeout=<ms>` | Long-poll; `--timeout` is **seconds** |
| `sas job cancel <id>` | `POST /api/v1/jobs/:id/cancel` | `404` if unknown or already terminal |

See [Status & async jobs](./status-and-jobs.md) for the complete
contract: which tools are wrapped, the SSE event stream (`jobProgress`,
`jobComplete`, `jobFailed`), the `wait_for_job` MCP tool, Python/bash
worked examples, and troubleshooting.

## Idempotency keys

Every command takes `--idempotency-key` (or `-p idempotencyKey=…` with
`sas run`):

```bash
# Same key + same tool + same params = same result (cached 60 s, per project)
sas dsl_track_create --idempotency-key "retry-abc-1" --name "Bass" --role bass
sas dsl_track_create --idempotency-key "retry-abc-1" --name "Bass" --role bass
# ↑ second call returns the first's result, no duplicate track
```

Only successful results are cached, so a retry after a failure runs
again. Safe to retry on transient errors without corrupting state. See
the [orchestration design doc][design] § 8 for the full spec.

## Passing JSON: arrays and objects

For tools with nested inputs (like `compose_scene`, which takes a
`tracks` array), pass the JSON as the flag's value:

```bash
sas compose_scene \
  --description "chill lo-fi" \
  --scene-name "Verse" \
  --tracks '[
    {"name": "Bass",  "role": "bass",  "prompt": "deep, slow lo-fi"},
    {"name": "Kick",  "role": "kicks", "prompt": "laid-back swung"},
    {"name": "Keys",  "role": "keys","prompt": "jazzy extensions"}
  ]'
```

Or send the whole input as one JSON object with `sas run`:

```bash
sas run compose_scene --json-body '{
  "description": "chill lo-fi",
  "sceneName": "Verse",
  "tracks": [{"name": "Bass", "role": "bass", "prompt": "deep, slow lo-fi"}]
}'
```

`--json` on its own only switches the output to JSON; it never carries
tool inputs.

## Scene loop length: `--bar-length`

`compose_scene` and `compose_contract` both accept `--bar-length` (one of
`2`, `4`, `8`, `16`; default `4`). It sets the SCENE's loop length,
distinct from the per-track `bars` field inside the `tracks[]` array
(which controls how many bars of MIDI to generate for each track).

```bash
# Two-bar disco contract, no tracks yet; the agent adds instruments next
sas compose_contract \
  --name "Disco" \
  --description "punchy 2-bar disco" \
  --bar-length 2

# Long 16-bar ambient intro, three tracks generated at once
sas compose_scene \
  --description "ambient 16-bar intro in F minor" \
  --scene-name "Intro" \
  --bar-length 16 \
  --tracks '[
    {"name":"Pad","role":"pads","prompt":"slow swell"},
    {"name":"Bass","role":"bass","prompt":"sub drone"},
    {"name":"Lead","role":"lead","prompt":"sparse melodic line"}
  ]'
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
# Pick a fresh preset for the snare: MIDI stays, only the timbre changes
sas dsl_shuffle_preset --track Snare

# Or by engine track id (from `sas dsl_list_tracks`)
sas dsl_shuffle_preset --track engine-track-1067
```

When to reach for it (vs. neighbouring tools):

| User intent | Tool |
|---|---|
| "Change the sound of the snare" / "give me a different bass preset" | `dsl_shuffle_preset` |
| "Change the snare pattern" / "regenerate the kick" | `dsl_generate_midi` |
| "Add reverb to the lead" / "compress the drums" | `fx_add_plugin` (a 3rd-party insert on the track's rack) |

The category is auto-derived from the track's role + MIDI note range
(via the same `buildPresetCategory` helper the UI uses), so a bass track
gets a bass preset, a low-range bass gets a `basses-low` preset, etc.
Failure envelopes follow the standard remediation taxonomy:
`no_project_bound`, `track_not_found`, `clarification_needed` (when the
selector matches multiple tracks), `unsupported_value` (track has no
role, or no presets installed for the category), `engine_unreachable`
(Surge XT couldn't be loaded or applied).

## Arrange a song: `sas arrangement`

The [Arrange mode](/arrange/) tools are grouped under `sas arrangement`.
The group is generated from the app's tool list, so run `sas refresh` once
after updating the app if `sas arrangement --help` doesn't list it. Flags
are the kebab-case form of each tool's inputs (`--instance`, `--track`,
`--length-bars`, …); boolean flags are true when present (`--linked`,
`--unlink`, `--clear`, `--stems`, `--ableton`, `--leave-arrange-mode`, …).
Every command works on the project's one arrangement.

| Command | Tool | Does |
|---|---|---|
| `sas arrangement status` | `arrangement_status` | Arrange mode, stems, owner, playhead (read-only) |
| `sas arrangement start` | `arrangement_start` | Enter arrange mode, render changed layers, build (**async**: returns a `jobId`) |
| `sas arrangement play [--from-seconds N]` | `arrangement_play` | Play |
| `sas arrangement stop [--return-to-start] [--leave-arrange-mode]` | `arrangement_stop` | Stop |
| `sas arrangement seek --seconds N` | `arrangement_seek` | Move the playhead |
| `sas arrangement loop-get` | `arrangement_get_loop` | The ruler loop (read-only) |
| `sas arrangement loop-set --instance X` / `--whole` / `--start-beat A --end-beat B` / `--no-enabled` | `arrangement_set_loop` | Set or turn off the ruler loop (by default the whole arrangement loops) |
| `sas arrangement loop --instance X` / `--clear` | `arrangement_loop_instance` | Loop one section (replaces the ruler loop while it holds; `--clear` hands back to it) |
| `sas arrangement get` | `arrangement_get` | Sections, layers, clips, effects, scenes (read-only) |
| `sas arrangement insert --scene X [--index N] [--length-bars N]` | `arrangement_insert_instance` | Insert a scene |
| `sas arrangement move --instance X --to-index N` | `arrangement_move_instance` | Move a section |
| `sas arrangement duplicate-section --instance X [--linked]` | `arrangement_duplicate_instance` | Copy or linked copy of a section |
| `sas arrangement remove-section --instance X` | `arrangement_delete_instance` | Remove a section (the song gets shorter) |
| `sas arrangement resize --instance X --length-bars N [--unlink]` | `arrangement_resize_instance` | Resize (whole bars) |
| `sas arrangement fade-section --instance X --edge in\|out --bars N` | `arrangement_fade_section` | Fade a whole section in or out |
| `sas arrangement mute --track Y --muted` (or `--no-muted`) | `arrangement_set_track_mute` | Mute or unmute a track for the whole arrangement |
| `sas arrangement solo --track Y --soloed [--alone]` (or `--no-soloed`) | `arrangement_set_track_solo` | Solo or unsolo a track (`--alone` unsolos the others) |
| `sas arrangement restore-track --track Y` | `arrangement_restore_track` | Put a track back to its default (mute, solo and sections stay) |
| `sas arrangement layer --instance X --track Y …` | `arrangement_set_layer` | One layer in one section |
| `sas arrangement silence --instance X --track Y --from-bar A --to-bar B` | `arrangement_delete_region` | Silence bars (the song keeps its length) |
| `sas arrangement split --track Y --bar N [--instance X]` | `arrangement_split` | Split a clip |
| `sas arrangement join --track Y [--instance X] [--from-bar A --to-bar B]` | `arrangement_join` | Join clips |
| `sas arrangement treatment --instance X --track Y --type T --bar N` | `arrangement_place_treatment` | Place an effect |
| `sas arrangement untreat --instance X --track Y --bar N` | `arrangement_remove_treatment` | Remove an effect |
| `sas arrangement copy --region '{…}'` (or `--run`, `--clip`, `--sections`) | `arrangement_copy` | Copy to the shared clipboard |
| `sas arrangement paste --at '{…}'` (or `--after-section X`) | `arrangement_paste` | Paste |
| `sas arrangement duplicate-selection --sections X` (or `--region`, `--clip`) | `arrangement_duplicate` | Duplicate sections, bars or a clip |
| `sas arrangement normalize-kicks [--apply false] [--exclude A,B] [--max-boost-db N] [--max-cut-db N]` | `arrangement_normalize_kick_levels` | Even out the kick across the scenes, as one undo step (**async**: returns a `jobId`; `--apply false` is a dry run that changes nothing) |
| `sas run arrangement_set_scene_gain -p scene=X -p gainDb=N` | `arrangement_set_scene_gain` | Set one scene's level by hand (−24 to +24 dB) |
| `sas arrangement undo [--from-other-device]` / `redo` | `arrangement_undo` / `arrangement_redo` | The arrangement's own history (this computer's edits; `--from-other-device` reverts the latest changes from another device) |
| `sas arrangement export [--stems] [--ableton] [--preset P] [--name N] [--tail auto\|S] …` | `arrangement_export` | Export (**async**: returns a `jobId`). `--name` names the new folder and its files (default: the project's last export name, else the project's name followed by "Bounce"); `--tail` is `auto` (until silent, up to 10 s) or a fixed number of seconds from 0 to 30. An earlier export's folder is never overwritten |
| `sas arrangement export-cancel` | `arrangement_export_cancel` | Cancel the running export |
| `sas arrangement sync-status` | `arrangement_sync_status` | Cloud sync state, notes, the web link, "for the web" progress (read-only) |
| `sas arrangement sync --now` / `--enabled false` / `--pause-uploads` / `--prepare-all-scenes false` / `--pause-preparation` | `arrangement_sync` | Sync now, turn Auto Sync off or on, pause the background uploads, control the "for the web" preparation |

`--instance` takes a section's label (`"Chorus (2)"`), its scene
(`"the verse"`) or its position (`"the second chorus"`, `"the last verse"`);
`--track` takes a layer's name. `--index` (0-based) and `--instance-id` work
too. Inputs that are objects take JSON, and lists take JSON or a comma list:

```bash
sas arrangement copy --region '{"instance": "the first chorus", "track": "Kick"}'
sas arrangement paste --at '{"instance": "the second chorus", "bar": 1}'
sas arrangement duplicate-selection --sections "Chorus (2)"
sas arrangement export --outputs mix,stems --render-stale false
sas arrangement export --name "Night Drive Bounce" --tail 2
```

The older verbs `duplicate`, `remove`, `clear` and `dup` still work for now
and print their new names.

```bash
# Where are we?
sas arrangement status

# Build it (renders any layer whose sound changed), then play from 0:30
JOB=$(sas arrangement start --json | jq -r '.data.changes.jobId')
sas job wait "$JOB" --timeout 600
sas arrangement play --from-seconds 30   # if still preparing: pending, starts by itself

# Loop just the last chorus (by default the whole song loops); mute a track
sas arrangement loop-set --instance "the last chorus"
sas arrangement mute --track Pad --muted
sas arrangement solo --track Bass --soloed --alone

# Read the timeline
sas arrangement get --json | jq '.data.changes.instances[] | {index, label, lengthBars}'

# Edit
sas arrangement duplicate-section --instance "Chorus" --linked        # a linked chorus
sas arrangement resize --instance "Chorus (2)" --length-bars 16 --unlink
sas arrangement layer --instance "the last chorus" --track Bass --from-bar 5   # enters at bar 5
sas arrangement layer --instance "the last chorus" --track Pad --fade-in-beats 8 --gain-db -3
sas arrangement fade-section --instance "the last chorus" --edge out --bars 4
sas arrangement treatment --instance "the second chorus" --track Bass --type reverse_bar --bar 4
sas arrangement undo

# Export the Mix, a Master and stems (the app asks you to approve it),
# then go back to composing
sas arrangement export --stems
sas arrangement stop --leave-arrange-mode
```

See [Arrangement tools](./for-agents.md#arrangement-tools) for how the tools
behave and the worked examples
[15 to 18](./examples.md#_15-arrange-a-song-from-your-scenes).

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

### `sas inspect …`: read-only views

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

### `sas plan <intent…>`: emit a typed JSON Plan

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

### `sas validate <plan-file|->`: check before apply

```bash
sas validate beat.plan.json
sas plan "make a beat" --plan-out /tmp/p.json && sas validate /tmp/p.json

# Pipe directly: validate reads stdin when the file arg is "-"
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

- `0`: valid, no errors
- `1`: invalid (one or more errors); script can branch on this
- `2`: bad input (file not found, malformed JSON)

`suggestedFix` is the agent's recovery hook: it points at the exact
tool + args that would unblock the failed precondition, so the agent
can self-correct without re-prompting the user.

### `sas apply <plan-file|->`: execute reversibly

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
2. **Auto-create a checkpoint** named `pre-apply-<plan.id>` (the plan id
   carries its own timestamp) capturing
   DB rows + engine surface state (mute/solo/volume/pan/plugin state).
3. Execute steps sequentially. Each step's `outputs` resolve `${steps.<id>.outputs.<key>}`
   references in later step `inputs`.
4. On any step failure, fire `compensate` hooks LIFO and return
   `failed_step_id` + `rolled_back_to`. The checkpoint is preserved so
   the user can recover with `sas history undo`.

Idempotent: re-running an interrupted plan replays from the last
non-completed step. Step ids are deterministic (`${plan.id}.${idx}.${type}`).

### `sas preview [sceneId]`: render audio

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
| `no_render` | First render request: `--refresh` not needed, we'll build it |
| `rendered_now` | We just rendered for this call |

Per-track preview uses the C++ `trackIds` filter in `SceneRenderer.cpp`
to bounce one track in isolation, handy for A/B-ing a `track_revise`
plan before applying it.

### `sas history …`: checkpoints + undo

```bash
sas history list --limit 10                       # newest first
sas history checkpoint pre-experiment             # manual save point
sas history checkpoint pre-experiment --notes "before mix tweaks"
sas history undo pre-experiment                   # restore
sas history delete pre-experiment                 # drop one
sas history prune                                 # drop expired (CLI checkpoints last 24 h)
```

`undo` runs in a single SQLite transaction + sequence of engine RPCs.
Render cache entries are content-addressable and survive undo
independently; restoring scene state hits the cache immediately when
you `sas preview` after the undo.

Audio bounces are **not** included in checkpoints. To preserve a render
explicitly, run `sas preview` (or `render_to_performance`) before the
checkpoint; it lands in the cache and stays there.

### Universal flags for plan/apply/preview

Following [clig.dev][clig], every plan-shaped command accepts:

| Flag | All commands | Mutating | Apply-only |
|------|-------------|----------|-----------|
| `--json` | yes | yes | yes |
| `--no-color` | yes | yes | yes |
| `--verbose` | yes | yes | yes |
| `--dry-run` | no | yes | yes |
| `--plan-out <file>` | no | yes (`plan`) | no |
| `--checkpoint <name>` | no | no | yes |
| `--skip-checkpoint` | no | no | yes |

[template]: https://github.com/shiehn/sas-platform/blob/main/sas-app/docs-ai-planning/ai-orchestration-design.md#236-tool-description-template
[design]: https://github.com/shiehn/sas-platform/blob/main/sas-app/docs-ai-planning/ai-orchestration-design.md
[clig]: https://clig.dev/
