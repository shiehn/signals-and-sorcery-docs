---
sidebar: auto
title: Arrangement export format
description: The published, versioned format of a Signals & Sorcery arrangement export. A visual tool, a game engine or an analysis script can read an export's JSON and line its work up with the music, to the bar. Specification, JSON Schemas, fixtures and changelog, MIT licensed.
---

# Arrangement export format

When you export a song from [Arrange mode](/arrange/#exporting-your-song), Signals & Sorcery
writes a folder of audio files plus one JSON file, `<name> - export.json`, that describes them:
the song's tempo, its sections down to the audio frame, which layers play where, and every
file. That JSON is a **published, versioned format**. A visual tool, a game engine or an
analysis script can read an export and cut, animate or analyse to the bar, without opening the
project file and without knowing how the app works inside.

- **Current version:** 1.1.0
- **JSON Schemas:** [1.1.0](/contract/arrangement-export/1.1.0/schema.json), [1.0.0](/contract/arrangement-export/1.0.0/schema.json), and [v1](/contract/arrangement-export/v1/schema.json), which is always the latest 1.x (today 1.1.0)
- **Changelog:** [what changed, version by version](/contract/arrangement-export/changelog.html)
- **Source:** [github.com/shiehn/sas-arrangement-export-contract](https://github.com/shiehn/sas-arrangement-export-contract), with the specification, the schemas and the fixtures
- **Licence:** MIT, for everything in the contract: the specification, the schemas and the fixtures

Each schema is served at the URL in its `$id`, the same URL an export carries in `$schema`, so
a validator can fetch it directly. `v1/schema.json` is a copy of the latest 1.x schema, so its
`$id` names that version.

## Get an export

- **In the app:** **Export…** in the arranger header. See [Exporting your song](/arrange/#exporting-your-song).
- **From an agent or a script:** `arrangement_export`, or `sas arrangement export`. See [Undo and export](/automation/for-agents.html#undo-and-export). Add `pathFree` (`--path-free`) to leave every absolute path out of the file (see [Privacy](#privacy)).

## The specification, format 1.x

An arrangement export is a folder of audio files plus one JSON file, `<name> - export.json`,
that describes them: the song's tempo and sections in audio frames, the files, and how they
were made. This document says what every part of that JSON means, so a consumer (a visual
tool, a game engine, an analysis script) can read an export without opening the project file
that made it.

- The JSON Schemas: [1.1.0](/contract/arrangement-export/1.1.0/schema.json), [1.0.0](/contract/arrangement-export/1.0.0/schema.json), [v1](/contract/arrangement-export/v1/schema.json) (the latest 1.x). One per format version.
- What changed and when: [the changelog](/contract/arrangement-export/changelog.html).
- Fixtures that prove each rule below through Signals & Sorcery's own arrangement code:
  linked from each rule, and all in the [contract repository](https://github.com/shiehn/sas-arrangement-export-contract).

Everything here is stated from the code that writes and plays the export, not from listening.

---

## Versions

- `schema` is always `"sas-arrangement-export/1"`. It names the format family.
- `exportVersion` is the format's own [semantic version](https://semver.org). A file without
  it is `1.0.0`; files written to this document carry `1.1.0`.
  - A **patch** clarifies wording only.
  - A **minor** adds optional fields; a reader for an older minor keeps working.
  - A **major** removes a field or changes a meaning. It is announced in the changelog first.
- `$schema` (1.1) is the URL of the exact schema version the file was written against, e.g.
  [`https://signalsandsorcery.com/contract/arrangement-export/1.1.0/schema.json`](/contract/arrangement-export/1.1.0/schema.json).
  This site serves every version's schema at its URL.
- `contractVersion` is the version of Signals & Sorcery's internal arrangement semantics the
  export was made under. It is **informational**: it moves for internal changes that never
  touch this format. Use `exportVersion` to decide whether you can read a file.

A reader should accept every `1.x` file whose minor is at least the one it knows, ignore
properties it doesn't know, and refuse a major it doesn't know.

---

## The bundle

One export makes one folder, `<name> <YYYY-MM-DD HHMM>` (local time), with ` (2)`, ` (3)` …
added when a folder of that name already exists. Inside it:

| File | When |
|---|---|
| `<name> - export.json` | always (this document) |
| `<name> - Master (<Preset> <LUFS> LUFS, <bit depth>[, <rate> kHz]).wav` | when a master was asked for |
| `<name> - Mix (32f).wav` | when the unmastered mix was asked for |
| `Stems/NN <label>.wav` | stems: one per mix bus ("Drums"), then one per layer outside any bus ("Kick (verse)") |
| `Editable stems/NN <label>.wav` | editable stems |

`files[]` lists every audio file the export kept, with its bundle-relative path (`file`), its
SHA-256, its length in frames (in its **own** sample rate), its rate, bit depth and peak.
Find a file by `kind` and `sha256`, not by its name: a user may rename it.

Plugin states, notes and the project's other data are never in the export.

---

## Timing

**Every frame number in the JSON is at the top-level `sampleRate`**, except `files[].frames`,
which is in that file's own rate.

The tempo is `project.bpm`, in quarter notes per minute, constant over the song. A beat is a
quarter note. For a position `beat` quarter notes after the song start:

```
frame(beat) = floor(beat × 60 × sampleRate / bpm + 0.5)
```

A section's `startFrame` is `frame` of its first downbeat, and its `lengthFrames` is
`frame(its end) − frame(its start)`. Sections are therefore contiguous. Rounding is done on the
song's absolute grid, so it never accumulates. `arrangement.endFrame` (1.1) is `frame` of the
last bar's end.

A bar holds `numerator × 4 / denominator` quarter notes of its section's meter: 4 in 4/4, 3 in
3/4, 3 in 6/8.

Proof: [`fixtures/semantics/timing-frames.json`](/contract/arrangement-export/fixtures/semantics/timing-frames.json) (89 bpm,
4/4 and 3/4 sections). The frames there are the ones the audio is rendered on.

### Sample rates

- Sections, `arrangement.endFrame`, `lengthSeconds` and `nullTest.frames` are at `sampleRate`,
  the rate the project renders at. The mix, stems and editable stems are at that rate too.
- A master can be delivered at another rate (`options.sampleRate`, e.g. 44.1 kHz from a 48 kHz
  project). Then `master.resampled` names both rates, and the master's own frame count is
  `round(frames × toRate / fromRate)`. **Use the export's `sampleRate` frames to place
  sections**, and scale by `toRate / fromRate` if you need the master's own frame numbers.

### Tail

The audio runs past the last bar so reverbs and delays ring out:

- `tail.mode: "auto"`: the files end where the mix falls below `floorDbfs` (−90 dBFS), never
  before the song end and at most `capSeconds` (10 s) after it.
- `tail.mode: "fixed"`: the files end `seconds` after the song end.

The song end can run past the last bar on its own: a layer's sound decaying after its last
note, or an effect that rings out. `lengthSeconds` is the length of the rendered files, tail
included. The last bar ends at `arrangement.endFrame` (1.1), or at the last section's
`startFrame + lengthFrames`.

---

## Alignment

Every audio file starts at song frame 0, the first bar's downbeat, sample-aligned with the
section frames. There is no pre-roll. 1.1 states it per file: `files[].startFrame` is `0`.

`files[].latencyMs` (1.1) is the file's **known uncompensated latency**, in milliseconds. It is
`0` today. The export renders offline, and the render compensates every latency a plugin
reports: it drops that many leading samples, so a file's frame 0 is the song's frame 0. The
stems are checked against the mix (`nullTest`: stems minus mix stays below −60 dB), which would
show a misaligned stem.

What `latencyMs` cannot cover: a plugin that reports less latency than it has, and the sound
itself. An instrument's attack, or a sample whose transient sits a few milliseconds in, is part
of the music: its onset lands after the note's position by design.

---

## Sections

`arrangement.instances[]` lists the song's sections in playing order. Each section is one
instance of a scene in the arrangement.

- **Order**: the arrangement orders its instances by `orderKey` (compared code unit by code
  unit), ties broken by instance id. `instances[]` is already in that order.
  Proof: [`fixtures/semantics/instance-order.json`](/contract/arrangement-export/fixtures/semantics/instance-order.json).
- **`instanceId`** is stable across saves, re-exports and a project import, as long as the
  section exists.
- **`label`** is the user's label, or `<scene name> <ordinal>` ("Chorus 2", the second chorus).
  The editor shows an unlabelled section as "Chorus (2)"; the export keeps the form without
  parentheses.

---

## Layers

A layer is one track of a scene: a loop the scene plays. Its id (`layerId`) is the catalog
track id, the same everywhere in the export. In each section, a layer either plays or doesn't,
bar by bar. A section's scene is the layer's **home** when the layer belongs to that scene;
otherwise the layer is a **guest** there.

What plays in a section is decided by the layer's lane in that section, if it has one:

- **`play`** is `"on"`, `"off"`, or a **mask**: one character per bar of the section, `"1"` plays
  the bar and `"0"` doesn't. A mask of another length is invalid.
  Proof: [`fixtures/semantics/mask-one-char-per-bar.json`](/contract/arrangement-export/fixtures/semantics/mask-one-char-per-bar.json).
- **A home layer with no lane**, or a lane without `play`, follows the section's `newLayers`:
  `"on"` plays every bar, `"off"` none.
  Proof: [`fixtures/semantics/untouched-home-layers-follow-newlayers.json`](/contract/arrangement-export/fixtures/semantics/untouched-home-layers-follow-newlayers.json).
- **A guest layer** plays only through a lane in that section with `play` set to `"on"` or a mask.
  Proof: [`fixtures/semantics/guest-layers-play-only-through-an-entry.json`](/contract/arrangement-export/fixtures/semantics/guest-layers-play-only-through-an-entry.json).

### Guest entries

A guest's lane **without `play` does not play**. Guests default to `"off"`. A guest lane may
carry a level, fades or a loop position and still be silent until `play` says otherwise.
Proof: [`fixtures/semantics/guest-entry-without-play.json`](/contract/arrangement-export/fixtures/semantics/guest-entry-without-play.json).

### Runs

A **run** is a layer's continuous playing bars. A run **carries on across a section boundary**
when the layer plays the last bar of one section and the first bar of the next: no restart, no
fade, no gap. Fades and a guest's loop position follow runs, not sections.

### Loop position

Each layer loops its own scene's loop (`loopBars` bars in its home meter). At every downbeat a
run reads the loop at a position, in quarter notes into the loop:

- A **home** layer is anchored to the section: bar `n` of the section plays loop bar `n`
  (position `(n − 1) × beats per bar`), wrapping where the loop ends. A home run that carries
  into the next section re-anchors there.
- A **guest** reads from its loop's start (position 0) where its run starts, and carries on
  from there, across section boundaries, wrapping as it goes.
- A lane's **`phaseOffsetBeats`** shifts that anchor by its value (quarter notes).
- A lane's **`phaseSegments`** override it inside the section. From a segment's `fromBar` on
  (until the next segment), the position at each downbeat is
  `offsetBeats + (bar − fromBar) × beats per bar`, wrapped to the loop. A segment **replaces**
  both the anchor rule and `phaseOffsetBeats` there; it doesn't add to them. A segment that
  continues the current position changes nothing.

Proof: [`fixtures/semantics/phase-segment-replaces-anchor.json`](/contract/arrangement-export/fixtures/semantics/phase-segment-replaces-anchor.json).

### Splits

A lane's **`splits`** are bar numbers where the editor starts a new clip: selectable, deletable
pieces of a run. **They have no effect on what plays**: no restart, no fade, no gap.
Proof: [`fixtures/semantics/splits-have-no-audio-effect.json`](/contract/arrangement-export/fixtures/semantics/splits-have-no-audio-effect.json).

### Fades

- Fades belong to **runs**. A run's fade-in is the `fadeInBeats` of the lane in the section
  where the run **starts**. Its fade-out is the `fadeOutBeats` of the lane in the section where
  it **ends**. There is no fade where a run crosses a section boundary.
- Lengths are in quarter notes, from the run's start and to its end, never longer than the run.
- Curves (`fadeInCurve`, `fadeOutCurve`), as gain at t ∈ [0, 1] of the fade:
  - `"equalPower"` (the default, and what an unknown name plays): sin(tπ/2) in, cos(tπ/2) out
  - `"linear"`: t in, 1 − t out
  - `"exponential"`: t³ in, (1 − t)³ out
  - `"sCurve"`: (1 − cos tπ)/2 in, (1 + cos tπ)/2 out

Proof: [`fixtures/semantics/fades-follow-runs-across-sections.json`](/contract/arrangement-export/fixtures/semantics/fades-follow-runs-across-sections.json).

### Gain

- A lane's **`gainDb`** sets the layer's level in that section.
- A scene's gain (the arrangement's `sceneGains`, e.g. from "Match scene levels", which matches
  the scenes' overall loudness by default, or their kicks) adds to every lane of every layer
  whose **home** is that scene, wherever it plays.
- A lane's **`gainEnvelope`** is **applied in the audio**. It is dB points at quarter notes from
  the section's downbeat, added to `gainDb`. It is linear in dB between points and holds its
  first and last values beyond them. It applies wherever the lane plays in the section.
- Where it acts: on the layer's rendered audio, together with its fades. Then come the
  layer's track fader and pan, and then its mix bus's effects.

Proof: [`fixtures/semantics/gain-envelope-is-applied.json`](/contract/arrangement-export/fixtures/semantics/gain-envelope-is-applied.json).

### Alternatives (takes)

A scene's layers can form an **alternatives group**: a vocal reading's takes (one per verse of
its lyrics), a kit's fills. In the catalog each member carries `altGroupId` and `altOrder`.
Members with the same `altOrder` are one **unit** and play together (a take's lead and its
harmonies).

- In each section of the scene **one unit plays**: the section's pick
  (`instances[].altPicks[groupId]` in the arrangement) when it names a unit that exists, else
  the unit at the section's **position**. The k-th section of the scene (its handle number:
  A2 is the second) plays unit (k − 1) mod n, units in ascending `altOrder`.
- The other units **rest** there: they are silent, and effects placed on them don't sound.
- A member playing as a guest in another scene's section is unaffected.
- Linked sections (sharing one arrangement of the scene) can play different units.
- A scene without groups plays exactly as described above.

Proof: [`fixtures/semantics/alternatives-play-one-take-per-section.json`](/contract/arrangement-export/fixtures/semantics/alternatives-play-one-take-per-section.json).

### Mute and solo

The arrangement's own mute and solo silence whole layers: a layer sounds when it isn't muted
and, if any layer is soloed, it is soloed too. Mute wins. A silenced layer is left out of the
mix and the master, and gets no stem.
Proof: [`fixtures/semantics/mute-solo-silences.json`](/contract/arrangement-export/fixtures/semantics/mute-solo-silences.json).

### Effects placed on a lane

A user can place effects on a layer's bar (fills, stutters, reverses, filter sweeps, hits and
risers). They are rendered into the audio where they are placed, and nothing is placed
automatically.

---

## Common misreadings

Each of these is a plausible reading of the arrangement data, and each is wrong:

| It is tempting to assume | What actually happens | Proof |
|---|---|---|
| A guest lane without `play` plays. | It is **off**. Guests play only where `play` says so. | [`guest-entry-without-play`](/contract/arrangement-export/fixtures/semantics/guest-entry-without-play.json) |
| `gainEnvelope` is recorded but not applied. | It **is applied** in the audio, on top of the lane's gain and its scene's gain. | [`gain-envelope-is-applied`](/contract/arrangement-export/fixtures/semantics/gain-envelope-is-applied.json) |
| A phase segment restarts the loop at 0, or adds to `phaseOffsetBeats`. | It **sets** the position to its `offsetBeats` at `fromBar`, replacing the anchor and `phaseOffsetBeats`. | [`phase-segment-replaces-anchor`](/contract/arrangement-export/fixtures/semantics/phase-segment-replaces-anchor.json) |
| Fades apply per section. | They apply per **run**, and runs carry on across section boundaries. | [`fades-follow-runs-across-sections`](/contract/arrangement-export/fixtures/semantics/fades-follow-runs-across-sections.json) |
| `splits` restart or fade the loop. | They change nothing that plays. | [`splits-have-no-audio-effect`](/contract/arrangement-export/fixtures/semantics/splits-have-no-audio-effect.json) |
| Every take (or every fill) of a scene plays in every section. | One unit of an alternatives group plays per section, by position or picked; the others rest. | [`alternatives-play-one-take-per-section`](/contract/arrangement-export/fixtures/semantics/alternatives-play-one-take-per-section.json) |

---

## Ids and stability

| Id | Stable across |
|---|---|
| `arrangement.instances[].instanceId` | saves, re-exports, Save As, and a project import on another machine |
| `layerId` (`files[].layerIds`, the payloads) | saves, re-exports and Save As. A project imported on another machine gets new layer ids. |
| `project.id`, `arrangement.id` | saves and re-exports on the same machine. New on another machine. |
| `arrangement.planId` | nothing: new for every render plan |
| `exportId` (1.1) | nothing: new for every export |

`files[].layerIds` (1.1) lists the layers a stem carries. A mix-bus stem carries several layers,
a layer outside any bus one. The mix and the master carry every audible layer and have no list.

---

## Revision

`arrangement.revision` (1.1) says which edit of the arrangement the export was made from:

- `seq` is the number of the arrangement's latest applied edit in the app's history. It grows
  with every edit (an undo is an edit too), but not by exactly one. It is local to the machine.
- `docHash` is the SHA-256 of the arrangement document's canonical JSON (see below). Two
  exports with the same `docHash` were made from the same arrangement.

Neither survives a project import on another machine: the history isn't carried, and ids are
renewed. Audio can also change without a new revision, through a re-render of a scene's
instruments or a mix change. That's what `files[].sha256` is for.

---

## Change detection

Three hashes tell a consumer in one comparison what changed between two exports of a song:

| Hash | Covers | When only this one changed |
|---|---|---|
| `timingHash` (1.1) | tempo, sample rate, the last bar's end, each section's id, label, meter, bar count and frames | none (it changing means: re-time everything) |
| `arrangementHash` (1.1) | `timingHash`, plus what plays: every layer's runs (bars, loop position, level, gain envelope, fades), the placed effects that sound, and the silenced layers | refresh what reacts to layers; the timing is the same |
| `files[].sha256` | each audio file, byte for byte | swap the audio; nothing about the arrangement moved |

Each hash is the SHA-256, in lower-case hex, of the UTF-8 bytes of the **canonical JSON** of a
payload. Canonical JSON has object keys sorted (by code unit) at every level, no whitespace,
and non-ASCII characters left unescaped. The payloads are versioned (`"v": 1`). A later format
version that hashes more (e.g. notes) adds a new hash rather than widening these.

Timing payload, version 1:

```json
{
  "v": 1,
  "sampleRate": 48000,
  "bpm": 120,
  "endFrame": 1440000,
  "sections": [
    { "id": "…", "label": "verse 1", "meter": "4/4", "lengthBars": 4, "startFrame": 0, "lengthFrames": 384000 }
  ]
}
```

Arrangement payload, version 1:

```json
{
  "v": 1,
  "timingHash": "…",
  "silent": ["<layerId>", "…"],
  "layers": [
    {
      "layerId": "…",
      "runs": [
        {
          "section": "<instanceId>", "enterBar": 1, "exitBar": null, "offsetBeats": 0,
          "gainDb": 0, "gainPoints": [],
          "fadeIn": { "beats": 0, "curve": "equalPower" }, "fadeOut": { "beats": 0, "curve": "equalPower" }
        }
      ]
    }
  ],
  "treatments": [
    { "section": "<instanceId>", "layerId": "…", "type": "fill_roll8", "bar": 4, "params": {}, "gainDb": 0 }
  ]
}
```

- `layers` is sorted by `layerId`, each layer's `runs` in timeline order. A run is one stretch
  of a section where the layer plays: `enterBar` is its first bar, `exitBar` the first bar it
  doesn't play (`null`: to the section's end), and `offsetBeats` the loop position at its first
  downbeat.
- `gainDb` includes the scene's gain. `gainPoints` is the envelope over the run in
  section-relative quarter notes, dB on top of `gainDb`.
- `silent` lists muted or not-soloed layers; their runs are listed as if audible.
- `treatments` are the placed effects that sound, in timeline order.

Every fixture in [`fixtures/semantics/`](https://github.com/shiehn/sas-arrangement-export-contract) carries both payloads and both
hashes for its arrangement.

---

## Privacy

By default an export records where it was written: `options.destination`,
`master.input.path` / `master.output.path`, `abletonBundle` and some warnings hold absolute
paths, which include the user's home folder.

With **`options.pathFree: true`** (1.1), the export leaves every absolute path out:

- `options.destination`, `master.input.path` and `master.output.path` are omitted;
- `abletonBundle` keeps only the folder's name;
- `nullTest.mismatches` and `warnings` are made relative to the bundle, with the home folder
  written as `~`.

`files[].file` is always bundle-relative and, from 1.1, always uses `/` as separator. Plugin
states are never exported. Stems are optional: an export may hold only the master.

---

## Other fields

| Field | Meaning |
|---|---|
| `renderedAt` | when the export started (UTC) |
| `project.name`, `project.bpm` | the project's name and tempo |
| `arrangement.name` | the arrangement's name |
| `engine.sha256` | the audio engine build that rendered the files |
| `options` | the export as it was asked for |
| `name` | the export's name: the base of its folder and file names |
| `master` | the master's loudness before and after mastering: `master.output.integratedLufs` and `master.output.truePeakDbtp` are the delivered file's. `master.applied` holds the mastering settings, `master.resampled` the rate change. |
| `nullTest` | stems minus mix, when stems were rendered: `pass` means they sum to the mix within `thresholdDb` |
| `monoContent` | the mix's left and right channels are identical and not silent |
| `buses[]` | the mix buses rendered, with their effects' names and versions (no settings) |
| `staleStemsRendered` | how many layer stems were re-rendered before the export |
| `warnings` | anything that went wrong but didn't stop the export |

The schemas give every field's type and whether it is required.

---

## Validating

```js
import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';

const ajv = new Ajv2020({ allErrors: true });
addFormats(ajv);
const validate = ajv.compile(schema); // the schema of the file's exportVersion
if (!validate(exportJson)) console.log(validate.errors);
```

Signals & Sorcery's own tests validate the exports it writes against the schema of the
version they declare.
