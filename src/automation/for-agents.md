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
catalog further down) still work, but the loop is the
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

Exit codes: 0 success; 1 plan-validation failure or a CLI usage error;
2 tool failure; 3 connection refused (app not running); 4 `sas job wait`
did not finish (timeout); 5 job ended in failed state.
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
    --tracks '[
      {"name":"Bass","role":"bass","prompt":"deep lo-fi"},
      {"name":"Kick","role":"kicks","prompt":"laid-back swung"},
      {"name":"Keys","role":"keys","prompt":"jazzy Rhodes"}
    ]'
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

The MCP server exposes **9 tools**: the six plan-loop primitives, a job
waiter, and two meta-tools for progressive disclosure. All nine funnel
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
| `sas_wait_for_job` | Block until an async job finishes (`jobId`, optional `timeoutMs`) | No (long-poll) |
| `tool_search` | Find a tool by keyword in the granular catalog | No |
| `sas_run` | Invoke any registered action by name (post-discovery) | Depends on action |

The flow for an MCP-only agent:

1. `sas_inspect` to read state.
2. `sas_create_plan` → `sas_validate_plan` → `sas_apply_plan`.
3. Because `sas_apply_plan` is async-wrapped, it returns
   `changes.jobId`. Call `sas_wait_for_job` with that `jobId` to block
   until the work is done.
4. `sas_render_preview` to hear the result.
5. `sas_undo_checkpoint` if the result missed.

Granular tools (`scene_create`, `dsl_track_create`, `make_beat`, etc.)
are discoverable via `tool_search` and invokable via `sas_run`. Each
async wrapped tool returns the same `{ jobId, status, operation }`
envelope; the agent always reaches for `sas_wait_for_job` afterwards. See
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
- `render_to_performance` to render a scene offline and play the baked loop (it stops the live scene; there is one shared output)
- `create_transition_scene` for a bridge scene between two scenes (it
  starts empty: add parts with `add_instrument`)

### Scene loop length: pass `barLength` (2, 4, 8, or 16)

`compose_scene` and `compose_contract` both accept a `barLength` input,
the SCENE's loop length in bars. Must be one of `{2, 4, 8, 16}`, default
`4`. Pass it when the user specifies a scene length:

