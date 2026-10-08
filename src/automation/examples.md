---
sidebar: auto
title: Worked examples
---

# Worked examples

Real shell scripts an agent (or you) can run to drive Signals & Sorcery.
Each example is self-contained: copy/paste and go.

## 1. Compose a chill lo-fi beat

The simplest path: one `compose_scene` call.

```bash
#!/bin/bash
set -e

sas compose_scene \
  --description "chill lo-fi hip hop beat at 85 bpm, A minor" \
  --scene-name "Verse" \
  --tracks '[
    {"name": "Bass",  "role": "bass",  "prompt": "deep, slow, jazz-inflected"},
    {"name": "Kick",  "role": "kicks", "prompt": "laid-back, swung 16ths"},
    {"name": "Keys",  "role": "keys","prompt": "sparse jazzy Rhodes"},
    {"name": "Pad",   "role": "pads",   "prompt": "soft, wide, background"}
  ]'

sas play_scene --scene-name "Verse"
```

## 2. Build a verse + chorus + transition

Compose two scenes, then a transition scene that bridges them.

```bash
#!/bin/bash
set -e

# Verse
sas compose_scene \
  --description "mellow verse groove" \
  --scene-name "Verse" \
  --tracks '[
    {"name":"Bass","role":"bass","prompt":"sub bass, sparse"},
    {"name":"Kick","role":"kicks","prompt":"minimal, steady"},
    {"name":"Keys","role":"keys","prompt":"ambient pad chords"}
  ]'

# Chorus: energetic, same key
sas compose_scene \
  --description "energetic chorus, same key, bigger sound" \
  --scene-name "Chorus" \
  --tracks '[
    {"name":"Bass","role":"bass","prompt":"driving moving line"},
    {"name":"Kick","role":"kicks","prompt":"punchy four-on-the-floor"},
    {"name":"Keys","role":"keys","prompt":"piano stabs"},
    {"name":"Lead","role":"lead","prompt":"catchy hook melody"}
  ]'

# Transition: a 2-bar bridge scene in the chorus's key. It starts empty
# (contract only) and becomes the active scene, so give it a part.
sas create_transition_scene --from-scene "Verse" --to-scene "Chorus" --bar-length 2
sas add_instrument --name "Swell" --role "pads" --prompt "rising swell into the chorus"

# Audition them one after another
sas scene_activate --scene-id Verse
sas dsl_play
sleep 16 # let verse breathe
sas scene_activate --scene-id Chorus
sas dsl_play

# To lay them out as a song, use Arrange mode (example 15).
```

## 3. Add one instrument to the current scene

Common iterative workflow: the agent doesn't need to rebuild the whole
scene, just add one part.

```bash
sas add_instrument \
  --name "Sub Bass" \
  --role "bass" \
  --prompt "thick sub, A minor, follow the root notes" \
  --bars 8
```

## 4. Apply reverb to everything

FX are 3rd-party VST3/AU inserts on each track's rack, so a scene-wide
effect is a per-track loop: list the tracks, then add the same reverb
plugin to each one.

```bash
#!/bin/bash

FAILED=()
for TRACK in $(sas dsl_list_tracks --json | jq -r '.data.changes.tracks[].id'); do
  sas fx_add_plugin --track "$TRACK" --plugin-id "VST3/ValhallaSupermassive" \
    && sas dsl_fx_set_param --track "$TRACK" --fx reverb --param-name wet --value 0.35 \
    || FAILED+=("$TRACK")
done

[ ${#FAILED[@]} -gt 0 ] && echo "FX failed on: ${FAILED[*]}"
```

Each `fx_add_plugin` call succeeds or fails independently, so one bad
track doesn't abort the batch: the script collects failures and reports
them at the end. Each failure envelope carries a `remediation` block
saying why that track bounced, so the agent can retry the stragglers
individually.

## 5. Export a scene as WAV

Render the scene offline and save to a user-specified path.

