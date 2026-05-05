---
sidebar: auto
title: The plan-as-artifact loop
---

# The plan-as-artifact loop

> *Do not expose a DAW as hundreds of low-level commands and hope the
> agent figures it out. Expose a small, typed, reversible, state-aware
> command surface that lets the agent inspect → plan → validate →
> preview → commit → undo.*

S&S takes that pattern literally. Every mutation an AI agent triggers
begins life as a **typed JSON Plan** — a self-describing artifact the
agent can read, edit, validate against current state, hand to the
executor, and undo cleanly if the result misses the mark.

This page is the agent-facing reference. It covers when to use the loop,
the six verbs, the Plan and PlanValidationResult shapes, error recovery
via `suggestedFix`, and the relationship to checkpoints.

## When to use the loop

| Situation | Recommended path |
|---|---|
| Multi-step musical change ("make a beat", "add bass + drums + keys") | Plan loop |
| One-shot read ("what scenes exist?") | `sas inspect …` directly |
| One-shot mutation already covered by a composite (`compose_scene`) | Either — composite auto-applies with checkpoint |
| Pure transport ("play", "stop") | Direct tool call (`sas dsl_play`) |
| Anything you might want to undo | Plan loop |
| State-dependent change ("revise the bass darker") | Plan loop — validator catches missing preconditions |

The non-loop tools are still there. The loop is a *higher-leverage* path
for changes the agent expects to think about: it forces a state check,
saves a recovery point automatically, and gives the agent a structured
preview of what would happen before the engine touches anything.

## The six verbs

```
                 ┌─────────────────────────────┐
                 │       sas inspect …          │  Read current state
                 └──────────────┬──────────────┘
                                ▼
                 ┌─────────────────────────────┐
                 │       sas plan <intent>      │  Intent → typed Plan
                 └──────────────┬──────────────┘
                                ▼
                 ┌─────────────────────────────┐
                 │       sas validate <plan>    │  Schema + preconditions
                 └──────────────┬──────────────┘
                          valid │
                                ▼
                 ┌─────────────────────────────┐
                 │       sas apply <plan>       │  Auto-checkpoint + execute
                 └──────────────┬──────────────┘
                                ▼
                 ┌─────────────────────────────┐
                 │       sas preview            │  Hear the result
                 └──────────────┬──────────────┘
                       miss     │     hit
                       ┌────────┴───────┐
                       ▼                ▼
       ┌────────────────────────┐   ┌─────────────────┐
       │  sas history undo      │   │  next iteration │
       │  → back to checkpoint  │   │  (revise / add) │
       └────────────────────────┘   └─────────────────┘
```

Every verb is read-only or reversible. The only step that writes is
`apply`, and it always saves a checkpoint first.

## A worked example

```bash
# 1. See what we're working with
sas inspect project --json | jq .

# 2. Ask for a plan
sas plan "make a chill 4-bar lo-fi beat in A minor at 85 BPM" \
  --plan-out /tmp/lofi.plan.json

# 3. Sanity-check the plan against current state
sas validate /tmp/lofi.plan.json
# → { "valid": true, "preview": { "wouldCreate": { "scenes": 1, "tracks": 4 }, ... } }

# 4. Apply with auto-checkpoint
sas apply /tmp/lofi.plan.json --checkpoint pre-lofi
# → "Applied 5/5 steps · Checkpoint: pre-lofi"

# 5. Listen
sas preview --json | jq '.data.changes.audio.url'
# → "file:///.../render-cache/<hash>.wav"

# 6a. Happy with it? Iterate.
sas plan "make the keys jazzier" --plan-out /tmp/jazzier.plan.json
sas apply /tmp/jazzier.plan.json

# 6b. Or roll back to the pre-lofi state
sas history undo pre-lofi
```

Every line is one `sas` invocation. No engine state-machine to track,
no manual cleanup if something goes wrong.

## The Plan shape

Plans are versioned JSON. The current schema is `plan_schema_version: 1`.