```bash
# "A 2-bar disco beat": pass barLength=2 so the scene loops every 2 bars
sas compose_contract --name "Disco" --description "2-bar disco beat" --bar-length 2

# "A long 16-bar intro": pass barLength=16
sas compose_scene --description "ambient 16-bar intro" --scene-name "Intro" --bar-length 16 \
  --tracks '[{"name":"Pad","role":"pads","prompt":"slow swell"}]'
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
            {"name": "Kick",  "role": "kicks", "prompt": "laid-back"},
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

`/api/v1/actions` and the in-app chat-plugin agent read from the same
registry with the same default filter (`sas list-actions` shows deferred
tools too; `--core-only` gives the default set); Errantry's CLI tests
therefore exercise the chat-plugin's surface too. **Whatever's reachable
via `sas` is reachable from the chat agent**, and vice versa.

## Tool surface summary

The default set (`/api/v1/actions` with no filter) covers the natural
verbs an agent reaches for during music production; `?scope=scene`
narrows it to the scene-scoped tools the in-app chat assistant starts
with. Tools marked **deferred** require `tool_search` to discover.

| Category | Tools (default surface unless noted) |
|---|---|
| **MCP primitives** (always visible to MCP clients) | `sas_inspect`, `sas_create_plan`, `sas_validate_plan`, `sas_apply_plan`, `sas_render_preview`, `sas_undo_checkpoint`, `sas_wait_for_job`, `tool_search`, `sas_run`. See [MCP-capable agents](#mcp-capable-agents) for routing details |
| **Plan loop** (CLI surface) | `sas inspect project\|scene\|track\|history`, `sas plan`, `sas validate`, `sas apply` (async), `sas preview`, `sas history list\|checkpoint\|undo\|delete\|prune` |
| **Async job control** | `sas job list\|status\|wait\|cancel` (CLI) · `wait_for_job` (via `sas_run` for MCP). See [Status & async jobs](./status-and-jobs.md) |
| **Project** | `project_get_status`, `list_projects` |
| **Scene navigation** | `scene_get_all`, `scene_activate`, `scene_duplicate`, `scene_delete`, `create_transition_scene` (deferred: `scene_find_by_name`) |
| **Scene plumbing** *(deferred)* | `scene_create`, `scene_get_tracks`, `scene_set_mute`, `scene_add_track`, `scene_move_track`, `scene_queue`, `scene_set_collapsed` |
| **Tracks** | `dsl_track_create`, `dsl_list_tracks`, `dsl_track_delete`, `dsl_track_mute`, `dsl_track_solo`, `dsl_track_volume`, `dsl_track_pan`, `dsl_track_rename` |
| **Transport** | `dsl_play`, `dsl_stop`, `dsl_set_tempo` (deferred: `dsl_get_tempo_info`) |
| **MIDI generation** | `dsl_generate_midi` (deferred: `dsl_generate_drums`) |
| **FX** (3rd-party VST3/AU inserts) | `dsl_fx_remove`, `dsl_fx_set_bypass`, `dsl_fx_set_param`, `dsl_sweep` (deferred: `fx_list_plugins`, `fx_add_plugin`, `fx_remove_plugin`, `fx_move_plugin`, `fx_set_bypass`, `fx_set_param`, `dsl_load_fx_chain`, `rack_apply_random_fx`) |
| **Musical context** *(deferred)* | `get_musical_context`, `set_musical_context` |
| **Samples** *(deferred)* | `search_samples`, `import_samples`, `add_sample_track` |
| **Export** *(deferred)* | `export_audio` (a whole scene), `export_track_audio` (exactly one track, rendered from its own scene at that scene's length and time signature, with its fader, pan and effects; the app asks for approval first, as it does for `export_audio`) |
| **Composites** | `compose_scene`, `compose_contract`, `add_instrument`, `generate_track`, `play_scene`, `render_to_performance` |
| **Preset shuffle** | `dsl_shuffle_preset`: re-roll the Surge XT preset on a track without touching MIDI (agent parity with the UI 🎲 button) |
| **Capability tools** (consent-gated) | `fs_list_directory`, `fs_read_file`, `fs_search`, `fs_write_file`, `shell_exec`. See [Capability tools](./capability-tools.md). Every call pops a per-action consent dialog on the user's machine. |
| **Discovery** | `tool_search` (always visible; finds any registered tool, deferred or not) |
| **Arrangement** *(deferred)* | The `arrangement_*` tools that build, edit, play, export and sync a song from the project's scenes. See [Arrangement tools](#arrangement-tools) |

## Arrangement tools

[Arrange mode](/arrange/) is fully scriptable. The `arrangement_*` tools cover
what the arranger does: build and play the song, loop part of it,
place and copy sections, mute and solo tracks, switch layers on and off, copy
and paste bars, split clips, fade, add effects, even out the kick across scenes,
undo, and export. They are deferred, so find them with
`tool_search` (query `arrangement`), or call them by name. In the CLI they
are the [`sas arrangement` group](./cli-reference.md#arrange-a-song-sas-arrangement).
The in-app chat assistant uses the same tools.

How they behave:

- **One arrangement per project.** Every tool acts on the project's
  arrangement; there is no id to pass. `arrangement_start` creates it the
  first time (every scene once, in scene order, all layers on).
- **Direct, not the plan loop.** Arrangement edits don't create
  checkpoints. Each edit is one labelled step in the arrangement's own undo
  history, the same history the editor in the app uses, so
  `arrangement_undo` undoes a drag in the timeline and ⌘Z undoes an agent's
  edit.
- **Names work.** Name a section with `instance`: its label (`"Chorus"`,
  `"Chorus (2)"`), its scene (`"the verse"`) or its position
  (`"the second chorus"`, `"the last verse"`). `instanceId` or `index`
  (0-based) work too. Name a scene with `scene` and a layer with `track`
  (add `scene` to pick a layer from one scene). An ambiguous name returns a
  clarification listing the choices; a name that doesn't exist returns
  what does.
- **Read first.** `arrangement_get` returns the timeline: `instances[]`
  (`index`, `instanceId`, `label`, `sceneName`, `lengthBars`, `meter`,
  `startBar`, `startQn`, `linkedWith`), `variants[]` with each layer's state
  (`name`, `home`, `play` as `on`, `off` or a bar mask like `00001111`, fades
  and their curves, gain, `gainEnvelope`, `splits`, `treatments`),
  `scenes[]`, the arranger's track mute and solo states (`rowStates[]`), and
  every track you don't hear (`silentRows[]`), each with its `reasons`:
  `row-muted` or `other-row-soloed` (the arranger's own M and S, the only
  things that silence a track here).
- **Linked copies share one arrangement.** Edits to a linked section change
  every linked copy, and the result lists them in `alsoAffects`. Use an
  independent copy, or `unlink: true` on resize, when only one should
  change.
- **Tracks never leave their lane.** Any layer can play in any section (a
  "guest" from another scene keeps its own fader, pan and its own scene's
  panel bus), but always on its own lane. Pasted bars land on the lanes they
  came from.
- **Results.** Every edit returns `timeline` (compact lines like
  `#0 Verse (8 bars)`), `canUndo` / `canRedo`, and `dropped` or `notes` for
  anything that could not apply as asked. A change that changes nothing
  returns `no_change` (mute, solo and restore instead succeed with
  `unchanged: true`). Edits emit `arrangement:edited`; transport calls emit
  `arrangement:transport`.