```bash
sas export_audio \
  --output "~/Desktop/my-beat.wav" \
  --scene-name "Verse"

# With overwrite
sas export_audio \
  --output "~/Desktop/my-beat.wav" \
  --overwrite
```

Path tilde is expanded; `.wav` is auto-appended if missing.

To export **one track** on its own, use `export_track_audio`. It renders only
that track, from its own scene (not necessarily the active one), at that
scene's length and time signature, with the track's fader, pan and effects:

```bash
JOB=$(sas run export_track_audio -p track=Bass -p output=~/Desktop/bass.wav --json \
  | jq -r '.data.changes.jobId')
sas job wait "$JOB" --timeout 300
```

Like `export_audio`, it writes a file outside the app, so the app asks you to
approve it first.

## 6. Search & use a sample from the library

```bash
# Find a breakbeat at 136 BPM in A minor
MATCH=$(sas search_samples \
  --query "breakbeat" \
  --bpm 136 \
  --key "A minor" \
  --limit 1 \
  --json \
  | jq -r '.data.changes.samples[0].id // empty')

if [ -n "$MATCH" ]; then
  # Drop it into the active scene
  sas add_sample_track --sample-id "$MATCH"
else
  echo "No matching sample found, importing from disk"
  sas import_samples --paths "/tmp/amen.wav"
fi
```

## 7. Stream events while an agent works

Watch what the agent is doing in real time from another terminal.

```bash
# Terminal A (an agent is running some workflow)
sas compose_scene --scene-name "Verse" --description "lo-fi" --tracks '[...]'

# Terminal B (human watching)
sas events stream | jq -r '
  select(.event == "domainEvent")
  | .data
  | "\(.type): \(.payload | tostring)"
'
```

Typical output:

```
scene:created: {"sceneId":"abc","name":"Verse"}
track:created: {"sceneId":"abc","trackId":"t1","displayName":"Bass","role":"bass","kind":"synth"}
track:midi-written: {"trackId":"t1","noteCount":16}
track:created: {"sceneId":"abc","trackId":"t2","displayName":"Kick","role":"kicks","kind":"synth"}
track:midi-written: {"trackId":"t2","noteCount":32}
...
```

## 8. Idempotent retry on a flaky call

```bash
KEY="compose-$(date +%s)"

for attempt in 1 2 3; do
  if sas compose_scene \
      --idempotency-key "$KEY" \
      --description "lo-fi" \
      --scene-name "Verse" \
      --tracks '[...]' 2>/dev/null; then
    break
  fi
  echo "attempt $attempt failed, retrying..."
  sleep 2
done
```

Same `--idempotency-key` means the first successful
response is cached (60 s, per project); subsequent attempts with the same
parameters during that window return the cached success without
re-executing.

## 9. Discover a deferred tool and use it

```bash
# The agent wants to export, but export_audio isn't in its default tool list.
sas tool_search --query "export wav" --limit 3

# Top match: { name: "export_audio", ... }
# Read its full help to understand parameters:
sas help export_audio

# Now call it:
sas export_audio --output ~/Desktop/x.wav
```

## 10. Full compose → render-for-performance pipeline

```bash
#!/bin/bash
set -e

# 1. Create the scene
sas compose_scene \
  --description "dark trap banger" \
  --scene-name "Drop" \
  --tracks '[
    {"name":"808","role":"bass","prompt":"deep dark 808 with slides"},
    {"name":"Hats","role":"hats","prompt":"fast triplet hats"},
    {"name":"Kick","role":"kicks","prompt":"trap kick pattern"},
    {"name":"Lead","role":"lead","prompt":"ominous brass stabs"}
  ]'

# 2. Tweak the mix. FX are 3rd-party inserts; plugin ids come from your scan
sas fx_add_plugin --track "808" --plugin-id "VST3/TDR Kotelnikov"          # compressor
sas fx_add_plugin --track "Lead" --plugin-id "VST3/ValhallaSupermassive"   # reverb
sas dsl_fx_set_param --track "Lead" --fx reverb --param-name wet --value 0.2

# 3. Render it offline and play the baked loop
sas render_to_performance --scene-name "Drop"

# 4. Optionally export
sas export_audio --output "~/Desktop/drop.wav" --scene-name "Drop"
```

