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

Arrangement releases while 1.1.0 is current:
- **0.11.0** (2026-10-10): alternatives groups (a vocal reading's takes, a kit's fills) play one
  unit per section, by the section's position or picked; the others rest. A scene's fills,
  which played in every section, now rotate. The format didn't change; `arrangementHash`
  changes for arrangements with groups, because what plays changed. See
  [Alternatives (takes)](/contract/arrangement-export/#alternatives-takes).

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
