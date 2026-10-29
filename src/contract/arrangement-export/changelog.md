---
sidebar: auto
title: Arrangement export changelog
description: What changed in the Signals & Sorcery arrangement export format, version by version.
---

# Changelog: the arrangement export

Format versions (`exportVersion`), newest first. Each lists what changed for a reader.
Releases of Signals & Sorcery's arrangement semantics (`contractVersion`) are listed under the
format version that was current then, with what they changed in an export's audio or meaning,
or "nothing".

## 1.4.0

Optional fields only, present only when the song has words or roles, so 1.0–1.3 readers keep
working on every export.

Added:
- `score.sections[].lyrics.lines`: the words sung in each section, one line per phrase. When the
  song has words every section carries them, and an instrumental section has `[]`. A repeated
  chorus carries its words in full. See [Lyrics](/contract/arrangement-export/#lyrics).
- `score.sections[].role` is filled: the section's part in the song form (`verse`, `chorus`,
  `bridge` …), free text, lower-case. It was reserved and always absent before.
- `lyricsHash`: SHA-256 of the lyrics payload (each section's words by id), present with
  words. `timingHash`, `arrangementHash` and `scoreHash` leave the words out.
- The schema for 1.4.0, where `role` must be non-empty; `v1/schema.json` is now 1.4.0.

Changed: nothing for a song without words or roles, hashes included. A file whose sections
carry a `role` has a different `scoreHash`, since that payload always covered the role.

Arrangement releases while 1.4.0 was current: none yet (0.14.0 still).

## 1.3.0

Optional fields only, present only when a song has pickup bars, so 1.0–1.2 readers keep working
on every other export.

Added:
- `arrangement.pickup`: bars before the first section's downbeat that lead in to it, from frame
  0. See [Pickup bars](/contract/arrangement-export/#pickup-bars).
- `score.pickup`, and spans in section `"pickup"`. With pickup bars, song bars before 1 (0, −1 …)
  appear in `score.bars`, `tempoMap` and `meterMap`, and a span's `startBar` can be 0 or below.
- The timing payload's `pickup` (only with pickup bars; `timingHash` covers it), and pickup runs
  (section `"pickup"`) in the arrangement payload.
- The schema for 1.3.0; `v1/schema.json` is now 1.3.0.

Changed: nothing for a song without pickup bars. With them, `instances[0].startFrame` is the
pickup's length, not 0.

Arrangement releases while 1.3.0 was current:
- **0.14.0**: songs can start on pickup bars (above). Arrangements without them export exactly as
  before, hashes included.

## 1.2.0

Optional fields only, so 1.0 and 1.1 readers keep working.

Added:
- `score`: the arrangement resolved for a reader. It holds:
  - the tempo map, the meter map and the bar grid;
  - the sections with their scenes;
  - per layer: its role, bucket and drum piece, where it sounds (spans with level and fades),
    the effects placed on it, and, when asked, its notes in frames.

  See [Score](/contract/arrangement-export/#score).
- `scoreHash`: SHA-256 of the score's payload. It changes with what the layers play, notes
  included. See [Change detection](/contract/arrangement-export/#change-detection).
- `options.score` and `options.scoreNotes`: whether the export wrote the score, and whether the
  score includes the notes.
- The schema for 1.2.0, and `v1/schema.json`: the latest 1.x, which every 1.x file validates
  against.

Changed: nothing. `timingHash` and `arrangementHash` cover exactly what they did.

Arrangement releases while 1.2.0 was current:
- **0.13.0** (2026-10-24): every clip can have its own fades and level. A fade on one pasted copy
  of a clip no longer moves the others. The format didn't change: a run that a clip's own fade or
  level cuts inside a section is simply two runs, butt-joined, each with its own `fadeIn` /
  `fadeOut` and level, and `arrangementHash` covers them as it covers any run. Arrangements
  without clip settings export exactly as before, hashes included.
- **0.12.0** (2026-10-20): audio regions can be trimmed, cut, copied and pasted by the beat (the
  meter's beat: eighths in 6/8), not only by the bar. The format didn't change. A score span or
  run that starts or stops inside a bar keeps the bars it touches (`startBar` is the bar it
  starts in, `endBar` the bar after the one it ends in); its `startFrame` / `endFrame` say
  exactly where inside them. `arrangementHash` covers that: such a run carries
  `enterInsetBeats` / `exitInsetBeats` in the arrangement payload. Arrangements without beat
  edits export exactly as before, hashes included.
- **0.11.1** (2026-10-18): a layer that jumps to another loop position where one section meets
  the next (a pasted run, or a phase change on the section's first bar) now plays from that
  position. It used to keep the earlier position's sample offset, which put its loop seams in
  the wrong place, and some such arrangements could not be played or exported at all. The
  format didn't change. The audio of those arrangements changes.

## 1.1.0

Optional fields only, so a 1.0 reader keeps working.

Added:
- `$schema`: the exact schema version's URL.
- `exportVersion`: this format's version.
- `exportId`: a UUID per export.
- `arrangement.revision` `{seq, docHash}`: which edit of the arrangement the export was made
  from.
- `arrangement.endFrame`: the last bar's end, in `sampleRate` frames.
- `timingHash`, `arrangementHash`: one comparison tells a re-timing from a re-arrangement from a
  re-render. See [Change detection](/contract/arrangement-export/#change-detection).
- `files[].layerIds`: the layers a stem carries.
- `files[].startFrame` (always 0) and `files[].latencyMs` (known uncompensated latency, 0).
- `options.pathFree`: leave every absolute path out. `options.destination` and
  `master.input.path` / `master.output.path` become optional in the schema (absent with
  `pathFree`).

Changed:
- `files[].file` always uses `/` as its separator. It used the operating system's.

Documented for the first time (no behaviour change): [the specification](/contract/arrangement-export/), the JSON Schemas for 1.0.0 and
1.1.0, and fixtures for every rule in SPEC.md.

Arrangement releases while 1.1.0 was current:
- **0.11.0** (2026-10-10): alternatives groups (a vocal reading's takes, a kit's fills) play one
  unit per section, by the section's position or picked; the others rest. A scene's fills,
  which played in every section, now rotate. The format didn't change; `arrangementHash`
  changes for arrangements with groups, because what plays changed. See [Alternatives (takes)](/contract/arrangement-export/#alternatives-takes).

## 1.0.0 (2026-10-04)

The first versioned shape. Compared with the exports before it:
- Added the top-level `name`: the export's name, and the base of its folder and file names.
- `tail` gained `mode`: `{mode: "auto", capSeconds, floorDbfs}` or `{mode: "fixed", seconds}`.
- `options` gained `name` and `tail`.

Arrangement releases while 1.0.0 was current:
- **0.10.0** (2026-10-08): the Arrange view's row order is saved with the arrangement. It is
  view state, so nothing in an export changes.
- **0.9.0** (2026-10-08): scene gains ("Normalize kick levels"). A scene's gain now adds to
  every lane of its layers wherever they play, so exported levels follow it. The format didn't
  change.
- **0.8.0** (2026-10-02, already current when 1.0.0 began): mute and solo in the arrangement.
  A silenced layer is left out of the mix and the master, and gets no stem.

## Before 1.0.0 (2026-09-29 to 2026-10-03, unversioned)

- No top-level `name`. `tail` was `{capSeconds, floorDbfs}` (always automatic). `options` had
  no `name` or `tail`. These files don't validate against the 1.0.0 schema. Read their tail as
  `mode: "auto"`.
- Changes in meaning during that period:
  - placed effects and exact run edges rendered into the audio (2026-09-29);
  - arrangement audio no longer silent at tempos where a beat isn't a whole number of frames
    (0.7.1, 2026-10-02);
  - silenced layers get no stem, and only the arrangement's own mute and solo count
    (2026-10-02 and 10-03).

---

The format itself: [Arrangement export format](/contract/arrangement-export/). The source:
[github.com/shiehn/sas-arrangement-export-contract](https://github.com/shiehn/sas-arrangement-export-contract).