That's a multi-step composition → mix → perform → archive pipeline. Every
line is one `sas` call. An agent would write this same script when asked
to "make a trap drop, play it, then save it."

## 11. Plan-as-artifact loop with undo

When a change is non-trivial or the agent might want to revert, drive
S&S through the [plan-as-artifact loop](./plan-loop.md). One round-trip
produces a typed Plan; another applies it with an auto-checkpoint; a
third reverts it byte-for-byte if you don't like the result.

```bash
#!/bin/bash
set -e

PLAN=/tmp/lofi.plan.json
CKPT=pre-lofi-experiment

# 1. Ground in current state.
sas inspect project --json | jq '.data.changes | {scenes, tracks: (.tracks // []) | length}'

# 2. Emit a typed Plan from the intent.
sas plan "make a chill 4-bar lo-fi beat in A minor at 85 BPM" \
  --plan-out "$PLAN"

# 3. Sanity-check the plan against current state.
#    Errors come back with `suggestedFix`, the exact tool to call to
#    unblock. Exit 1 = invalid; exit 0 = valid.
sas validate "$PLAN" || {
  echo "Validation failed; attempting suggested fix"
  FIX=$(sas validate "$PLAN" --json \
    | jq -c '.data.changes.validation.errors[0].suggestedFix // empty')
  if [ -n "$FIX" ]; then
    TOOL=$(echo "$FIX" | jq -r .tool)
    sas run "$TOOL" --json-body "$(echo "$FIX" | jq -c .args)"
    sas validate "$PLAN"
  fi
}

# 4. Apply with a named checkpoint we can roll back to.
sas apply "$PLAN" --checkpoint "$CKPT"

# 5. Hear it.
URL=$(sas preview --json | jq -r '.data.changes.audio.url')
echo "Preview at: $URL"

# 6. Don't like it? Revert.
# sas history undo "$CKPT"
```

## 12. Validate before apply (CI-friendly)

Useful in scripts and CI: emit a plan, validate it, branch on the
result, only apply when valid.

```bash
#!/bin/bash
PLAN=/tmp/plan.json
sas plan "add a sub bass track" --type track_revise --plan-out "$PLAN"

if sas validate "$PLAN"; then
  echo "Plan is valid, applying"
  sas apply "$PLAN"
else
  echo "Plan invalid, agent should re-prompt"
  sas validate "$PLAN" --json | jq '.data.changes.validation.errors'
  exit 1
fi
```

`sas validate` returns exit `1` on invalid plans (vs exit `2` for bad
input), so `set -e` scripts branch correctly.

## 13. Per-track preview + revise iteration

Bounce one track in isolation, listen, decide whether to revise it, and
roll back through a named checkpoint if the revision misses.

```bash
#!/bin/bash
set -e

TRACK_ID=$(sas inspect scene --json | jq -r '.data.changes.tracks[] | select(.name=="Bass").id')

# 1. Bounce just the bass track (uses the C++ trackIds filter).
sas preview --track-id "$TRACK_ID" --json | jq '.data.changes.audio'

# 2. Save a checkpoint, then plan + apply a revision.
sas history checkpoint pre-bass-revise --notes "before darkening bass"

sas plan "make the bass darker and more sparse" --type track_revise \
  --plan-out /tmp/bass.plan.json
sas apply /tmp/bass.plan.json --skip-checkpoint   # we already saved one

# 3. Re-bounce the bass to compare.
sas preview --track-id "$TRACK_ID" --refresh --json | jq '.data.changes.audio'

# 4. If it's worse, undo.
# sas history undo pre-bass-revise
```

`--skip-checkpoint` is appropriate when the caller has already saved
its own recovery point. Most flows should let `apply` create one
automatically.

