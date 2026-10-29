---
sidebar: auto
title: Arrangement export format
description: The published, versioned format of a Signals & Sorcery arrangement export. A visual tool, a game engine or an analysis script can read an export's JSON and line its work up with the music, to the bar. Specification, JSON Schemas, fixtures and changelog, MIT licensed.
---

# Arrangement export format

When you export a song from [Arrange mode](/arrange/#exporting-your-song), Signals & Sorcery
writes a folder of audio files plus one JSON file, `<name> - export.json`, that describes them:
the song's tempo, its bars and sections down to the audio frame, which layer plays when (and,
if you ask for them, the notes each layer plays), the words sung in each section, and every file. That JSON is a **published,
versioned format**. A visual tool, a game engine or an analysis script can read an export and
cut, animate or analyse to the bar, without opening the project file and without knowing how
the app works inside.

- **Current version:** 1.4.0
- **JSON Schemas:** [1.4.0](/contract/arrangement-export/1.4.0/schema.json), [1.3.0](/contract/arrangement-export/1.3.0/schema.json), [1.2.0](/contract/arrangement-export/1.2.0/schema.json), [1.1.0](/contract/arrangement-export/1.1.0/schema.json), [1.0.0](/contract/arrangement-export/1.0.0/schema.json), and [v1](/contract/arrangement-export/v1/schema.json): the latest 1.x, which every 1.x file validates against
- **Changelog:** [what changed, version by version](/contract/arrangement-export/changelog.html)
- **Source:** [github.com/shiehn/sas-arrangement-export-contract](https://github.com/shiehn/sas-arrangement-export-contract), with the specification, the schemas and the [fixtures](https://github.com/shiehn/sas-arrangement-export-contract/tree/main/export/fixtures)
- **Reader:** [the reference reader](https://github.com/shiehn/sas-arrangement-export-contract/tree/main/export/reader) (TypeScript) and its `sas-export` command, which checks an export against its version's schema and recomputes its `timingHash` and `scoreHash` (see [Validating](#validating))
- **Your tool's checks:** if your tool reads these exports, add what it relies on as a [consumer fixture](https://github.com/shiehn/sas-arrangement-export-contract/tree/main/export/fixtures/consumers), and every change to the format is checked against it
- **Licence:** MIT, for everything in the contract: the specification, the schemas and the fixtures

Each schema is served at the URL in its `$id`. A version's URL is the one an export of that
version carries in `$schema`, so a validator can fetch it directly; `v1/schema.json` always
follows the latest 1.x.

## Get an export

- **In the app:** **Export…** in the arranger header. Tick **Include played notes (MIDI)** to add the notes each layer plays to the score. See [Exporting your song](/arrange/#exporting-your-song).
- **From an agent or a script:** `arrangement_export`, or `sas arrangement export`. See [Undo and export](/automation/for-agents.html#undo-and-export). The [score](#score) is written by default (`score: false` leaves it out); `scoreNotes` (`--score-notes`) adds the notes; `pathFree` (`--path-free`) leaves every absolute path out of the file (see [Privacy](#privacy)).

## The specification, format 1.x

An arrangement export is a folder of audio files plus one JSON file, `<name> - export.json`,
that describes them: the song's tempo and sections in audio frames, the files, and how they
were made. This document says what every part of that JSON means, so a consumer (a visual
tool, a game engine, an analysis script) can read an export without opening the project file
that made it.

- The JSON Schemas: [1.4.0](/contract/arrangement-export/1.4.0/schema.json), [1.3.0](/contract/arrangement-export/1.3.0/schema.json), [1.2.0](/contract/arrangement-export/1.2.0/schema.json), [1.1.0](/contract/arrangement-export/1.1.0/schema.json), [1.0.0](/contract/arrangement-export/1.0.0/schema.json). One per format version, plus [`v1`](/contract/arrangement-export/v1/schema.json): the latest 1.x.
- What changed and when: [the changelog](/contract/arrangement-export/changelog.html).
- Fixtures that prove each rule below through Signals & Sorcery's own arrangement code:
  [`fixtures/`](https://github.com/shiehn/sas-arrangement-export-contract/tree/main/export/fixtures).

Everything here is stated from the code that writes and plays the export, not from listening.

---

## Versions

- `schema` is always `"sas-arrangement-export/1"`. It names the format family.
- `exportVersion` is the format's own [semantic version](https://semver.org). A file without
  it is `1.0.0`; files written to this document carry `1.4.0`.
  - A **patch** clarifies wording only.
  - A **minor** adds optional fields; a reader for an older minor keeps working.
  - A **major** removes a field or changes a meaning. It is announced in the changelog first.
- `$schema` (1.1) is the URL of the exact schema version the file was written against, e.g.
  [`https://signalsandsorcery.com/contract/arrangement-export/1.4.0/schema.json`](/contract/arrangement-export/1.4.0/schema.json).
  signalsandsorcery.com serves every version's schema at its URL;
  [`https://signalsandsorcery.com/contract/arrangement-export/v1/schema.json`](/contract/arrangement-export/v1/schema.json) is the latest 1.x.
  The same files ship with the arrangement contract package, in `export/schema/`.
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

Plugin states and the project's other data are never in the export. A layer's notes are in
it only when the user asks for them (1.2, [Score](#score)).

---

## Timing

**Every frame number in the JSON is at the top-level `sampleRate`**, except `files[].frames`,
which is in that file's own rate.

The tempo is `project.bpm`, in quarter notes per minute, constant over the song. A beat is a
quarter note. For a position `beat` quarter notes after the song start:

```
frame(beat) = floor(beat × 60 × sampleRate / bpm + 0.5)
```

The song starts at its first heard beat, frame 0: the first section's downbeat, or, when the
song has [pickup bars](#pickup-bars) (1.3), the first of them.

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

## Pickup bars

`arrangement.pickup` (1.3) is there when the song starts before its first section's downbeat:
`bars` pickup bars that lead in to it, "start the song on bar 7 of the verse". It is absent
when the song has none, and the rest of this document reads as it always did.

```json
"pickup": { "bars": 2, "startFrame": 0, "lengthFrames": 192000, "instanceId": "<instances[0].instanceId>" }
```

- The pickup bars come first: frame 0 to `lengthFrames`. `instances[0].startFrame` is
  `lengthFrames`, and every section after it starts that much later. The audio files start
  with them too: no leading silence.
- They are in the first section's meter, and they are song bars **0, −1, −2 …** counting back
  from its downbeat, which stays bar 1. Bar numbers from 1 on don't move when pickup bars are
  added or removed.
- They play the first section's own loop, up to its downbeat: each layer that sounds at that
  downbeat starts at frame 0, `bars` bars earlier in its loop, and carries straight on into the
  section, so two pickup bars before an 8-bar scene play its bars 7 and 8. A layer silent at the
  downbeat is silent in the pickup. Its fade-in, if it has one, is at frame 0, no longer than
  the pickup. No effects are placed there.
- `instanceId` names the section they lead in to, always the first. They belong to the song, not
  to that section: whichever section comes first fills them.
- In the arrangement payload a pickup run's `section` is `"pickup"`; in the score, see
  [Pickup bars in the score](#pickup-bars-in-the-score).

Proof: [`fixtures/semantics/pickup-bars-lead-in.json`](/contract/arrangement-export/fixtures/semantics/pickup-bars-lead-in.json)
(two pickup bars before an 8-bar chorus).

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

Since arrangement release 0.12.0 a run can also start or stop **on a beat inside a bar** (the
meter's beat: eighths in 6/8). It still names the bars it touches; where inside them it starts
and stops is in its frames (a score span's `startFrame` / `endFrame`). A run that stops before
a section's last beat, or starts after its first, doesn't carry on across that boundary.

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

Since arrangement release 0.13.0 a clip can have **its own fades and level** (below). A fade, or a
change of level, at a split makes that split a real edge: the run is cut there and its loop
position carries on. A split alone still changes nothing.

### Fades

- Fades belong to **runs**. A run's fade-in is the `fadeInBeats` of the lane in the section
  where the run **starts**. Its fade-out is the `fadeOutBeats` of the lane in the section where
  it **ends**. There is no fade where a run crosses a section boundary.
- Lengths are in quarter notes, from the run's start and to its end, never longer than the run.
- **Each clip's own fades** (arrangement release 0.13.0): a lane's `clips` list holds entries at
  clip edges (a 1-based `bar` and `atBeats` quarter notes after its downbeat; the section's end is
  `bar` = its length + 1 at 0). An entry's `fadeInBeats` / `fadeInCurve` are the fade-in of the
  clip that starts there; its `fadeOutBeats` / `fadeOutCurve` the fade-out of the clip that ends
  there. What an entry doesn't set falls back to the lane's fades at a run's own start and end,
  and to no fade at a clip edge inside the audio. A fade at a clip edge inside the audio, or at a
  section boundary a run plays through, cuts the run there (its loop position carries on). So
  every pasted copy of a clip keeps its own fades: changing one changes no other.
- Curves (`fadeInCurve`, `fadeOutCurve`), as gain at t ∈ [0, 1] of the fade:
  - `"equalPower"` (the default, and what an unknown name plays): sin(tπ/2) in, cos(tπ/2) out
  - `"linear"`: t in, 1 − t out
  - `"exponential"`: t³ in, (1 − t)³ out
  - `"sCurve"`: (1 − cos tπ)/2 in, (1 + cos tπ)/2 out

Proof: [`fixtures/semantics/fades-follow-runs-across-sections.json`](/contract/arrangement-export/fixtures/semantics/fades-follow-runs-across-sections.json).

### Gain

- A lane's **`gainDb`** sets the layer's level in that section.
- **Each clip's own level** (arrangement release 0.13.0): a `clips` entry's `gainDb` is the level
  of the clip starting there, instead of the lane's. It holds on through the continuous audio
  after it, so a split hands both halves the level it had; a run's own start begins at the lane's
  `gainDb`. Where two clips inside the audio play at different levels the run is cut there. A
  placed effect plays at the level of the clip its bar starts in.
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
| A lane's fades are every clip's fades (0.13.0). | Only where a clip has none of its own: a `clips` entry gives one clip its own fades and level, and changes no other. | `fixtures/literal/clip-fades`, `fixtures/literal/clip-gains` |
| Every take (or every fill) of a scene plays in every section. | One unit of an alternatives group plays per section, by position or picked; the others rest. | [`alternatives-play-one-take-per-section`](/contract/arrangement-export/fixtures/semantics/alternatives-play-one-take-per-section.json) |
| A section without `lyrics` is instrumental, or a scene's words are the same wherever it plays (1.4). | When the song has words, **every** section has `lyrics`, and an instrumental one has `"lines": []`. Words belong to each section, so verse 2 can differ from verse 1 on the same scene. | [`score-lyrics-per-section`](/contract/arrangement-export/fixtures/semantics/score-lyrics-per-section.json) |

---

## Score

`score` (1.2) is the arrangement resolved for a reader: everything this document describes,
worked out by Signals & Sorcery's own code, in bars and frames. A consumer needs no rules of its
own to follow the music. It is there when the export asked for it (`options.score`); its notes
only with `options.scoreNotes`.

```json
{
  "v": 1,
  "noteFields": ["frame", "pitch", "velocity", "durationFrames"],
  "tempoMap": [{ "bar": 1, "beat": 0, "frame": 0, "bpm": 120 }],
  "meterMap": [{ "bar": 1, "beat": 0, "frame": 0, "numerator": 4, "denominator": 4 }],
  "bars": [{ "index": 1, "startFrame": 0, "lengthFrames": 96000 }],
  "sections": [{ "instanceId": "…", "sourceSceneId": "…", "firstBar": 1, "lengthBars": 4 }],
  "layers": [
    {
      "layerId": "…", "name": "Kick", "role": "kicks", "bucket": "drums", "drumClass": "kick",
      "spans": [{ "section": "…", "startBar": 1, "endBar": 5, "startFrame": 0, "endFrame": 384000, "gainDb": 0, "gainPoints": [] }],
      "treatments": [],
      "notes": [[0, 36, 100, 6000], [24000, 36, 100, 6000]]
    }
  ]
}
```

In the score, `bar` is a song bar counted from 1, `beat` is quarter notes from the song start,
and every frame follows [Timing](#timing).

### Timing maps and bars

- `tempoMap[]` lists where each tempo starts. The tempo is constant today: one entry at bar 1.
  Read it as a list anyway, so a song that changes tempo later reads the same way.
- `meterMap[]` has an entry at bar 1 and wherever a section's meter differs from the previous
  section's. Each scene has its own meter, so the meter can change today.
- `bars[]` is every bar of the song, contiguous. The last ends at `arrangement.endFrame`.
  With pickup bars (1.3) the song starts with them: the maps' first entries and the first bars
  are at song bar `1 − pickup.bars` (0, −1 …), frame 0.

### Pickup bars in the score

`score.pickup` (1.3), when the song has [pickup bars](#pickup-bars): `firstBar` (1 − `bars`),
`bars`, `instanceId` (the section they lead in to) and `sourceSceneId` (whose loop they play).
They are not a section: `sections[]` still lists one entry per instance, from bar 1. A layer
that plays there has a span with `section: "pickup"` from `firstBar` to 1, and its span in the
first section carries it on (`continues: true`).

### Sections in the score

`sections[]` lists the sections in playing order, one per `arrangement.instances[]`:
`firstBar`, `lengthBars`, and `sourceSceneId`, the scene the section plays (sections with the
same scene play the same loops).

- `role` (1.4) is the section's part in the song form: `verse`, `chorus`, `bridge`, `intro`,
  `outro` and so on. Signals & Sorcery reads it from the section's label when it writes the
  song's words, and the user can change it. It is free text, trimmed and lower-case; treat a
  value you don't know as no role. It is absent when the song gives none, which includes every
  file before 1.4.
- `lyrics` (1.4) holds the words sung in the section: see [Lyrics](#lyrics).

### Lyrics

`score.sections[].lyrics` (1.4) holds the song's words, placed where they are sung:

```json
"sections": [
  { "instanceId": "…:i1", "sourceSceneId": "sc_a", "firstBar": 1, "lengthBars": 4, "role": "verse",
    "lyrics": { "lines": ["Lights come on along the river", "Every window holds a name"] } },
  { "instanceId": "…:i2", "sourceSceneId": "sc_b", "firstBar": 5, "lengthBars": 8, "role": "chorus",
    "lyrics": { "lines": ["So let it rise, let it rise", "Over the roofs and the wires", "Let it rise"] } },
  { "instanceId": "…:i5", "sourceSceneId": "sc_c", "firstBar": 25, "lengthBars": 4, "role": "bridge",
    "lyrics": { "lines": [] } }
]
```

- The words belong to the **section**, not to the scene. A scene that plays twice (verse 1 and
  verse 2) can sing different words in each place.
- `lines` is one line per sung phrase, in the order they are sung, as the user or the writer
  wrote them.
- A section that repeats another's words, such as a chorus, carries those words in full. You
  never follow a reference.
- **When the song has words, every section has `lyrics`.** A section where nothing is sung has
  `"lines": []`.
- **When the song has no words, no section has `lyrics`.** So a missing `lyrics` means "this
  song has no words in the export", never "an instrumental section".
- The words don't say when each syllable is sung within a section; that may be added later.
  Nor do they name the layer that sings them: look for the layers whose `role` is `vocals`.
- The words are not timing and not what plays: `timingHash`, `arrangementHash` and `scoreHash`
  leave them out. `lyricsHash` covers them (see [Change detection](#change-detection)).
- Like the rest of the score, the words are there only when the export wrote a score
  (`options.score`).

Proof: [`fixtures/semantics/score-lyrics-per-section.json`](/contract/arrangement-export/fixtures/semantics/score-lyrics-per-section.json).

### Layers in the score

`layers[]`, sorted by `layerId`, holds every layer that plays somewhere, or would but is
silenced.

- `name` is the user's track name.
- `role` is the instrument role, or `null` (e.g. an audio loop). The known roles are `kicks`,
  `snares`, `hats`, `perc`, `cymbals`, `drums` (a whole kit), `bass`, `808s`, `keys`, `pads`,
  `chords`, `strings`, `brass`, `winds`, `plucked`, `atmospheres`, `lead`, `arp`, `bells`,
  `vocals`, `fx` and `unclassified`.
- `bucket` is the layer's part of the band, by role:

  | `bucket` | roles |
  |---|---|
  | `drums` | drums, kicks, snares, hats, perc, cymbals |
  | `bass` | bass, 808s |
  | `harmony` | keys, pads, chords, strings, brass, winds, plucked, atmospheres |
  | `top` | lead, arp, bells, vocals, fx |
  | `null` | any other role, or none |

- `drumClass` marks a drum-kit piece: `kick`, `snare`, `hat`, `perc` or `cymbal`, from its role.
  A whole kit on one layer (role `drums`) is `"kit"`, and with notes its `drumMap` gives each
  played pitch's piece by General MIDI: 35–36 kick, 37–40 snare, 42/44/46 hat,
  49/51/52/53/55/57/59 cymbal, any other 35–81 perc, anything else `unknown`. 808s are bass and
  have no `drumClass`.
- `silent: true`: the arrangement's [mute or solo](#mute-and-solo) silences the layer. It then
  has no spans, treatments or notes.

### Spans

`spans[]` says where the layer sounds, one span per run of the arrangement payload
([Change detection](#change-detection)), in song bars and frames. Masks, guest entries, phase
segments, splits, takes and mute are already resolved: a span is sound.

- `startBar` / `startFrame` start it, and `endBar` / `endFrame` are the first bar and frame
  after it. `startBar` is the bar it starts in and `endBar` the bar after the one it ends in: a
  span edited at beat resolution (0.12.0) can start or stop inside those bars, and its frames
  say exactly where.
- `continues: true`: the span carries on the previous section's span, the same
  [run](#runs): no restart, no fade.
- `gainDb` is the lane's gain plus its scene's gain. `gainPoints` is its envelope in frames,
  dB on top of `gainDb` ([Gain](#gain)).
- `fadeIn` / `fadeOut` are `{frames, curve}`, from the span's start and to its end
  ([Fades](#fades)).
- The track fader, pan and the mix bus's effects act after all of this and are not in the
  score.

### Effects in the score

`treatments[]` lists each placed effect that sounds: its section, `type`, `bar` (in the
section), `bars`, `params`, `gainDb`, and `startFrame` / `endFrame`: its bars, widened to where
its audio sounds (a riser starts before its bar, a hit can ring past it).

- `mode: "replace"`: the layer's own audio is replaced in those bars (fills, stutters,
  reverses, gaps, filter sweeps, tape stops), and they carry no notes. A bar loop (`"loop"`)
  replaces too, with an earlier window of the same layer, so its notes repeat there.
- `mode: "add"`: it plays on top of whatever plays (crash washes, impacts, hits, risers).

### Notes

With `options.scoreNotes`, each layer that has MIDI carries `notes`: tuples
`[frame, pitch, velocity, durationFrames]` (their order is `score.noteFields`), sorted by
frame, then pitch. A layer without MIDI (an audio loop, a recording) has none.

- They are the layer's loop MIDI wherever it plays, read through each span exactly as the
  audio is ([Loop position](#loop-position)). A home layer re-anchors at each section, a guest
  carries its position across sections, phase offsets and segments apply, and the loop wraps.
- Only notes struck while the layer plays count: a note held from before a span starts is not
  struck again. A note's length runs on into the spans it continues into, and stops where its
  run ends.
- `frame` is where the note sounds in the rendered audio. A loop's audio is a whole number of
  frames, so over many repeats a note can drift a fraction of a frame per repeat from the ideal
  beat grid: under a millisecond over a song. Use the frames.
- Bars an effect replaces carry no notes; a bar loop repeats its window's notes.
- `pitch` is 0–127 (MIDI; 60 is middle C) and `velocity` 1–127, as written. The span's level
  and fades are not applied to them.

Proof: [`fixtures/semantics/score-notes-follow-the-loop.json`](/contract/arrangement-export/fixtures/semantics/score-notes-follow-the-loop.json)
and [`fixtures/semantics/score-effects-and-notes.json`](/contract/arrangement-export/fixtures/semantics/score-effects-and-notes.json).

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

These hashes tell a consumer in one comparison what changed between two exports of a song:

| Hash | Covers | When only this one changed |
|---|---|---|
| `timingHash` (1.1) | tempo, sample rate, the last bar's end, each section's id, label, meter, bar count and frames, and the pickup bars (1.3) | none (it changing means: re-time everything) |
| `arrangementHash` (1.1) | `timingHash`, plus what plays: every layer's runs (bars, loop position, level, gain envelope, fades), the placed effects that sound, and the silenced layers | refresh what reacts to layers; the timing is the same |
| `files[].sha256` | each audio file, byte for byte | swap the audio; nothing about the arrangement moved |
| `scoreHash` (1.2, with `score`) | `timingHash`, plus the score: the sections' scenes and roles, and every layer's role, bucket, drum class, silence, spans, effects and notes (names aside) | refresh what follows the layers or notes; the timing is the same |
| `lyricsHash` (1.4, when the score has [lyrics](#lyrics)) | each section's words, by section id | refresh the words (captions, a lyric sheet); nothing else moved |

Each hash is the SHA-256, in lower-case hex, of the UTF-8 bytes of the **canonical JSON** of a
payload. Canonical JSON has object keys sorted (by code unit) at every level, no whitespace,
and non-ASCII characters left unescaped. The payloads are versioned (`"v": 1`). A later format
version that hashes more adds a new hash rather than widening these: 1.2's `scoreHash` covers
the notes.

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

With [pickup bars](#pickup-bars) (1.3) the timing payload also has
`"pickup": { "bars": 2, "meter": "4/4", "lengthFrames": 192000 }`. Without them it has no
`pickup` key, so every earlier `timingHash` stands.

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
- A run that starts or stops inside a bar (0.12.0) also has `enterInsetBeats` (quarter notes
  after `enterBar`'s downbeat where it starts) and `exitInsetBeats` (quarter notes before its
  end where it stops). They are absent on every other run, so every earlier `arrangementHash`
  stands, and a trim by a beat is a change to what plays.
- `gainDb` includes the scene's gain. `gainPoints` is the envelope over the run in
  section-relative quarter notes, dB on top of `gainDb`.
- `silent` lists muted or not-soloed layers; their runs are listed as if audible.
- `treatments` are the placed effects that sound, in timeline order.

Score payload, version 1 (1.2):

```json
{
  "v": 1,
  "timingHash": "…",
  "sections": [{ "id": "<instanceId>", "sourceSceneId": "…", "role": null }],
  "layers": [
    {
      "layerId": "…", "role": "kicks", "bucket": "drums", "drumClass": "kick", "drumMap": null,
      "silent": false, "spans": [], "treatments": [], "notes": null
    }
  ]
}
```

- `spans`, `treatments` and `notes` are the score's own. Absent fields are `null` (`silent`:
  `false`), and names are left out.
- The tempo map, meter map and bars derive from the timing, which `timingHash` covers.
- `notes` is `null` when the export left notes out. **Compare `scoreHash` only between exports
  made with the same `options.scoreNotes`.**
- A section's `role` is `null` when it has none. A 1.4 file that fills it changes `scoreHash`;
  a file with no roles hashes exactly as before.

Lyrics payload, version 1 (1.4), present only when the score has [lyrics](#lyrics):

```json
{
  "v": 1,
  "sections": [{ "id": "<instanceId>", "lines": ["…", "…"] }, { "id": "<instanceId>", "lines": [] }]
}
```

- Every section of the score, in playing order, with its `lyrics.lines`.
- It doesn't include the timing. Retiming a song with the same words keeps the `lyricsHash`;
  `timingHash` tells you the sections moved.

Every fixture in [`fixtures/semantics/`](https://github.com/shiehn/sas-arrangement-export-contract/tree/main/export/fixtures/semantics) carries its payloads and hashes.

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

The score (1.2) holds no paths. Its notes are the layers' MIDI, written only when the user asks
(`options.scoreNotes`). Like stems, they are optional.

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

The reference reader and its `sas-export` command, in [`reader/`](https://github.com/shiehn/sas-arrangement-export-contract/tree/main/export/reader), check a file
against the schema of its version and recompute the hashes it carries that its content covers
(`timingHash`, `scoreHash` with a score, and `lyricsHash` with words):

```sh
cd reader && npm install && npm run build
node dist/bin.js validate "My Song - export.json"   # exit 0 when valid, 1 with the errors listed
node dist/bin.js info "My Song - export.json"       # a summary; --json for the export as read
```

From code, `readExport(path)` validates first, then returns the tempo and meter maps, bars,
sections, layers and notes. The contract, with the reader and every fixture, is published at
<https://github.com/shiehn/sas-arrangement-export-contract> (MIT).

With any JSON Schema 2020-12 validator:

```js
import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';

const ajv = new Ajv2020({ allErrors: true });
addFormats(ajv);
const validate = ajv.compile(schema); // the schema of the file's exportVersion
if (!validate(exportJson)) console.log(validate.errors);
```

The `v1` schema (`…/v1/schema.json`) is the latest 1.x. A file of any 1.x version validates
against it, so a reader can use it without picking the file's minor.

Signals & Sorcery's own tests validate the exports it writes against the schema of the
version they declare.