```jsonc
{
  // Stable id; agents key revisions by this.
  "id": "plan-scene_create-1714850000-abc123",

  // Free-text user-facing goal — mirrored from the user's input.
  "intent": "make a chill 4-bar lo-fi beat",

  // Top-level type tag. Determines validator branch + builder template.
  // One of: scene_create | scene_revise | track_revise | transition_create
  //       | mix_balance | render_preview | composite
  "type": "scene_create",

  // What the plan assumes at apply time. Validator checks before execution.
  "preconditions": {
    "project_bound": true,
    "scene_active": false,    // we're creating, not modifying
    "bpm": 85,
    "key": "A minor"
  },

  // Sequential steps. Each step's `outputs` may be referenced by later
  // steps via `${steps.<id>.outputs.<key>}` placeholders.
  "steps": [
    {
      "id": "plan-…0.scene_create",
      "type": "scene_create",
      "label": "Create scene 'lo-fi'",
      "inputs": { "name": "lo-fi" }
    },
    {
      "id": "plan-…1.dsl_track_create",
      "type": "dsl_track_create",
      "label": "Add bass track",
      "inputs": {
        "name": "Bass",
        "role": "bass",
        "sceneId": "${steps.plan-…0.scene_create.outputs.sceneId}"
      }
    }
    // … more steps
  ],

  // How to undo on partial failure. Default is checkpoint_undo.
  // compensate_per_step uses LIFO inverse hooks instead.
  // no_rollback is for pure-read plans.
  "rollback": { "strategy": "checkpoint_undo" },

  "metadata": {
    "created_at": "2026-05-04T15:00:00.000Z",
    "created_by": "cli",        // 'cli' | 'mcp' | 'workflow'
    "tool_origin": "make_beat", // composite that emitted the plan, if any
    "plan_schema_version": 1,
    "notes": "Free-form annotations from the agent"
  }
}
```

### Plan steps reference each other via `${steps.…}`

When `dsl_track_create` needs the `sceneId` produced by `scene_create`
earlier in the plan, it refers to it by step id:

```jsonc
{
  "id": "plan-…1.dsl_track_create",
  "type": "dsl_track_create",
  "inputs": {
    "name": "Bass",
    "role": "bass",
    "sceneId": "${steps.plan-…0.scene_create.outputs.sceneId}"
  }
}
```

The executor resolves these at run time, so plans stay deterministic
even before the engine has assigned IDs.

## The PlanValidationResult shape

`sas validate` returns:

```jsonc
{
  "valid": false,
  "errors": [
    {
      // JSONPath into the offending Plan.
      "path": "$.preconditions.project_bound",
      // Stable error code — programmatic dispatch.
      "code": "missing_precondition",
      "message": "No project is bound — open or create one first.",
      // Concrete recovery — exactly what to call to unblock.
      "suggestedFix": { "tool": "list_projects", "args": {} }
    }
  ],
  "warnings": [
    {
      "path": "$.preconditions.bpm",
      "code": "bpm_drift",
      "message": "Plan asks for 90 BPM; scene is 85 BPM. Will use scene tempo."
    }
  ],
  "preview": {
    // Counts of net-new objects.
    "wouldCreate": { "scenes": 1, "tracks": 4, "clips": 4 },
    // Names/IDs modified in place.
    "wouldModify": { "tracks": [] },
    // Names/IDs deleted — high-risk.
    "wouldDelete": { "tracks": [] },
    // Aggregate risk: low ≤2 mods, no deletes; medium ≤5 mods OR creates;
    // high any delete OR ≥6 mods.
    "riskLevel": "medium",
    // Convenience flag: agents check before auto-applying.
    "requiresConfirmation": false
  }
}
```

Errors block `apply`. Warnings don't, but agents should surface them
to the user.

### Common error codes

| Code | Meaning | Typical `suggestedFix` |
|------|---------|------------------------|
| `missing_precondition` | A required `preconditions.*` flag isn't satisfied | Tool that creates the missing state (`list_projects`, `scene_activate`, …) |
| `unknown_step_type` | Step `type` not registered in ToolRegistry | None — agent should pick a different action |
| `unresolved_reference` | `${steps.…}` placeholder references a non-existent step | Reorder steps; verify ids |
| `duplicate_step_id` | Two steps share the same id | Regenerate ids; the convention is `${plan.id}.${idx}.${type}` |
| `invalid_chord` | Chord token doesn't parse via `parseChordString` | Use `Root:type` form (`C#:min`, `G:7`, …) |
| `capacity_exceeded` | Track count exceeds scene capacity (default 12) | Drop tracks or increase capacity |

## Error recovery via `suggestedFix`

The validator's `suggestedFix` is structured exactly like the Phase 3
`Remediation.mcp` shape, so an agent can pattern-match instead of
re-parsing the error message:

```bash
# Extract suggested fixes the agent would call next
sas validate /tmp/plan.json --json | jq '.data.changes.validation.errors[].suggestedFix'

# Apply the first suggested fix automatically:
FIX=$(sas validate /tmp/plan.json --json \
  | jq -c '.data.changes.validation.errors[0].suggestedFix // empty')
if [ -n "$FIX" ]; then
  TOOL=$(echo "$FIX" | jq -r .tool)
  sas "$TOOL" --json "$(echo "$FIX" | jq .args)"
  sas validate /tmp/plan.json    # re-check
fi
```