## 14. Pipe `plan` straight into `apply` without a temp file

```bash
sas plan "make a chill lofi beat" --json \
  | jq '.data.changes.plan' \
  | sas apply -

# Or with validate in between:
sas plan "make a chill lofi beat" --json | jq '.data.changes.plan' > /tmp/p.json
sas validate /tmp/p.json && sas apply /tmp/p.json
```

`apply` and `validate` both treat `-` as stdin, so plans never need to
hit disk if the agent doesn't want them to.

## 15. Arrange a song from your scenes

The user says: *"Put the chorus twice after the verse, and mute the kick
in the second chorus."*

This drives [Arrange mode](/arrange/) through the
[arrangement tools](./for-agents.md#arrangement-tools). The two choruses
must be **independent** copies: the second one differs (no kick), and a
linked copy would change both.

```bash
#!/bin/bash
set -e

# 0. Build the project's arrangement. The first time, it is created with
#    every scene once, in scene order, all layers on. Async: wait for it.
JOB=$(sas arrangement start --json | jq -r '.data.changes.jobId')
sas job wait "$JOB" --timeout 600

# 1. Where is the verse, and what follows it?
sas arrangement get --json > /tmp/arr.json
VERSE=$(jq '[.data.changes.instances[] | select(.sceneName == "Verse")][0].index' /tmp/arr.json)
NEXT=$(jq -r --argjson i $((VERSE + 1)) \
  '.data.changes.instances[] | select(.index == $i) | .sceneName' /tmp/arr.json)

# 2. A chorus right after the verse (unless one is already there; a fresh
#    drop plays every layer), then an independent copy right after it.
if [ "$NEXT" != "Chorus" ]; then
  sas arrangement insert --scene "Chorus" --index $((VERSE + 1))
fi
sas arrangement duplicate-section --index $((VERSE + 1))

# 3. Mute the kick in the second chorus. Sections and layers take names.
sas arrangement layer --instance "the second chorus" --track "Kick" --play off

# 4. Listen.
sas arrangement play
```

Every edit returns the new timeline, for example:

```text
#0 Verse (8 bars)
#1 Chorus (1) (8 bars)
#2 Chorus (2) (8 bars)
#3 Bridge (4 bars)
```

Every step is undoable, one at a time, with `sas arrangement undo` or ⌘Z in
the app. By default the whole song loops; to hear only the new part, set the
loop to it: `sas arrangement loop-set --instance "Chorus (2)"`
(`sas arrangement loop-set --whole` goes back). To silence the kick for the
whole song instead of one section, mute its track:
`sas arrangement mute --track Kick --muted`.

**Without a shell** (an MCP client), the same steps are `sas_run` calls:
`arrangement_start` → `sas_wait_for_job {jobId}` → `arrangement_get` →
`arrangement_insert_instance {scene: "Chorus", index}` →
`arrangement_duplicate_instance {index}` →
`arrangement_set_layer {instance: "the second chorus", track: "Kick", play: "off"}` →
`arrangement_play`.

If the `sas arrangement` group is missing, run `sas refresh` once (the
group is generated from the app's tool list). `sas run arrangement_get`
works either way.

## 16. Add an effect to one bar

The user says: *"Add a reverse on the bass in bar 4 of the second chorus."*

```bash
sas arrangement treatment --instance "the second chorus" --track "Bass" \
  --type reverse_bar --bar 4
```

The result carries the new `treatmentId`. The effect plays once its render
is ready (the app renders placed effects and caches them). To take it out
again:

```bash
sas arrangement untreat --instance "the second chorus" --track "Bass" --bar 4
```

Effects with settings take a `params` object as JSON. A four-bar high-pass
sweep on the drums leading out of the last chorus:

```bash
sas arrangement treatment --instance "the last chorus" --track Drums \
  --type hp_sweep --bar 5 --bars 4 --params '{"end_hz": 2000}'
```

`sas help arrangement_place_treatment` lists every effect type with its
settings, ranges and defaults.

## 17. Copy a part from one section to another

The user says: *"Copy the kick in the first chorus to the second chorus."*

The clipboard tools take objects as JSON:

```bash
# Copy the kick's bars in the first chorus...
sas arrangement copy --region '{"instance": "the first chorus", "track": "Kick"}'

# ...and paste them at bar 1 of the second chorus.
sas arrangement paste --at '{"instance": "the second chorus", "bar": 1}'
```

The pasted bars land on the **Kick** lane (tracks never leave their lane)
and **replace** what the kick played there, with the same loop bars, fades,
gain and effects as the original. If the second chorus belongs to another
scene, the kick plays there as a guest through its own scene's bus.

To copy one clip instead of the whole section's worth of bars, pass
`--clip '{"track": "Kick", "instance": "the first chorus"}'`. To silence
bars without shortening the song, use `sas arrangement silence`
(`arrangement_delete_region`).

## 18. Export the song

Render the arrangement offline: the Mix, a streaming Master at 44.1 kHz,
one stem per panel, and an Ableton hand-off, named "Night Drive Bounce".

```bash
JOB=$(sas arrangement export --stems --ableton --preset streaming \
  --sample-rate 44100 --name "Night Drive Bounce" --json | jq -r '.data.changes.jobId')
sas job wait "$JOB" --timeout 900
```

Exporting writes files that no undo can take back, so the app asks you to
**approve** it before it starts. If you decline, the call fails with
`approval_denied`.

The files land in a new folder named after the export and the date and
time, such as `Night Drive Bounce 2026-10-04 1530`, under
`~/Music/Signals & Sorcery Exports` (pass `--path` for another place).
Without `--name`, the export takes the project's last export name, else the
project's name followed by "Bounce". An export never overwrites an earlier
one: the same name in the same minute gets `(2)`, `(3)`. Every file runs
until the sound dies away, for up to 10 seconds past the song; pass
`--tail 2` to end every file exactly 2 seconds after it instead (0 to 30).
The export follows what you
hear: a track you muted (or left out by soloing others) in the arranger gets
no stem, and the Ableton hand-off brings it in as a muted track. The finished job lists every
file, the loudness report (integrated loudness, loudness range, true peak,
gain reduction) for the Mix and the Master, the stems null test, and any
warnings. `sas arrangement export-cancel` stops a running export and
removes its folder. See [Exporting your song](/arrange/#exporting-your-song)
for what each file is.

## 19. Even out the kick across the song

The user says: *"The kick is louder in the chorus than in the verse. Even it
out."*

`arrangement_normalize_kick_levels` is the arranger's **Normalize kick levels**
button. Run it as a dry run first to see what it would do, then for real:

```bash
#!/bin/bash
set -e

# 1. Dry run: measure every scene's kick, change nothing.
JOB=$(sas arrangement normalize-kicks --apply false --json | jq -r '.data.changes.jobId')
sas job wait "$JOB" --timeout 300 --json \
  | jq '.data.result.changes | {status, summary, scenes: [.scenes[] | {scene, basis, kick_lufs, gain_db, flag}]}'

# 2. Apply it, leaving the intro exactly as it is.
JOB=$(sas arrangement normalize-kicks --exclude Intro --json | jq -r '.data.changes.jobId')
sas job wait "$JOB" --timeout 300
```

Each scene gets one level, so its kick hits as hard as in every other scene with
a clear kick; scenes without one are matched on overall loudness
(`"basis": "overall"`). The whole change is one undo step: `sas arrangement undo`
takes it back. Running it again replaces the previous match instead of adding to
it.

If it fails because a stem needs rendering while the song plays, stop playback
(`sas arrangement stop`) and run it again. To set one scene's level by hand
instead, use `arrangement_set_scene_gain`:

```bash
sas run arrangement_set_scene_gain -p scene=Chorus -p gainDb=-2
```

A later match replaces a hand-set level, unless that scene is in `--exclude`.