- **Playback.** `arrangement_start` is an async job (wait on its `jobId`):
  it enters arrange mode and renders any layer whose sound changed. The
  first start renders every layer and can take minutes. Then
  `arrangement_play`. If the arrangement is still preparing its audio, Play
  returns `changes.pending: true` and playback **starts by itself** when it
  is ready: don't call Play again (`arrangement_status` reports
  `playPending`; `arrangement_stop` cancels the wait). By default the whole
  arrangement **loops**; `arrangement_set_loop` changes that. The
  composition and the arrangement never play at the same time: starting one
  stops the other. If a deck Play started after this Play was asked for, the
  deck keeps the output and Play fails with `PLAY_SUPERSEDED`; while tracks are
  being frozen it fails with `FREEZE_IN_PROGRESS` (see
  [When a tool fails](#when-a-tool-fails)).
- **Mute and solo are per view.** In the arrangement, only the arranger's
  own M and S (per track, for the whole arrangement) decide what plays and
  what exports; the composer's mutes, solos and bus mutes affect only the
  composer. Levels, pan and effects are shared. Arranger mute and solo are
  saved with the arrangement and undoable.

### Build and play

| Tool | CLI | What it does | Inputs |
|---|---|---|---|
| `arrangement_start` | `sas arrangement start` | Enter arrange mode, create the arrangement if needed, render changed layers, build it. **Async** | `dependsOn` |
| `arrangement_play` | `sas arrangement play` | Play from the playhead; while the arrangement is still preparing, returns `pending: true` and starts by itself | `fromSeconds` |
| `arrangement_stop` | `sas arrangement stop` | Stop (tails ring out). `leaveArrangeMode` hands playback back to the composition | `returnToStart`, `leaveArrangeMode` |
| `arrangement_status` | `sas arrangement status` | Read-only: arrange mode, the arrangement, stem freshness, who owns the output, whether a Play is queued (`playPending`), the playhead (seconds, bar, beat, section) | none |
| `arrangement_seek` | `sas arrangement seek` | Move the playhead | `seconds` |
| `arrangement_get_loop` | `sas arrangement loop-get` | Read-only: the ruler loop (its range in beats, on or off, whether it covers the whole arrangement), or the section loop holding playback | none |
| `arrangement_set_loop` | `sas arrangement loop-set` | Set the ruler loop: a beat range, a section, or the whole arrangement; turn it on or off. Saved per arrangement on this computer (not part of undo) | `startBeat` + `endBeat`, or `instance`, or `whole`; `enabled` |
| `arrangement_loop_instance` | `sas arrangement loop` | Loop one section (it replaces the ruler loop while it holds), or `clear` to hand back to the ruler loop | `instance`, `clear` |
| `arrangement_get` | `sas arrangement get` | Read-only: sections, layers, clips, effects, scenes | none |

### Sections

| Tool | CLI | What it does | Inputs |
|---|---|---|---|
| `arrangement_insert_instance` | `sas arrangement insert` | Insert a scene (a fresh drop plays every layer), or a linked copy of a variant | `scene` (or `variantId`), `index`, `lengthBars`, `label` |
| `arrangement_move_instance` | `sas arrangement move` | Move a section | `instance`, `toIndex` |
| `arrangement_duplicate_instance` | `sas arrangement duplicate-section` | Independent copy, or `linked` | `instance`, `linked`, `toIndex` |
| `arrangement_delete_instance` | `sas arrangement remove-section` | Remove a section; the song gets shorter (the scene is untouched) | `instance` |
| `arrangement_resize_instance` | `sas arrangement resize` | Whole bars; longer loops the scene in phase | `instance`, `lengthBars`, `unlink` |
| `arrangement_fade_section` | `sas arrangement fade-section` | Fade every layer in or out at a section's edge (equal-power); layers that carry on across the edge are skipped | `instance`, `edge` (`in` or `out`), `bars` or `beats` (0 removes) |

### Tracks

| Tool | CLI | What it does | Inputs |
|---|---|---|---|
| `arrangement_set_track_mute` | `sas arrangement mute` | Mute or unmute a track for the whole arrangement (the arranger's **M**) | `track` (+ `scene`) or `trackId`; `muted` |
| `arrangement_set_track_solo` | `sas arrangement solo` | Solo or unsolo a track (the arranger's **S**); `alone` unsolos every other track in the same step. While any track is soloed, only soloed tracks sound, and mute wins | `track` or `trackId`; `soloed`; `alone` |
| `arrangement_restore_track` | `sas arrangement restore-track` | Put a track back to its default everywhere: clears its arranger edits (bars switched off, clips and splits, gain, fades, gain envelope, effects, phase). Mute, solo and sections stay as they are | `track` (+ `scene`) or `trackId` |

### Layers, bars and clips

| Tool | CLI | What it does | Inputs |
|---|---|---|---|
| `arrangement_set_layer` | `sas arrangement layer` | One layer in one section: on or off, enter or leave at a bar, fades and their shape, gain, a gain envelope | `instance`; `track` (+ `scene`); `play` (`on`, `off`, `default`, or a 0/1 bar mask); `fromBar` / `toBar`; `fadeInBeats` / `fadeOutBeats`; `fadeInCurve` / `fadeOutCurve` (`equalPower`, `linear`, `exponential`, `sCurve`, or `default`); `gainDb` (±24); `gainEnvelope` (a list of `{beat, db}` points, see below) |
| `arrangement_copy` | `sas arrangement copy` | Copy to the shared clipboard: a `region` of bars, a layer's whole `run`, one `clip`, or `sections` | one of `region`, `run`, `clip`, `sections` |
| `arrangement_paste` | `sas arrangement paste` | Paste bars onto their own lanes from a bar, or sections after a section; pasted bars **replace** what was there | `at` (`{instance, bar}` or `{bar}`) or `afterSection`; `linked` |
| `arrangement_delete_region` | `sas arrangement silence` | Silence bars (the song does **not** get shorter; to remove a section use `arrangement_delete_instance`) | `instance`, `track` or `tracks`, `fromBar`, `toBar`; or `clip` |
| `arrangement_duplicate` | `sas arrangement duplicate-selection` | Duplicate sections, a region or a clip right after itself (like ⌘D) | one of `sections`, `region`, `clip` |
| `arrangement_split` | `sas arrangement split` | Split a layer's clip at a bar (no change in sound) | `track` or `tracks`, `bar` or `bars`, `instance` |
| `arrangement_join` | `sas arrangement join` | Remove the splits inside a region (section starts always stay clip edges) | `instance`, `track` or `tracks`, `fromBar`, `toBar` |

The clipboard is shared with the editor's ⌘C / ⌘X / ⌘V / ⌘D for the rest of
the app session, one per project; the app shows what an agent copied.

A **gain envelope** is the wave editor's gain line: points in quarter notes
from the section's start, in dB on top of `gainDb` (±24), straight lines in
dB between points, held flat beyond the first and last (at most 256 points;
`[]` clears it). For example
`[{"beat": 0, "db": 0}, {"beat": 16, "db": -12}]` brings a layer down by
12 dB over its first four bars (in 4/4) and holds it there.

### Effects (treatments)

| Tool | CLI | What it does | Inputs |
|---|---|---|---|
| `arrangement_place_treatment` | `sas arrangement treatment` | Place an effect on a layer at a bar; returns `treatmentId`; linked copies get it too | `instance`; `track` or `asset`; `type`; `bar`; `bars`; `params` |
| `arrangement_remove_treatment` | `sas arrangement untreat` | Remove one | `instance`; `track` or `asset`; `treatmentId`, or `bar` (+ `type`) |

Treatment types (the tool description lists every parameter with its range
and default):

- **Replace the layer's audio for those bars:** `fill_roll8` (Roll ⅛),
  `fill_roll16` (Roll 1/16), `fill_accel` (Accelerating roll), `stutter`
  (`repeats`), `reverse_bar` (Reverse), `gap` (`beats` of silent tail),
  `hp_sweep` / `lp_sweep` (filter sweeps: `bars`, `start_hz`, `end_hz`,
  `curve`), `tape_stop` (`beats`), `loop` (Bar loop: `bars`,
  `window_bars`, `src_bar`). Replacing effects on one lane can't overlap.
- **Play on top:** `crash_wash` and `impact_hit` (hit length, echo taps,
  spacing and decay, room size, damping, wet).
- **Mix Assets** (pass `asset`, the Mix Assets layer's name; the type
  follows from it): hits and shots on a bar, risers that land at the end of
  their bar (`hit_beats` or `beats`, `gain_db`).

### Scene levels and kick matching

| Tool | CLI | What it does | Inputs |
|---|---|---|---|
| `arrangement_normalize_kick_levels` | `sas arrangement normalize-kicks` | The arranger's **Normalize kick levels** button: measures each scene's kick from its layer stems and sets one level per scene (a scene gain, on top of faders and lane gains) so every scene with a clear kick hits equally hard; scenes without a clear kick are matched on overall loudness. One undo step; running it again replaces the previous match. **Async** | `apply` (default true; `false` is a dry run that measures and reports but changes nothing), `maxBoostDb` (default 6), `maxCutDb` (default 12, a positive number), `ceilingDbtp` (default −1), `exclude` (scene names or ids to leave exactly as they are) |
| `arrangement_set_scene_gain` | `sas run arrangement_set_scene_gain` | Set one scene's level by hand: every layer of that scene, wherever it plays. One undo step | `scene` (name or id), `gainDb` (−24 to +24 dB in 0.1 dB steps, or `null` to clear it) |

How they behave:

- **Stems first.** The match renders any out-of-date layer stems before it
  measures. Rendering can't happen while something plays, so if a stem needs
  it, the call fails until you stop playback (`dsl_stop` or `arrangement_stop`);
  a render that is already running fails it with a retryable remediation.
- **The ceiling.** No scene's peaks go above `ceilingDbtp` before the master,
  or above the arrangement's loudest current peak if that is higher. No scene is
  raised more than `maxBoostDb` or lowered more than `maxCutDb`.
- **The result** (`changes`): `status` is `applied`, `already-matched` (nothing
  to change), `dry-run`, `no-kick` (no scene has a clear kick, so nothing
  changed) or `empty`; then `summary`, `target_lufs`, `overall_target_lufs`,
  `ceiling_dbtp` and `scenes[]` (`scene`, `scene_id`, `basis` as `kick`,
  `overall` or `excluded`, `kick_tracks`, `kick_lufs`, `overall_lufs`,
  `confidence`, `peak_dbtp`, `headroom_db`, `gain_db`, `flag`). When some
  layers weren't heard, `not_measured[]` names them with a `reason`:
  `not-loaded` (a loop of a scene not opened since the project was opened:
  open that scene, then call again) or `no-stem` (its stem didn't render).
- **A hand-set level** from `arrangement_set_scene_gain` is replaced by a later
  match for any scene the match covers; pass that scene in `exclude` to keep it.
- **Where it applies.** A scene's level reaches everything the arrangement
  plays: playback, exports and the web arranger. A layer playing as a guest in
  another scene's section keeps its own scene's level.
- `arrangement_undo` takes either change back in one step.

```bash
# Dry run: what would change?
JOB=$(sas arrangement normalize-kicks --apply false --json | jq -r '.data.changes.jobId')
sas job wait "$JOB" --timeout 300

# Set the chorus 1.5 dB down by hand, then clear it again
sas run arrangement_set_scene_gain -p scene=Chorus -p gainDb=-1.5
sas run arrangement_set_scene_gain --json-body '{"scene": "Chorus", "gainDb": null}'
```

### Undo and export

| Tool | CLI | What it does | Inputs |
|---|---|---|---|
| `arrangement_undo` | `sas arrangement undo` | Undo the last edit made on this computer (the arrangement's own history; changes synced in from another device are not undo steps, and a field another device changed later is kept, counted in `keptRemote`). `fromOtherDevice` reverts the latest batch of changes from another device instead (the note's "Undo these N"), as a new, undoable edit | `fromOtherDevice` |
| `arrangement_redo` | `sas arrangement redo` | Redo | none |
| `arrangement_export` | `sas arrangement export` | Render the song offline: the Mix, a Master, stems, editable stems, an Ableton hand-off. **Async** | `outputs` (or `stems` / `editableStems` / `ableton`), `preset` (`streaming`, `loud`, `custom`), `targetLufs`, `ceilingDbtp`, `bitDepth` (16, 24, 32), `stemBitDepth` (24, 32), `sampleRate` (master only: 44100, 48000, 96000), `path`, `name`, `tail` (`"auto"` or seconds, 0 to 30), `renderStale` |
| `arrangement_export_cancel` | `sas arrangement export-cancel` | Cancel the running export (nothing is written) | `jobId` |

`arrangement_export` writes a new folder inside `path` (default
`~/Music/Signals & Sorcery Exports`) and returns a `jobId` and the `name` it
used; the finished job lists the files, the loudness report, the stems null
test and any warnings. Only one export runs at a time. The export follows
what you hear: tracks the arranger's mute or solo silences get no stem (the
Ableton hand-off brings them in as muted tracks). Because it writes files
that no undo can take back, **an agent's export needs your approval**: the
app asks before it starts (the chat assistant asks in the chat). If you
decline, the call fails with `approval_denied` and the agent should not
retry. Exports you start from the app's own Export dialog don't ask twice.

- **`name`** names the folder (`<name> <date> <time>`) and the Mix, the
  Master and `export.json` inside it. Without one, the export takes the
  project's last export name, else the project's name followed by "Bounce".
  A `name` you pass is remembered for the project's next export.
- **Never overwrites an earlier export:** a second one with the same name in
  the same minute goes to a folder ending in `(2)`, then `(3)`. A failed or
  cancelled export removes only its own new folder.
- **`tail`** sets how long the files run past the song's end: `"auto"` (the
  default) rings out until silent, for up to 10 seconds; a number of seconds
  from 0 to 30 (such as `"1.0"`) ends every file exactly that long after the
  song. `export.json` records the name and the tail.
- **Ableton track order.** The Ableton hand-off lists its Live tracks in the
  order of the Arrange view's rows, as the user arranged them; the numbered
  files in `Stems/` keep their usual order. The cloud arranger's
  `arranger_export_ableton` orders its tracks the same way, from the project's
  own arrangement. With no custom order, both are exactly as before.

See [Exporting your song](/arrange/#exporting-your-song) for what each output is.

### Cloud sync and the web

| Tool | CLI | What it does | Inputs |
|---|---|---|---|
| `arrangement_sync_status` | `sas arrangement sync-status` | Read-only: the sync state (including `busy`: the cloud asked to slow down and it retries shortly), queued edits, the background stem uploads (`upload`: state, files done of total, bytes left, `sessionPaused`), notes, proposals, the web link, the latest changes from another device (`lastRemote`, e.g. "3 changes from your iPhone"), and how far "for the web" preparation has got (`webPrep`, with `sessionPaused` while paused until restart) | none |
| `arrangement_sync` | `sas arrangement sync` | Control Auto Sync Arrangements (on by default when signed in): `enabled` (false = nothing leaves the computer), `now` (sync and upload everything right away, at full speed), `dismissNotes`; the gentle background stem uploads (idle only; never while playing or rendering, on battery or in Low Power Mode): `pauseUploads` (true = pause until the app restarts, false = resume); and the "for the web" preparation of every scene's audio: `prepareAllScenes` (on by default), `pausePreparation` (until the app restarts). Reports `state`, `queued`, `enabled`, `upload` and `webPrep` | `enabled`, `now`, `dismissNotes`, `pauseUploads`, `prepareAllScenes`, `pausePreparation` (at least one) |

The web arranger edits the same arrangement (see
[Cloud sync and your phone](/arrange/#cloud-sync-and-your-phone)).

::: tip Not covered yet
`arrangement_share` (share links) and `arrangement_import_proposal` (adopting a
version from the cloud) are not documented here yet.
:::

::: warning A similar name
The `arranger_*` tools (`arranger_push`, `arranger_status`, …) drive the
separate cloud arranger (the arranger pane's **Cloud** tab), not Arrange
mode.
:::

See the worked examples [15](./examples.md#_15-arrange-a-song-from-your-scenes),
[16](./examples.md#_16-add-an-effect-to-one-bar),
[17](./examples.md#_17-copy-a-part-from-one-section-to-another),
[18](./examples.md#_18-export-the-song) and
[19](./examples.md#_19-even-out-the-kick-across-the-song).

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
- *what the agent should do next*: a `remediation` block (newer tools:
  the reason, the fix, and the exact CLI and MCP call to make) or a
  `suggestion` string (older tools), concrete: a tool name, often with
  example params
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

**Some calls wait for the composition to stop.** Opening the editor of an
instrument on a frozen track while the composition plays
(`instrument_open_editor`) returns `deferred_until_stop` with remediation
`deck_busy`: loading the plugin then would interrupt the music. Stop the
composition (`deck_stop` with `deckId: "loop-a"`, or `dsl_stop`) and call it
again; by then it opens at once. A playing arrangement doesn't block it.

**Which stop stops what.** `dsl_stop` is the transport bar's Stop: it stops
the composition (loop-a). `deck_stop` stops one deck, and `deck_stop_all`
stops both decks (loop-a and loop-b's baked loop), like the UI's Stop All.
None of these stop the arrangement; `arrangement_stop` does. For total
silence, call `deck_stop_all` and `arrangement_stop`.

**Play waits while tracks freeze.** While a freeze runs (one track or a whole
scene, from its first track to its last), Play is refused: `dsl_play`,
`deck_play`, `deck_queue_scene` and `arrangement_play` fail with
`FREEZE_IN_PROGRESS`, and the remediation has `retryable: true`. Nothing was
started or changed. Wait for the freeze to finish, then make the same call
again; the message says how far the freeze has got.

**One output: the newest Play wins.** The composition's decks and the
arrangement share one output, so when two Plays race, the later one keeps it:

- `deck_play` and `dsl_play` fail with `ARRANGEMENT_TOOK_OUTPUT` when the
  arrangement started playing while the deck was starting. If the deck should
  play, stop the arrangement (`arrangement_stop`), then play the deck again.
- `arrangement_play` fails with `PLAY_SUPERSEDED` when a deck started playing
  after this Play was asked for. If the arrangement should play, stop the decks
  (`deck_stop_all`), then call `arrangement_play` again.

Neither is broken, and neither is retryable (`retryable: false`): retrying
blindly would just take the output back. The remediation carries the stop call
as a CLI command and an MCP call.

**A freeze never installs silence.** `track_freeze` refuses to freeze a track
to silence, and so does each track of `scene_freeze` (there, the refusal is an
entry in `changes.failed` and the rest of the batch carries on). Nothing is
frozen, and the track keeps playing live:

- **The instrument made no sound.** The track has notes, but its instrument
  rendered pure silence; the message says it "made no sound for its notes".
  The remediation has `retryable: false`, because a retry renders the same
  silence. Tell the user to open the instrument and check that a patch or
  preset is loaded. For a sampler track, the usual cause is a sample library
  that was missing when the project loaded: install it, reopen the project and
  freeze again.
- **A plugin dropped out.** A sandboxed plugin (Kontakt, for example) dropped
  out during the offline render, so the engine refused the render; the message
  names the plugin. The remediation has `retryable: true`. The freeze already
  retried once: retry the same call once more, and if it drops out again, tell
  the user which plugin the message names.

**A save can succeed with a warning.** `project_save`, `project_save_as` and
`project_export` write the document even when the app couldn't update its own
working copy of the project (a read-only folder, a full disk, or no
confirmation from the audio engine). The call succeeds, but `changes.engineSave`
is present (`{ ok: false, errorCode, message }`) and the message asks the agent
to tell the user: until that is fixed, reopening the project in the app may
bring back older instrument and effect settings, while the saved document has
the current ones.

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
