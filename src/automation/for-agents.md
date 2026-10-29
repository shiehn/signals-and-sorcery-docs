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
| **Capability tools** (consent-gated) | `fs_list_directory`, `fs_read_file`, `fs_search`, `fs_write_file`, `shell_exec`. See [Capability tools](./capability-tools.md). Every call asks the user first, in a consent dialog on their machine. |
| **Discovery** | `tool_search` (always visible; finds any registered tool, deferred or not) |
| **Scene level** | `scene_set_level`: one level per scene, heard wherever the scene plays. See [Scene levels](#scene-levels) |
| **Arrangement** *(deferred)* | The `arrangement_*` tools that build, edit, play, export and sync a song from the project's scenes. See [Arrangement tools](#arrangement-tools) |
| **Song lyrics** *(deferred)* | `lyrics_get`, `lyrics_set_section`, `lyrics_set_description`, `lyrics_pin_takes`. See [Song lyrics](#song-lyrics) |
| **Measure and verify** | `sas_measure`, `sas_verify_outcome`. See [Measure and verify](#measure-and-verify) |
| **Goals and memory** *(deferred)* | `goal_create`, `goal_update`, `goal_list`, `goal_show`, `goal_current`, `goal_briefing`, `goal_activate`, `goal_park`, `goal_abandon`, `goal_decide`, `goal_rebuild`, `memory_write`, `memory_query`, `memory_retire`. See [Goals and memory](#goals-and-memory) |
| **Runs** *(deferred)* | `run_start`, `run_end`, `run_get`, `run_list`. See [Runs and the intent log](#runs-and-the-intent-log) |
| **Visible commands** *(deferred)* | The `ui_*` tools: the app performs a command on screen the way a click does (`ui_scene_select`, `ui_track_fader_set`, `ui_transport_toggle`, …), plus `ui_view_state`, `ui_find`, `ui_screenshot`. See [Visible commands](#visible-commands) |
| **Skills** *(deferred)* | `skill_search`, `skill_load`: the app's how-to notes (terms, recipes). See [Skills](#skills) |

## Arrangement tools

[Arrange mode](/arrange/) is fully scriptable. The `arrangement_*` tools cover
what the arranger does: build and play the song, loop part of it,
place and copy sections, start the song with pickup bars, mute and solo tracks,
switch layers on and off, copy and paste bars or beats, split and trim clips,
fade a section, a layer or one clip, add effects, choose which take a section
sings, match the scene levels, undo, and export. They are deferred, so find them with
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
  `startBar`, `startQn`, `linkedWith`, and `takes[]` when the scene has a set
  of takes: per group its `take` of `of`, `picked` when pinned, and the
  `resting` layers), `variants[]` with each layer's state
  (`name`, `home`, `play` as `on`, `off` or a bar mask like `00001111`, fades
  and their curves, gain, `gainEnvelope`, `splits`, `treatments`, `subBar`
  when the layer starts, stops or splits inside a bar, and `clips` for the
  clips that have fades or a level of their own),
  `pickupBars` and `pickupQn` (see below), `scenes[]`, the arranger's track mute and solo states (`rowStates[]`), and
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
- **Bars, and beats when you need them.** Every region, clip, split and paste
  takes bars; add a beat to work inside a bar: `fromBeat` / `toBeat` on a
  region, `beat` on a clip, a run or a split, and `at.beat` on a paste. Beats
  are 1-based and count the meter's beat (quarter notes in 4/4, eighths in
  6/8). A call with bars only works on whole bars, exactly as before. A copy
  that starts or ends inside a bar pastes beat for beat.
- **Pickup bars.** A song can start before bar 1: `arrangement_set_pickup`
  adds lead-in bars (0, −1, …) that play the first section's loop up to its
  downbeat, so the song starts inside its loop instead of with silence. Song
  bar 1 stays the first section's downbeat, so `startBar` never moves;
  quarter-note positions (`startQn`, `totalQn`, the loop's beats) count from
  the very start, pickup included. While the playhead is in the pickup,
  `arrangement_status` reports bar 0, −1, and so on.
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
  being frozen it fails with `FREEZE_IN_PROGRESS`, and while audio is rendering
  with remediation `render_in_progress` (see
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
| `arrangement_set_pickup` | `sas arrangement pickup` | The editor's **+ Bar** / **−** left of bar 1: pickup bars before the first section, playing its loop up to its downbeat in phase (a layer silent at that downbeat stays silent there). They belong to the song, so whichever section comes first fills them. Returns `pickupBars`, `pickupQn` and `leadsInto` (the first section's label). One undo step | `bars` (0 to 64; 0 removes them) |
| `arrangement_assign_takes` | `sas arrangement assign-takes` | Which take a section sings. A scene's takes (an alternatives group: one Synth V take per verse of the lyrics, or drum fills) play by themselves, one per section by its position (the second verse sings take 2, starting over when there are more sections than takes), so this is only for changing that: with a section and `take`, pin it to that take (the pin stays when sections move), or `auto` to unpin it; with no section, put every take in scope back in order (clears every pin). Not needed after singing, adding or moving sections. One undo step | `instance` (optional); `take` (1 to N, or `auto`); `scene` (optional); `track` (a layer of the takes group, when a scene has several); `apply` (default true; `false` previews) |

`arrangement_get` lists each section's `takes[]`, and the timeline lines say
`take 2/3` (`picked` when pinned). `arrangement_assign_takes` returns `status`
(`applied`, `already-assigned`, `planned` for a preview, or `nothing-to-assign`
when the scope has no takes) and `assignments[]` with every section's take;
pinning a section whose scene has no set of two or more takes fails with
`no_takes`.

### Song lyrics

A song keeps one set of words: the arrangement's lyric document, one section
per placement of a scene, in song order. The arrangement's **Lyrics** tab, these
tools and the panels (through the Plugin SDK's song-lyrics API) all read and
write the same document. It is saved with the project (a `.sas` file carries
it) but stays on this computer: cloud sync and the web arranger don't carry the
words. The song export does: each section of the score can carry its words and
its role (see [the export format](/contract/arrangement-export/)). A removed
section's words move to `spare`, never lost.

| Tool | CLI | What it does | Inputs |
|---|---|---|---|
| `lyrics_get` | `sas lyrics get` | Read-only: the song's description, then every section in song order: `instanceId`, `label`, `scene`, `startBar`, `bars`, `role` (verse, chorus, bridge, as the model or the user set it; never guessed), `lines` (one per sung phrase; a repeat's words filled in), `locks`, `hints`, `sameAs`, `take`, `voiceTrackDbId` (`null` = instrumental) and `status` (`empty`, `written`, `take-stale` or `rendered`). Also `spare` (words whose section was removed) and `songWriters` (the tools that write the whole song) | none |
| `lyrics_set_section` | `sas lyrics set-section` | Write one section. Only the fields you pass change; `null` clears `role`, `sameAs`, `take` and `renderedSig`. Setting a `role` applies the chorus rule: later placements of the same scene with the same role and no words of their own repeat this one (`vary: true` skips that). Writing a section that others repeat rewrites them too | `instanceId`, `index` or `instance` (a label or a position, as in the arrangement tools); any of `lines`, `locks`, `hints`, `role`, `sameAs`, `take`, `renderedSig`, `voiceTrackDbId`; `vary` |
| `lyrics_set_description` | `sas lyrics set-description` | Set what the whole song is about, in a sentence or two; the song writer reads it for every section. `''` clears it | `description` (at most 2000 characters) |
| `lyrics_pin_takes` | `sas lyrics pin-takes` | Make the words follow their sections: pin every section whose take is known to that take, in one undo step ("Song lyrics: takes"), so moving sections moves their words. It runs by itself after a vocal render records takes; call it after a reorder if a section sings the wrong verse. Sections it can't pin are listed in `skipped` | none |

- **Caps.** At most 64 lines of 300 characters per section. A `sameAs` must
  name a placement of the same scene and can't loop. A section that repeats
  another can't take `lines` until you clear its `sameAs` in the same call.
- **Writing is not singing.** The words are sung by one **Sing** in each vocal
  scene's Synth V panel; a section whose words changed after its render reads
  `take-stale`.
- **Two ways to count takes.** `take` here is 0-based (the vocal reading's
  take index, recorded by the panel after a render); `arrangement_assign_takes`
  counts takes from 1.
- A write that changes nothing fails with `no_change` and emits no event.
  Writes emit `lyrics:changed`.

```bash
# The words of every section
sas lyrics get --json | jq '.data.changes.sections[] | {label, role, status, lines}'

# The last chorus gets its own words instead of repeating the first one
sas run lyrics_set_section -p instance="the last chorus" -p sameAs=null
sas run lyrics_set_section -p instance="the last chorus" -p lines="first line
second line"
```

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
| `arrangement_copy` | `sas arrangement copy` | Copy to the shared clipboard: a `region` of bars (or beats), a layer's whole `run`, one `clip`, or `sections` | one of `region`, `run`, `clip`, `sections` |
| `arrangement_paste` | `sas arrangement paste` | Paste bars onto their own lanes from a bar (or a beat), or sections after a section; pasted bars **replace** what was there | `at` (`{instance, bar, beat}` or `{bar, beat}`; `beat` optional) or `afterSection`; `linked` |
| `arrangement_delete_region` | `sas arrangement silence` | Silence bars or beats (the song does **not** get shorter; to remove a section use `arrangement_delete_instance`) | `instance`, `track` or `tracks`, `fromBar`, `toBar`, `fromBeat`, `toBeat`; or `clip` |
| `arrangement_duplicate` | `sas arrangement duplicate-selection` | Duplicate sections, a region or a clip right after itself (like ⌘D) | one of `sections`, `region`, `clip` |
| `arrangement_split` | `sas arrangement split` | Split a layer's clip at a bar, or at a beat of it (no change in sound) | `track` or `tracks`, `bar` (+ `beat`) or `bars` (numbers or `{bar, beat}`), `instance` |
| `arrangement_join` | `sas arrangement join` | Remove the splits inside a region (section starts always stay clip edges) | `instance`, `track` or `tracks`, `fromBar`, `toBar`, `fromBeat`, `toBeat` |
| `arrangement_trim_clip` | `sas arrangement trim` | The editor's clip-edge drag: move a clip's start or end to a bar line or a beat. Inward trims, outward extends (more of the loop, never a stretch). The edge stays inside the clip's section and stops at the next clip; a clip keeps at least 1 bar (1 beat when `toBeat` is given). Returns the clip's new `span`. One undo step | `track` or `trackId`; the clip: `bar` (+ `beat`) inside it, `instance`; `edge` (`start` or `end`); `toBar` (+ `toBeat`) |
| `arrangement_set_clip` | `sas arrangement clip` | Give **one clip** its own fades and level, the editor's clip fade handles and clip gain; every other clip of the layer keeps what it plays. The first clip edit on a layer hands the layer's own fades and gain to each of its clips, so nothing else changes sound. One undo step | `track` or `trackId`; the clip: `bar` (+ `beat`) inside it, `instance`; any of `fadeInBeats`, `fadeOutBeats` (quarter notes; 0 removes), `fadeInCurve`, `fadeOutCurve` (`equalPower`, `linear`, `exponential`, `sCurve`, or `default`), `gainDb` (±24, on top of the track fader) |

For every clip of a layer at once, use `arrangement_set_layer`; for every layer
at a section's edge, `arrangement_fade_section`.

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

### Scene levels

| Tool | CLI | What it does | Inputs |
|---|---|---|---|
| `arrangement_normalize_kick_levels` | `sas arrangement normalize-kicks` | The arranger's **Match scene levels** button: measures every scene from its layer stems and sets each scene's level (the scene card's fader, the same value `scene_set_level` sets) so every scene plays at the same perceived loudness (`matchOn` `overall`, the default) or the same kick loudness (`kick`); the balance inside a scene is untouched. Running it again replaces the previous match, it never stacks (a run in the other mode is a new match). **Async** | `matchOn` (`overall`, the default, or `kick`), `apply` (default true; `false` is a dry run that measures and reports but changes nothing), `maxBoostDb` (default 6), `maxCutDb` (default 12, a positive number), `ceilingDbtp` (default −1), `exclude` (scene names or ids to leave exactly as they are) |
| `scene_set_level` | `sas run scene_set_level` | Set a whole scene's level by hand, like its card's fader: one gain after the tracks and panel buses, so the balance inside the scene is untouched. Emits `scene:level-changed` | `scene` (name or id), `levelDb` (−60 to +6 dB; 0 is unity) |
| `arrangement_set_scene_gain` | `sas run arrangement_set_scene_gain` | The same action as `scene_set_level`, under its older name | `scene` (name or id), `gainDb` (−60 to +6 dB, or `null` to reset it to 0 dB) |

How they behave:

- **One level per scene.** A scene has one level, heard wherever it plays: the
  scene editor, either deck, the arrangement, and scene WAV and Ableton exports.
  `sas_inspect_scene` reports it as `levelDb`. `deck_set_volume` on loop-b is a
  performance trim on top of it and never changes it.
- **Not undo steps.** Like a fader, a level change (by hand or by a match) is
  not in the arrangement's undo history: a matched scene's previous level is
  replaced. Run the match as a dry run first to see what it would change.

- **Stems first.** The match renders any out-of-date layer stems before it
  measures. Rendering can't happen while something plays, so if a stem needs
  it, the call fails until you stop playback (`dsl_stop` or `arrangement_stop`);
  a render that is already running fails it with a retryable remediation.
- **The ceiling.** No scene's peaks go above `ceilingDbtp` before the master,
  or above the arrangement's loudest current peak if that is higher. No scene is
  raised more than `maxBoostDb` or lowered more than `maxCutDb`.
- **Kick mode.** With `matchOn: "kick"`, scenes without a kick, or where it
  isn't clear which layer is the kick, are matched on overall loudness instead
  and flagged (`flag` `no-kick`); the kick target is `target_lufs`.
- **The result** (`changes`): `status` is `applied`, `already-matched` (nothing
  to change), `dry-run`, `no-kick` (kick mode: no scene has a clear kick, so
  nothing changed) or `empty`; then `match_on`, `summary`, `target_lufs` (kick
  mode), `overall_target_lufs`, `ceiling_dbtp` and `scenes[]` (`scene`,
  `scene_id`, `basis` as `overall`, `kick` or `excluded`, `kick_tracks`,
  `kick_lufs`, `overall_lufs`, `confidence`, `peak_dbtp`, `headroom_db`,
  `gain_db`, `flag`). When some
  layers weren't heard, `not_measured[]` names them with a `reason`:
  `not-loaded` (a loop of a scene not opened since the project was opened:
  open that scene, then call again) or `no-stem` (its stem didn't render).
- **A hand-set level** from `scene_set_level` is replaced by a later match for
  any scene the match covers; pass that scene in `exclude` to keep it.
- **Guests keep their own level.** A layer playing as a guest in another
  scene's section keeps its own scene's level.
- **Older projects.** A scene whose arrangement still holds a gain from an
  older match plays at its level plus that gain in the arrangement
  (`sas_inspect_scene` shows it as `legacyArrangementGainDb`). Setting the
  scene's level folds it in (`absorbedLegacyDb` in the result), and from then
  on the scene has one level.

```bash
# Dry run: what would change?
JOB=$(sas arrangement normalize-kicks --apply false --json | jq -r '.data.changes.jobId')
sas job wait "$JOB" --timeout 300

# Match the kicks instead of the overall loudness
JOB=$(sas arrangement normalize-kicks --match-on kick --json | jq -r '.data.changes.jobId')
sas job wait "$JOB" --timeout 300

# Set the chorus 1.5 dB down by hand, then back to unity
sas run scene_set_level -p scene=Chorus -p levelDb=-1.5
sas run scene_set_level -p scene=Chorus -p levelDb=0
```

### Undo and export

| Tool | CLI | What it does | Inputs |
|---|---|---|---|
| `arrangement_undo` | `sas arrangement undo` | Undo the last edit made on this computer (the arrangement's own history; changes synced in from another device are not undo steps, and a field another device changed later is kept, counted in `keptRemote`). `fromOtherDevice` reverts the latest batch of changes from another device instead (the note's "Undo these N"), as a new, undoable edit | `fromOtherDevice` |
| `arrangement_redo` | `sas arrangement redo` | Redo | none |
| `arrangement_export` | `sas arrangement export` | Render the song offline: the Mix, a Master, stems, editable stems, an Ableton hand-off. **Async** | `outputs` (or `stems` / `editableStems` / `ableton`), `preset` (`streaming`, `loud`, `custom`), `targetLufs`, `ceilingDbtp`, `bitDepth` (16, 24, 32), `stemBitDepth` (24, 32), `sampleRate` (master only: 44100, 48000, 96000), `path`, `name`, `tail` (`"auto"` or seconds, 0 to 30), `renderStale`, `pathFree` (default false), `score` (default true), `scoreNotes` (default false) |
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
- **`pathFree: true`** leaves every absolute path out of `export.json`, for a
  folder you are going to share: no destination folder and no master file
  paths, the Ableton bundle by its folder name only, and notes and warnings
  written relative to the export folder, with the home folder as `~`. By
  default (`false`) the file records where it was written.
- **`score`** (default `true`) writes the resolved score into `export.json`:
  the tempo and meter maps, the bar grid, the sections, and every layer as it
  plays (where it sounds, its fades, gains and placed effects); `false` leaves
  it out. **`scoreNotes: true`** adds the notes each layer plays, in audio
  frames (off by default, as in the app's **Include played notes (MIDI)**).
  When any section of the song has words (see [Song lyrics](#song-lyrics)),
  every section of the score carries its `lyrics` (`[]` for an instrumental
  one) and its `role` when it has one, and `export.json` gains a
  `lyricsHash`.
  See [Score](/contract/arrangement-export/#score).
- **Ableton track order.** The Ableton hand-off lists its Live tracks in the
  order of the Arrange view's rows, as the user arranged them; the numbered
  files in `Stems/` keep their usual order. The cloud arranger's
  `arranger_export_ableton` orders its tracks the same way, from the project's
  own arrangement. With no custom order, both are exactly as before.

See [Exporting your song](/arrange/#exporting-your-song) for what each output is,
and [the arrangement export format](/contract/arrangement-export/) for what
`export.json` holds, field by field, with its JSON Schema.

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
[18](./examples.md#_18-export-the-song),
[19](./examples.md#_19-match-the-scene-levels),
[20](./examples.md#_20-sing-the-first-verse-again),
[21](./examples.md#_21-start-the-song-inside-the-verse) and
[22](./examples.md#_22-fade-out-one-clip).

## Measure and verify

Before telling the user a change is done, measure it. `sas_measure` reads what a
scene (or one track) is and how it sounds; `sas_verify_outcome` checks a
written-down outcome against those measurements and returns a verdict with the
evidence. Both are on the default surface, project-scoped, and run in one call
(no `jobId`): one render, usually 5 to 30 seconds.

| Tool | What it does | Inputs |
|---|---|---|
| `sas_measure` | Typed measurements of a scene, or one track. `structural-1` (bars, meter, BPM, the contract's key and genre, roles, every track's role, plugin, instrument, preset and whether it has notes, sample categories), `midi-1` (the chords' key, chord and note agreement), `lufs-1` (integrated loudness, sample and true peak, loudness range, the peak before any trim), `silence-1`, `tempo-1` (BPM), `key-1` (tonic and mode), `rf-1` (rhythm features of one track). The audio ones come from one honest render: faders and pans as authored, no normalising, no limiter, so clipping shows | `sceneId` (name or id; default the active scene), `trackId` (measure one track), `ids` (default `structural-1`, `midi-1`, `lufs-1`, `silence-1`, `tempo-1`, `key-1`, plus `rf-1` with a track), `render` (default true; `false` never renders and uses cached results) |
| `sas_verify_outcome` | Judge an outcome against measured evidence: `achieved`, `partial` or `failed`, with every clause's measured value, threshold and measurement id | `outcome` (the spec, below) or `goalId` (a goal's stored outcome); `sceneId` / `trackId` (the scope for clauses that name none); `render` |

Each measurement is an envelope: `id`, `subject`, `status` (`ok`,
`insufficient_signal` when there is nothing to measure, such as silence,
`unsupported` or `error`), `values`, `confidence` and `noiseFloor`.

An **outcome** (`outcome-1`) is the user's sentence written as clauses:

```json
{
  "version": "outcome-1",
  "sentence": "a 16-bar chorus that doesn't clip",
  "clauses": [
    { "kind": "bars", "mode": "required",
      "evidence": [{ "id": "structural-1", "field": "bars", "op": "eq", "value": 16 }] },
    { "kind": "no_clipping", "mode": "required",
      "evidence": [{ "id": "lufs-1", "field": "preTrimPeakDb", "op": "lte",
                     "ref": "thresholds-v1:clipping.max_pre_trim_peak_db" }] }
  ]
}
```

- A clause's `mode` is `required`, `forbidden` or `preferred`; each evidence
  item names a measurement, a field, an operator (`eq`, `ne`, `lt`, `lte`, `gt`,
  `gte`, `approx`, `in`, `not_in`, `contains`, `not_contains`, `matches`,
  `key_eq`, `exists`) and a `value`, or a `ref` into the app's thresholds file.
- Clause kinds it can decide today: `bars`, `meter`, `tempo`, `key`,
  `loudness`, `no_clipping`, `no_silence`, `role_present` and `provenance`.
  Others read `unknown`.
- Evidence that can't be measured never fails a clause; it caps the verdict at
  `partial`. Tempo and key backed only by the project's own settings (not by
  the audio) read `unknown` unless the clause says `structural_only_ok: true`.
  `preferred` clauses never move the verdict.

```bash
sas run sas_measure --json-body '{"sceneId": "Chorus", "ids": ["lufs-1", "tempo-1", "key-1"]}'
sas run sas_verify_outcome --json-body '{"sceneId": "Chorus", "outcome": {"version": "outcome-1", "clauses": [{"kind": "bars", "mode": "required", "evidence": [{"id": "structural-1", "field": "bars", "op": "eq", "value": 16}]}]}}'
```

See [example 23](./examples.md#_23-keep-a-goal-and-check-it-before-you-say-done).

## Goals and memory

A **goal** is a request that takes more than one step ("make the chorus hit
harder"), kept with the project: the user's words verbatim, an outcome (the
spec above), the decisions made along the way, blockers, the scenes it works on,
and memories. Any agent, in any session, resumes a goal from its briefing
instead of from a chat transcript. Goals travel with the project in a `.sas`
file. The tools are deferred; in the CLI they are `sas goal …` and
`sas memory …`.

| Tool | CLI | What it does | Inputs |
|---|---|---|---|
| `goal_create` | `sas goal create` | Start a goal from the user's words; it becomes the current goal | `brief` (the user's words, verbatim), `title`, `outcome`, `thresholdsVersion`, `parentGoalId` (goals nest two deep), `scenes` (scene ids to claim), `claimMode` (`shared` or `exclusive`), `origin`, `activate` (default true; false makes a proposed goal) |
| `goal_update` | `sas goal update` | Revise the title, the outcome (every revision is logged), the claimed scenes, or set and clear a blocker | `goal`; `title`, `outcome`, `thresholdsVersion`, `scenes`, `claimMode`, `blocker` (`consent_pending`, `missing_plugin`, `quota`, `engine_unreachable`, `needs_user_choice`) + `blockerDetail`, `clearBlocker` |
| `goal_list` | `sas goal list` | Read-only: the project's goals, most recently touched first | `status` (`proposed`, `active`, `paused`, `blocked`, `achieved`, `abandoned`), `limit` |
| `goal_show` | `sas goal show` | Read-only: one goal in full, with its latest events | `goal` (default the current goal), `events` (default 20, at most 200) |
| `goal_current` | `sas goal current` | Read-only: which goal the user's words belong to: the one you activated, else the one claiming the active scene, else a clarification. Never guessed. `brief: true` prints its briefing | `goal`, `brief` |
| `goal_briefing` | `sas goal briefing` | Read-only: the resumable summary (about 6 KB, and the same goal state always gives the same bytes): the brief, the outcome, the last verdict's open clauses, the last 8 decisions, blockers, the top 10 memories, what changed since the last run, the park note | `goal` (default the current goal) |
| `goal_activate` | `sas goal activate` | Make a goal the one you work on: confirm a proposed goal, resume a parked one, reopen a finished one | `goal` |
| `goal_park` | `sas goal park` | Pause a goal with a note on where you stopped and what is next, optionally pinning a checkpoint to come back to (a pinned checkpoint is never pruned) | `note`, `goal`, `checkpointId` |
| `goal_abandon` | `sas goal abandon` | Stop a goal for good and release its scenes; its log stays and `goal_activate` can reopen it | `goal`, `reason` |
| `goal_decide` | `sas goal decide` | Record a choice, what was not chosen and why, so a resumed agent doesn't argue it again | `choice`, `why`, `alternatives`, `evidence`, `by`, `goal` |
| `goal_rebuild` | `sas goal rebuild` | Replay the goal log and rewrite every goal from it (the log is the truth); `changedGoalIds` empty means all was in order | none |
| `memory_write` | `sas memory write` | Remember something lasting about the project or one goal | `statement`, `kind` (`fact`, `preference`, `know_how`, `rejected_option`, `constraint`); `scope` (`goal` or `project`), `goal`, `source` (`user_said`, `user_action`, `brain_inferred`, `verifier`), `subject`, `tags`, `confidence` (0 to 1), `evidence`, `supersedes` (the memory it replaces) |
| `memory_query` | `sas memory query` | Read-only: the project's memories, narrowest scope first, then newest, most confident and best evidenced | `scope`, `goal`, `kind`, `tags`, `includeRetired`, `includeSuperseded`, `limit` (default 20, at most 100) |
| `memory_retire` | `sas memory retire` | Retire a memory that no longer holds; it stays for history but leaves briefings and queries | `memory` |

- **Start every turn on a goal from `goal_briefing`** (or
  `sas goal current --brief`), not from the transcript.
- **Pass the user's words as `brief`, never a paraphrase.** The brief never
  changes; a new request is a new goal.
- **Scene claims.** A goal claims the scenes it works on, `shared` by default. A
  scene another goal holds `exclusive` refuses the claim with `goal_conflict`.
- **What the user said wins.** A `user_said` memory beats an inferred one; a
  contradiction is recorded as a conflict, never merged silently.
- `goal` takes a goal id or a unique prefix of at least 4 characters (from
  `sas goal list`). Changes emit `goal:*` and `memory:*` events.

```bash
sas goal create --brief "make the chorus hit harder, keep the 4-bar loop"
sas goal decide --choice "Surge XT brass patch" --why "closest to a saxophone on this machine"
sas memory write --statement "keep the kick dry, no reverb" --kind preference --source user_said
sas goal park --note "verse done; next: the saxophone answer in bar 3"
sas goal current --brief      # later, in any session
```

## Runs and the intent log

A **run** records a span of an agent's work, bound to a goal, as one unit you
can review: every call and event in a timeline, with before and after
summaries, written under `~/.signals-and-sorcery/runs/<runId>/`. Nothing
requires a run.

| Tool | CLI | HTTP | What it does |
|---|---|---|---|
| `run_start` | `sas runs start` | `POST /api/v1/runs` | Open a run (`goalId`, `label`, both optional); returns its `runId` |
| `run_end` | `sas runs end` | `POST /api/v1/runs/:id/end` | Close it (`status`: `completed`, `failed` or `aborted`; `note`). Consent granted for the run ends with it |
| `run_get` | `sas runs get` | `GET /api/v1/runs/:id` (`/events` for the timeline) | One run, and a page of its timeline (`timeline`, `since`, `limit`) |
| `run_list` | `sas runs list` | `GET /api/v1/runs` | Runs, newest first (a run left open by a restart reads `interrupted`) |

Bind your calls to a run by sending its id as the `X-SAS-Run-Id` header, or set
`SAS_RUN_ID` for the `sas` CLI. An unknown run id is answered with a warning
header, never refused.

**Who is calling.** At startup the app writes this session's token to
`~/.signals-and-sorcery/api.json` (readable only by you), and the `sas` CLI
sends it as a bearer token. The token identifies the caller; it doesn't change
what a call may do. `GET /api/v1/whoami` shows who a request resolves to.

**The intent log.** Every change made in the app, by you or by an agent, is
recorded as an intent with who made it. `GET /api/v1/intents` reads it
(`?since=<seq>`, `project=current|all|<id>`, `limit`). Events on
`/api/v1/events/stream` carry a sequence number and replay from
`Last-Event-ID` or `?since=` after a reconnect.

**The tool list says more.** Each entry from `/api/v1/actions` also carries
`readOnly`, `consentClass` (see [Capability tools](./capability-tools.md)),
`asyncJob` and `category`.

## Visible commands

The `ui_*` tools have the app do something **on screen**, the way a click does,
with the control's own handler: the user sees the scene card selected, the fader
move, the Create button pressed. By default a command is `narrated` (a cursor
glides to each step and highlights it); pass `performance: "instant"` to skip
the animation. The end state is the same. A command whose effect is a registry
tool reports it as `changes.effectTool` and counts as that tool's change; a view
change (opening a panel, revealing a track) changes nothing in the project.
The CLI groups them under `sas ui` (`ui_scene_select` is
`sas ui scene select`).

| Tool | CLI | What it does | Inputs |
|---|---|---|---|
| `ui_scene_select` | `sas ui scene select` | Select a scene, as a click on its card (same as `scene_activate`) | `sceneId` |
| `ui_scene_create` | `sas ui scene create` | The scene list's **+** button (same as `scene_create`) | none |
| `ui_panel_open` / `ui_panel_close` | `sas ui panel open` / `close` | Open or close a panel's section (view only) | `panelId` (a plugin id, or `scenes`, `chords`) |
| `ui_track_reveal` | `sas ui track reveal` | Bring a track into view: its scene, its panel, its row scrolled to and focused (view only) | `trackId`; `sceneId`, `panelId`, `pulse` |
| `ui_track_fader_set` | `sas ui track fader set` | Move a track's fader (0 to 1, same as `dsl_track_volume`) | `trackId`, `value` |
| `ui_track_mute` / `ui_track_solo` | `sas ui track mute` / `solo` | Click the row's **M** or **S**; `muted` / `soloed` sets the state, omitted toggles | `trackId`; `muted` or `soloed` |
| `ui_panel_prompt_type` | `sas ui panel prompt type` | Type into a panel's prompt field | `panelId`, `text`; `trackId` |
| `ui_panel_generate_click` | `sas ui panel generate click` | Click a row's **Create** and wait until it finishes generating | `panelId`; `trackId` |
| `ui_deck_play` / `ui_deck_stop` | `sas ui deck play` / `stop` | Press a deck's Play or Stop | `deckId` (`loop-a` or `loop-b`) |
| `ui_transport_toggle` | `sas ui transport toggle` | Play or stop, as the **Space** key does: `context` `auto` (the default: the row the user last clicked or focused), `arrangement` or `scene` | `context` |
| `ui_arrangement_play` / `ui_arrangement_stop` / `ui_arrangement_toggle` | `sas ui arrangement play` / `stop` / `toggle` | The arrangement row's Play, Stop and Play/Stop button, with its rules: Play waits for the audio to be ready and starts by itself, is refused while a freeze runs; Stop also cancels a queued Play | none |
| `ui_scene_play_toggle` | `sas ui scene play-toggle` | Play or stop the selected scene on loop-a (a double Space). `sceneId` selects that scene first; `playing` sets the state, omitted toggles | `sceneId`, `playing` |
| `ui_view_state` | `sas ui view-state` | Read-only: what is on screen now: the page, the decks, the scene Compose shows, open sections and drawers, the focused track, every visible track row, the arranger selection, open dialogs, the command being performed, and `transportContext` (the row, `arrangement` or `scene`, that Space and `ui_transport_toggle` play and stop) | none |
| `ui_find` | `sas ui find` | Read-only: find elements by `data-testid` (a trailing `*` matches a prefix) or visible text; returns their bounds in the window, visible and disabled | `testId` and/or `text`; `trackId`, `limit` (default 25, at most 200) |
| `ui_screenshot` | `sas ui screenshot` | Capture the app's window to a PNG in the system's temp folder; returns its `path` and size | none |

Every command also takes `performance` (`narrated` or `instant`). Starting the
arrangement stops the scene and the other way round, as on screen. The commands
need the app's window: without one (a headless launch, or while the window is
still loading) they fail with remediation `ui_unavailable`. A command that times
out may still be running: read `ui_view_state` before trying again.

```bash
sas ui view-state --json | jq '.data.changes.transportContext'
sas ui scene select --scene-id "$SCENE" --performance narrated
sas ui track fader set --track-id "$TRACK" --value 0.6
sas ui transport toggle
```

## Skills

The app ships a set of how-to notes (S&S vocabulary, recipes such as finding a
file's BPM or splitting stems). `skill_search` finds them by topic (an empty
query lists them all) and `skill_load` returns one in full. Skills explain;
tools act, so use `tool_search` to find a tool.

```bash
sas skill search --query "key detection"
sas skill load --name sas-terminology
```

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

For work that spans many turns, keep a [goal](#goals-and-memory) and resume
from its briefing, and before you say the work is done, check it with
[`sas_verify_outcome`](#measure-and-verify) and report the verdict with its
evidence.

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

**Scenes resolve within the project.** A tool that takes a scene accepts the
name the app shows (`"Verse"`) or the scene's id, and matches only this
project's scenes. That includes `export_audio` (`sceneName`),
`sas_render_preview`, `sas_audition` and `dsl_generate_fill` (`sceneId`), and
`deck_load_scene` (`scene`). A name that matches several scenes returns a
clarification to pick from; a name that matches none fails with
`scene_not_found`, and `changes.availableScenes` lists the project's scenes.
`scene_get_all` and `sas inspect` list the same scenes.

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

**Play waits while audio renders.** While the audio engine is rendering (a
freeze, an export, a rendered preview or a stem), nothing can start playing:
`dsl_play`, `deck_play`, `play_scene`, `arrangement_play`, `audio_test_tone`
and `sample_preview` fail with remediation category `render_in_progress` and
`retryable: true`. Nothing was started or changed. The engine is busy, not
broken: wait a few seconds, then make the same call again. Check
`remediation.category`, not `error`, which differs from tool to tool. A
`sample_preview` that waits for the next bar has already returned when its
start is refused, so the app shows the user a notice instead.

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