The pattern is: **read errors → apply suggested fixes → re-validate →
repeat → apply when valid**. The agent never has to guess what state
the engine needs.

## Checkpoints — the safety net

Every `apply` call auto-creates a checkpoint named
`pre-apply-<plan.id>-<timestamp>`. Override the name with
`--checkpoint <name>`. Disable with `--skip-checkpoint` (rare — use
when the caller is itself a higher-level reversible flow).

What's captured:

| Layer | What's snapshotted | Why |
|-------|--------------------|-----|
| `scenes` rows (scoped to `project_id`) | Full row | Scene structure + key + BPM |
| `tracks` / `audio_tracks` / `sample_tracks` rows | Full rows | Track inventory + role + ordering |
| MIDI clips per track | Notes payload + serialized clip | Restoring a track means restoring its clip |
| `plugin_data` rows for the project | Full | Plugin settings, samples, audio textures |
| Engine surface state per track | mute, solo, volume_db, pan, plugin_state base64 | Live-mix state |

What's **not** captured:

- Full audio bounces — they're content-addressable and survive in the
  render cache independently. To preserve a specific render before a
  checkpoint, run `sas preview` (or `render_to_performance`) first.
- Raw plugin DLL state beyond serialized form. If a plugin doesn't
  support state serialization, expect drift on restore.

Restoration is a single SQLite transaction + sequence of engine RPCs.
Total time target: <2s for typical projects (≤20 tracks). In-flight
renders are cancelled.

Checkpoints expire after 24h by default. `sas history prune` evicts
expired ones; eviction also runs at app startup.

## Where each verb fits

### Read with `inspect`

Before planning, the agent typically inspects state to ground its plan:

```bash
sas inspect project --include scenes,tracks,musical_context
```

Returns scenes, tracks, key/BPM/chord progression, and recent
checkpoints. Use this to fill in precondition fields when authoring a
plan by hand, or just to ground the agent's reasoning.

### Plan with `plan`

```bash
sas plan "make a beat" --plan-out plan.json
```

The router maps the free-text intent to a `PlanType` and dispatches to
a builder. To override the router's guess:

```bash
sas plan "add a sub bass" --type track_revise --plan-out plan.json
```

### Validate with `validate`

Always validate before `apply`. Validation is fast (no engine RPCs); it
checks schema, preconditions, idempotency-reference correctness, and
musical validity (chord tokens, etc.).

### Apply with `apply`

```bash
sas apply plan.json                        # auto-checkpoint
sas apply plan.json --checkpoint mine      # named checkpoint
sas apply plan.json --dry-run              # validate-only
sas apply plan.json --skip-checkpoint      # caller handles undo
```

Idempotent: re-running a partially-failed plan replays from the last
non-completed step. Step ids are deterministic so the executor can
resume safely.

### Hear with `preview`

```bash
sas preview                                # active scene, cache-friendly
sas preview <sceneId> --refresh            # force re-render
sas preview --track-id <trackId>           # bounce one track
```

Returns `audio.url`, `durationSeconds`, `cacheHit`, and `staleness`.
Per-track preview uses the C++ `trackIds` filter in `SceneRenderer.cpp`.

### Undo with `history undo`

```bash
sas history list                           # find a checkpoint
sas history undo <name>                    # restore
```

After undo, the project is byte-identical to the state at checkpoint
creation. Render cache entries from after the checkpoint are preserved
(content-addressable + immutable), so re-applying the same plan would
hit the cache.

## Composite tools — same loop, less typing

`compose_scene`, `add_instrument`, `play_scene`, `render_to_performance`,
and `create_transition` already follow the same pattern under the hood:
they emit a plan, validate it, auto-checkpoint, apply, and report.

Use composites when the workflow is well-trodden. Drop down to the
plan loop when:

- The agent needs to **show the user what it's about to do** before
  doing it.
- The agent needs to **edit a plan mid-flight** (e.g., swap one step's
  inputs).
- The agent is **iterating** ("preview, then revise, then preview
  again").
- The composite doesn't fit and you'd otherwise be writing 5+ shell
  lines.

## See also

- **[CLI reference](./cli-reference.md)** — full flag reference for
  every plan verb.
- **[Worked examples](./examples.md)** — runnable shell scripts
  including the plan loop.
- **[For agents](./for-agents.md)** — integration notes for Claude
  Code, OpenClaw, Cursor, and HTTP-direct.
- Source-of-truth Plan schema: [`agent-plan.ts`][types] in the S&S repo.

[types]: https://github.com/shiehn/sas-platform/blob/main/sas-assistant/src/shared/types/agent-plan.ts
