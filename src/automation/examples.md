---
sidebar: auto
title: Worked examples
---

# Worked examples

Real shell scripts an AI agent (or you) can run to drive Signals & Sorcery.
Each example is self-contained — copy/paste and go.

## 1. Compose a chill lo-fi beat

The simplest path: one `compose_scene` call.

```bash
#!/bin/bash
set -e

sas compose_scene \
  --description "chill lo-fi hip hop beat at 85 bpm, A minor" \
  --scene-name "Verse" \
  --json '{
    "tracks": [
      {"name": "Bass",  "role": "bass",  "prompt": "deep, slow, jazz-inflected"},
      {"name": "Drums", "role": "drums", "prompt": "laid-back, swung 16ths"},
      {"name": "Keys",  "role": "chords","prompt": "sparse jazzy Rhodes"},
      {"name": "Pad",   "role": "pad",   "prompt": "soft, wide, background"}
    ]
  }' --pretty

sas play_scene --scene-name "Verse"
```

## 2. Build a verse + chorus + transition

Compose two scenes, then a transition that bridges them.

```bash
#!/bin/bash
set -e

# Verse
sas compose_scene \
  --description "mellow verse groove" \
  --scene-name "Verse" \
  --json '{"tracks":[
    {"name":"Bass","role":"bass","prompt":"sub bass, sparse"},
    {"name":"Drums","role":"drums","prompt":"minimal kick+hat"},
    {"name":"Keys","role":"chords","prompt":"ambient pad chords"}
  ]}'

# Chorus — energetic, same key
sas compose_scene \
  --description "energetic chorus, same key, bigger sound" \
  --scene-name "Chorus" \
  --json '{"tracks":[
    {"name":"Bass","role":"bass","prompt":"driving moving line"},
    {"name":"Drums","role":"drums","prompt":"full kit, punchy"},
    {"name":"Keys","role":"chords","prompt":"piano stabs"},
    {"name":"Lead","role":"lead","prompt":"catchy hook melody"}
  ]}'

# Transition
sas create_transition --from-scene "Verse" --to-scene "Chorus" --bars 2

# Play them in order: verse → transition → chorus
sas scene_activate --scene-id Verse
sas dsl_play
sleep 16 # let verse breathe
sas scene_activate --scene-id Chorus
sas dsl_play
```

## 3. Add one instrument to the current scene

Common iterative workflow — the agent doesn't need to rebuild the whole
scene, just add one part.

```bash
sas add_instrument \
  --name "Sub Bass" \
  --role "bass" \
  --prompt "thick sub, A minor, follow the root notes" \
  --bars 8
```

## 4. Apply reverb to everything

Batch FX across every track in the active scene.

```bash
sas set_scene_fx \
  --category reverb \
  --enabled \
  --preset 3 \
  --dry-wet 0.35
```

If some tracks fail, `set_scene_fx` returns `success: true` with a
`failed` array listing which tracks errored — the agent can then retry
those individually with `dsl_set_track_fx`.

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

## 6. Search & use a sample from the library

```bash
# Find a breakbeat at 136 BPM in A minor
MATCH=$(sas search_samples \
  --query "breakbeat" \
  --bpm 136 \
  --key "A minor" \
  --limit 1 \
  | jq -r '.changes.samples[0].id // empty')

if [ -n "$MATCH" ]; then
  # Drop it into the active scene
  sas add_sample_track --sample-id "$MATCH"
else
  echo "No matching sample found — importing from disk"
  sas import_samples --paths "/tmp/amen.wav"
fi
```

## 7. Stream events while an agent works

Watch what the agent is doing in real time from another terminal.

```bash
# Terminal A (an agent is running some workflow)
sas compose_scene --scene-name "Verse" --description "lo-fi" --json '{...}'

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
track:created: {"sceneId":"abc","trackId":"t2","displayName":"Drums","role":"drums","kind":"synth"}
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
      --json '{"tracks":[...]}' 2>/dev/null; then
    break
  fi
  echo "attempt $attempt failed, retrying..."
  sleep 2
done
```

Same `idempotency-key` means the first successful response is cached
(60s, per-project) — subsequent attempts during that window return the
cached success without re-executing.

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
  --json '{"tracks":[
    {"name":"808","role":"bass","prompt":"deep dark 808 with slides"},
    {"name":"Hats","role":"drums","prompt":"fast triplet hats"},
    {"name":"Kick","role":"drums","prompt":"trap kick pattern"},
    {"name":"Lead","role":"lead","prompt":"ominous brass stabs"}
  ]}'

# 2. Tweak the mix
sas dsl_set_track_fx --track "808" --category compressor --enabled --preset 4 --dry-wet 0.6
sas set_scene_fx --category reverb --enabled --preset 2 --dry-wet 0.2

# 3. Send to main output
sas render_to_performance --scene-name "Drop"

# 4. Optionally export
sas export_audio --output "~/Desktop/drop.wav" --scene-name "Drop"
```

That's a multi-step composition → mix → perform → archive pipeline. Every
line is one `sas` call. An agent would write this same script when asked
to "make a trap drop and send it to the main speakers, then save it."
