---
sidebar: auto
---

# API Reference

Complete reference for the `PluginHost` API, the scoped interface that plugins use to interact with Signals & Sorcery. Each plugin receives its own `PluginHost` instance with ownership-scoped access.

Methods described as optional are declared with `?` on `PluginHost` because older hosts may not have them. Check `typeof host.method === 'function'` before calling one.

## Track Management

All track methods are **ownership-scoped**: plugins can only modify tracks they created. Attempting to modify another plugin's track throws a `NOT_OWNED` error.

### createTrack(options)

Create a new track in the active scene.

```typescript
createTrack(options: CreateTrackOptions): Promise<PluginTrackHandle>
```

**Parameters:**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `name` | `string` | auto-generated | Display name for the track |
| `role` | `string` | - | Musical role hint: `'bass'`, `'drums'`, `'lead'`, `'chords'`, `'pad'`, `'arp'`, `'fx'` (see `getValidRoles()` for the full list) |
| `loadSynth` | `boolean` | `false` | Load a synth plugin immediately |
| `synthName` | `string` | `'Surge XT'` | Which synth to load (ignored if `loadSynth` is false) |
| `instrumentPluginId` | `string \| null` | - | Scanned plugin id of a custom instrument to load instead of `synthName` (with `loadSynth: true`) |
| `metadata` | `Record<string, unknown>` | - | Plugin-specific metadata stored in the database |

**Returns:** `PluginTrackHandle` with `id`, `name`, `dbId`, and optional `role`, `prompt`, `instrumentPluginId`, `instrumentName`.

**Errors:** `NO_ACTIVE_SCENE`, `TRACK_LIMIT_EXCEEDED`, `ENGINE_ERROR`

```typescript
const track = await host.createTrack({
  name: 'Bass Line',
  role: 'bass',
  loadSynth: true,
});
// track.id = engine track ID (use for all subsequent operations)
// track.dbId = database row ID
```

---

### deleteTrack(trackId)

Delete a track previously created by this plugin.

```typescript
deleteTrack(trackId: string): Promise<void>
```

**Errors:** `NOT_OWNED`, `TRACK_NOT_FOUND`, `ENGINE_ERROR`

---

### getPluginTracks()

Get all tracks this plugin owns in the active scene.

```typescript
getPluginTracks(): Promise<PluginTrackHandle[]>
```

Returns an empty array if the plugin has no tracks or no scene is active.

---

### getTrackInfo(trackId)

Get detailed info about a specific owned track.

```typescript
getTrackInfo(trackId: string): Promise<PluginTrackInfo>
```

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Engine track ID |
| `name` | `string` | Display name |
| `dbId` | `string` | Database row ID |
| `role` | `string` | Musical role |
| `muted` | `boolean` | Is track muted? |
| `soloed` | `boolean` | Is track soloed? |
| `volume` | `number` | Volume (0.0 – 1.0) |
| `pan` | `number` | Pan (-1.0 left to 1.0 right) |
| `plugins` | `PluginSynthInfo[]` | Loaded synth plugins |
| `hasMidi` | `boolean` | Has MIDI clips? |
| `hasAudio` | `boolean` | Has audio clips? |

**Errors:** `NOT_OWNED`, `TRACK_NOT_FOUND`

---

### setTrackMute(trackId, muted)

```typescript
setTrackMute(trackId: string, muted: boolean): Promise<void>
```

**Errors:** `NOT_OWNED`, `TRACK_NOT_FOUND`

---

### setTrackVolume(trackId, volume)

```typescript
setTrackVolume(trackId: string, volume: number): Promise<void>
```

`volume` is linear: `0.0` (silent) to `1.0` (full).

**Errors:** `NOT_OWNED`, `TRACK_NOT_FOUND`

---

### setTrackPan(trackId, pan)

```typescript
setTrackPan(trackId: string, pan: number): Promise<void>
```

`pan` range: `-1.0` (hard left) to `1.0` (hard right). `0.0` is center.

**Errors:** `NOT_OWNED`, `TRACK_NOT_FOUND`

---

### setTrackName(trackId, name)

```typescript
setTrackName(trackId: string, name: string): Promise<void>
```

**Errors:** `NOT_OWNED`, `TRACK_NOT_FOUND`

---

### setTrackRole(trackId, role)

Persist a track's musical role, for example after an LLM call classifies what you generated. Other features, such as transition generation, read the stored role.

```typescript
setTrackRole(trackId: string, role: string): Promise<void>
```

**Errors:** `NOT_OWNED`, `TRACK_NOT_FOUND`

---

### getValidRoles()

The host's canonical list of role tokens (e.g. `bass`, `lead`, `pad`, `kicks`, `hats`). Use it when building prompts or validating a role before `setTrackRole`; do not ship your own hard-coded list.

```typescript
getValidRoles(): readonly string[]
```

---

### reorderTracks(orderedTrackIds)

Persist this plugin's row order for the active scene. Pass track `dbId`s top to bottom; `getPluginTracks()` then returns tracks in that order across scene switches and reopen. Tracks you leave out keep their natural order at the end. The `useTrackReorder` hook drives drag-and-drop and calls this on drop.

```typescript
reorderTracks(orderedTrackIds: readonly string[]): Promise<void>
```

---

### adoptSceneTracks()

Adopt unowned tracks in the active scene that match this plugin's generator type. Useful when re-activating a plugin or restoring state: tracks that were previously created by a plugin of the same type but currently have no owner will be claimed.

```typescript
adoptSceneTracks(): Promise<PluginTrackHandle[]>
```

**Returns:** Array of `PluginTrackHandle` for all newly adopted tracks. Returns an empty array if no matching unowned tracks are found.

**Errors:** `NO_ACTIVE_SCENE`, `ENGINE_ERROR`

```typescript
// Re-adopt tracks on scene change
async onSceneChanged(sceneId: string | null): Promise<void> {
  if (!sceneId) return;
  const adopted = await this.host.adoptSceneTracks();
  console.log(`Re-adopted ${adopted.length} tracks`);
}
```

---

### setTrackSolo(trackId, solo)

```typescript
setTrackSolo(trackId: string, solo: boolean): Promise<void>
```

**Errors:** `NOT_OWNED`, `TRACK_NOT_FOUND`

```typescript
// Solo a track to preview it in isolation
await host.setTrackSolo(track.id, true);
```

---

### shufflePreset(trackId)

Randomly change the Surge XT preset on an owned track. Reads the track's existing MIDI notes to analyze the pitch range, then selects a random preset from a matching category (e.g., bass notes get bass presets). The current preset is excluded so you always get a different sound.

```typescript
shufflePreset(
  trackId: string,
  excludeNames?: readonly string[],
  options?: ShufflePresetOptions
): Promise<ShufflePresetResult>
```

**Parameters:**

| Field | Type | Description |
|-------|------|-------------|
| `excludeNames` | `readonly string[]` | Preset names to leave out of the pool (e.g. your shuffle history, for no repeats until the pool is used up) |
| `options.description` | `string` | The user's sound description. Hosts with a preset index pick the closest match to it instead of a random preset; others ignore it |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| `presetName` | `string` | Name of the newly applied preset |
| `presetCategory` | `string` | Category the preset was drawn from (e.g., `'basses-low'`) |

**Errors:** `NOT_OWNED`, `PLUGIN_NOT_FOUND` (no Surge XT on track), `ENGINE_ERROR`

```typescript
const result = await host.shufflePreset(track.id);
host.showToast('info', 'New Preset', `${result.presetName} (${result.presetCategory})`);
```

---

### duplicateTrack(trackId)

Create a copy of an owned track. Copies the track's MIDI data and role. A Surge XT track's copy gets a different preset; a custom instrument's copy keeps the source's plugin state. The new track is automatically owned by the calling plugin.

```typescript
duplicateTrack(trackId: string): Promise<PluginTrackHandle>
```

**Returns:** `PluginTrackHandle` for the new track (name will be `"<original>-copy"`, or `"<original>-copy-2"` and so on if that name is taken).

**Errors:** `NOT_OWNED`, `NO_ACTIVE_SCENE`, `TRACK_LIMIT_EXCEEDED`, `ENGINE_ERROR`

```typescript
const copy = await host.duplicateTrack(track.id);
// copy.id = new engine track ID
// copy.name = 'Bass Line-copy'

// Give the copy a different preset
await host.shufflePreset(copy.id);
```

---

## FX Operations

Per-track FX are 3rd-party VST3/AU inserts on the track's plugin chain, placed before Volume & Pan. There is no built-in FX rack — the inserts come from the plugins installed on the user's machine, discovered via `getAvailableFx()` (same `InstrumentDescriptor` shape as `getAvailableInstruments`, filtered to non-instrument plugins). Insert states persist per track and are re-applied when the project reopens.

All FX methods are ownership-scoped and optional — feature-gate on `typeof host.getTrackExternalFx === 'function'`.

### getAvailableFx()

Optional. The FX (non-instrument) plugins scanned on this machine, for an FX picker. Served from a cache; the optional `rescanAvailableFx()` forces a slow re-scan (20 to 60 seconds) when the user installs a plugin mid-session.

```typescript
getAvailableFx(): Promise<InstrumentDescriptor[]>
```

---

### getTrackExternalFx(trackId)

List the track's external FX inserts, in chain order.

```typescript
getTrackExternalFx(trackId: string): Promise<TrackExternalFxEntry[]>
```

**TrackExternalFxEntry:**

| Field | Type | Description |
|-------|------|-------------|
| `index` | `number` | Engine chain index — pass this back to the remove/bypass/move/editor calls. Not contiguous from 0 |
| `pluginId` | `string` | Scanned plugin id (matches `InstrumentDescriptor.pluginId`) |
| `name` | `string` | Display name |
| `enabled` | `boolean` | `false` when bypassed |

**Errors:** `NOT_OWNED`, `TRACK_NOT_FOUND`

```typescript
const inserts = await host.getTrackExternalFx(track.id);
inserts.forEach((fx) => console.log(fx.index, fx.name, fx.enabled));
```

---

### loadTrackExternalFx(trackId, pluginId)

Add an FX plugin to the end of the track's chain. Instrument plugins are rejected.

```typescript
loadTrackExternalFx(trackId: string, pluginId: string): Promise<TrackExternalFxEntry>
```

**Parameters:**

| Field | Type | Description |
|-------|------|-------------|
| `trackId` | `string` | Engine track ID (must be owned) |
| `pluginId` | `string` | Scanned plugin id, from `getAvailableFx()` |

**Returns:** the new insert's `TrackExternalFxEntry`.

**Errors:** `NOT_OWNED`, `TRACK_NOT_FOUND`

```typescript
// Add the first available reverb to a track
const fxList = await host.getAvailableFx();
const reverb = fxList.find((p) => /reverb/i.test(p.name));
if (reverb) {
  const entry = await host.loadTrackExternalFx(track.id, reverb.pluginId);
  console.log('Added at chain index', entry.index);
}
```

---

### removeTrackExternalFx(trackId, fxIndex)

Remove an insert by its `TrackExternalFxEntry.index`.

```typescript
removeTrackExternalFx(trackId: string, fxIndex: number): Promise<void>
```

**Errors:** `NOT_OWNED`, `TRACK_NOT_FOUND`

---

### setTrackExternalFxEnabled(trackId, fxIndex, enabled)

Bypass (or un-bypass) an insert without removing it.

```typescript
setTrackExternalFxEnabled(trackId: string, fxIndex: number, enabled: boolean): Promise<void>
```

**Errors:** `NOT_OWNED`, `TRACK_NOT_FOUND`

```typescript
// Bypass the first insert
const [first] = await host.getTrackExternalFx(track.id);
await host.setTrackExternalFxEnabled(track.id, first.index, false);
```

---

### moveTrackExternalFx(trackId, fromFxIndex, toFxIndex)

Move an insert to another slot in the chain (drag-to-reorder). Both indices are `TrackExternalFxEntry.index` values, with splice semantics — the FX lands *at* `toFxIndex`. Only external inserts are movable or valid landing slots (never the instrument). Feature-gate on `typeof host.moveTrackExternalFx === 'function'`.

```typescript
moveTrackExternalFx(trackId: string, fromFxIndex: number, toFxIndex: number): Promise<void>
```

**Errors:** `NOT_OWNED`, `TRACK_NOT_FOUND`

---

### showTrackExternalFxEditor(trackId, fxIndex)

Open the native editor window for an insert.

```typescript
showTrackExternalFxEditor(trackId: string, fxIndex: number): Promise<void>
```

**Errors:** `NOT_OWNED`, `TRACK_NOT_FOUND`

---

### copyTrackFxFrom(destTrackId, sourceTrackDbId)

Copy a source track's whole FX chain (external inserts with their states) onto an owned track. The source is addressed by DB row id and may live in another scene; only the destination is ownership-asserted. Partial success is normal — third-party plugins missing from this machine land in `externalMissing` while everything else still copies. Feature-gate on `typeof host.copyTrackFxFrom === 'function'`.

```typescript
copyTrackFxFrom(destTrackId: string, sourceTrackDbId: string): Promise<TrackFxCopyResult>
```

**TrackFxCopyResult:**

| Field | Type | Description |
|-------|------|-------------|
| `builtIn` | `string[]` | Always empty since SDK 3.0.0 (the built-in FX system was removed); retained for wire-shape compatibility |
| `externalCopied` | `number` | External inserts successfully rebuilt on the destination |
| `externalMissing` | `string[]` | Plugin names that failed to load (missing from this machine) |

**Errors:** `NOT_OWNED`, `TRACK_NOT_FOUND`

---

## Panel Mix Bus

Each plugin can have one mix bus per scene: a fader, mute, solo and an FX chain on the sum of its tracks, shown as a strip at the top of the panel. The host methods (`getPanelBusState`, `setPanelBusVolume`, `setPanelBusMute`, `setPanelBusSolo`, `loadPanelBusFx`, `removePanelBusFx`, `setPanelBusFxEnabled`, `movePanelBusFx`, `showPanelBusFxEditor`, `disengagePanelBus`) are optional and scoped to this plugin: a panel can never reach another panel's bus.

Most panels do not call them directly. The `usePanelBus` hook reads and updates the bus (and recovers on its own if the first read fails during a slow project load), and `PanelMasterStrip` renders it:

```tsx
import { usePanelBus, PanelMasterStrip } from '@signalsandsorcery/plugin-sdk';

const bus = usePanelBus(host, activeSceneId);

// After creating a track, and at the end of reloading your tracks,
// so new tracks join the bus right away (SDK 3.19.0):
bus.notifyTracksChanged();

// In your render: `supported` is false on hosts without the bus surface
{bus.supported && bus.bus && (
  <div ref={bus.meterVisibilityRef}>
    <PanelMasterStrip
      bus={bus.bus}
      levels={bus.levels}
      availableFx={bus.availableFx}
      fxLoading={bus.fxLoading}
      fxPickerOpen={bus.fxPickerOpen}
      onToggleFxPicker={bus.setFxPickerOpen}
      onRefreshFx={bus.refreshFx}
      onVolumeChange={bus.onVolumeChange}
      onMuteToggle={bus.onMuteToggle}
      onSoloToggle={bus.onSoloToggle}
      onAddFx={bus.onAddFx}
      onRemoveFx={bus.onRemoveFx}
      onToggleFxEnabled={bus.onToggleFxEnabled}
      onShowFxEditor={bus.onShowFxEditor}
    />
  </div>
)}
```

`notifyTracksChanged` has a stable identity, coalesces repeated calls, and does nothing on hosts without the bus surface. The `meterVisibilityRef` wrapper lets the hook stop metering while the strip is off screen.

**PanelBusState:**

| Field | Type | Description |
|-------|------|-------------|
| `engaged` | `boolean` | `false` when the panel has no bus in this scene (flat routing) |
| `volume` | `number` | Bus fader in dB (`0` = unity) |
| `muted` | `boolean` | Bus mute |
| `soloed` | `boolean` | Bus solo |
| `fx` | `PanelBusFxEntry[]` | Bus FX chain, same shape as `TrackExternalFxEntry` |

---

## MIDI Operations

### writeMidiClip(trackId, clip)

Write MIDI notes to a track. Replaces any existing MIDI on the track.

```typescript
writeMidiClip(trackId: string, clip: MidiClipData): Promise<MidiWriteResult>
```

**MidiClipData:**

| Field | Type | Description |
|-------|------|-------------|
| `startTime` | `number` | Clip start time in seconds |
| `endTime` | `number` | Clip end time in seconds |
| `tempo` | `number` | BPM for beat/time conversion |
| `notes` | `PluginMidiNote[]` | Array of MIDI notes |

**PluginMidiNote:**

| Field | Type | Description |
|-------|------|-------------|
| `pitch` | `number` | MIDI pitch 0–127 |
| `startBeat` | `number` | Start position in quarter-note beats (0 = clip start) |
| `durationBeats` | `number` | Duration in quarter-note beats |
| `velocity` | `number` | Velocity 1–127 |
| `channel` | `number` | MIDI channel 0–15 (default: 0) |
| `slide` | `boolean` | Optional. The note deliberately overlaps the next one (a 303-style glide); `postProcessMidi` keeps that overlap instead of trimming it |

**Returns:** `MidiWriteResult` with `notesInserted` count and actual `bars` covered.

**Errors:** `NOT_OWNED`, `TRACK_NOT_FOUND`, `INVALID_MIDI`

```typescript
await host.writeMidiClip(track.id, {
  startTime: 0,
  endTime: 8,         // 8 seconds
  tempo: 120,
  notes: [
    { pitch: 60, startBeat: 0, durationBeats: 1, velocity: 100 },
    { pitch: 64, startBeat: 1, durationBeats: 1, velocity: 90 },
    { pitch: 67, startBeat: 2, durationBeats: 1, velocity: 95 },
    { pitch: 72, startBeat: 3, durationBeats: 0.5, velocity: 80 },
  ],
});
```

---

### clearMidi(trackId)

Clear all MIDI from a track.

```typescript
clearMidi(trackId: string): Promise<void>
```

**Errors:** `NOT_OWNED`, `TRACK_NOT_FOUND`

---

### readMidiNotes(trackId)

Optional. Read a track's current MIDI for in-place editing (e.g. a piano roll). Returns every clip with beat-based notes in the same shape as `MidiClipData.notes`; an empty `clips` array means the track has no MIDI. Write edits back with the clip's own `startTime`/`endTime` so the clip length never changes.

```typescript
readMidiNotes(trackId: string): Promise<ReadMidiResult>
// ReadMidiResult = { clips: Array<{ startTime: number; endTime: number; notes: PluginMidiNote[] }> }
```

**Errors:** `NOT_OWNED`, `TRACK_NOT_FOUND`

---

### postProcessMidi(notes, options)

Run the host's MIDI post-processing pipeline: quantize, swing, scale enforcement, register clamping, overlap removal, and humanization.

```typescript
postProcessMidi(notes: PluginMidiNote[], options: PostProcessOptions): Promise<PluginMidiNote[]>
```

**PostProcessOptions:**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `quantize` | `boolean` | `true` | Snap notes to grid |
| `quantizeGrid` | `string` | `'1/16'` | Grid size: `'1/4'`, `'1/8'`, `'1/16'`, `'1/32'`, `'1/8T'`, `'1/16T'` |
| `quantizeStrength` | `number` | `75` | Quantize strength 0–100 |
| `swing` | `number` | `0` | Swing amount 0–100 |
| `humanize` | `number` | `0` | Timing/velocity variation 0–100 |
| `enforceScale` | `boolean` | `false` | Enforce diatonic scale (uses scene key/mode) |
| `clampRegister` | `[number, number]` | - | Clamp note pitches to `[low, high]` range |
| `removeOverlaps` | `boolean` | `true` | Remove overlapping notes on same pitch/channel |

```typescript
const raw = generateNotes();
const processed = await host.postProcessMidi(raw, {
  quantize: true,
  quantizeGrid: '1/8',
  swing: 30,
  humanize: 15,
  enforceScale: true,
});
await host.writeMidiClip(track.id, { ...clip, notes: processed });
```

---

### auditionNote(trackId, pitch, velocity, durationMs)

Play a single note on a track for preview. Fire-and-forget; it does not record.

```typescript
auditionNote(trackId: string, pitch: number, velocity: number, durationMs: number): Promise<void>
```

---

## Audio Operations

### writeAudioClip(trackId, filePath, position?)

Place an audio file on a track.

```typescript
writeAudioClip(trackId: string, filePath: string, position?: number): Promise<void>
```

**Errors:** `NOT_OWNED`, `TRACK_NOT_FOUND`, `FILE_NOT_FOUND`, `INVALID_FORMAT`

---

### generateAudioTexture(request)

Invoke the host's audio texture generation pipeline.

```typescript
generateAudioTexture(request: PluginAudioTextureRequest): Promise<PluginAudioTextureResult>
```

**PluginAudioTextureRequest:**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `prompt` | `string` | - | Text description of the desired audio |
| `durationSeconds` | `number` | scene length | Duration in seconds |
| `bpm` | `number` | project BPM | Target BPM |

**Returns:** `PluginAudioTextureResult` with `filePath`, `durationSeconds`, and `cuePoints` (detected beat positions, or `null`; store them with `setCuePoints` after writing the clip).

---

## Stem Splitting

### splitStems(trackId)

Split an audio track into separate stems (vocals, drums, bass, other). Creates new muted tracks for each stem.

| Param | Type | Description |
|-------|------|-------------|
| `trackId` | `string` | Engine track ID of the audio track to split |

**Returns:** `PluginStemSplitResult`

```typescript
interface PluginStemSplitResult {
  stems: PluginStemTrackInfo[];
}

interface PluginStemTrackInfo {
  stemType: 'vocals' | 'drums' | 'bass' | 'other';
  track: PluginTrackHandle;
}
```

```typescript
const result = await host.splitStems(audioTrack.id);
for (const stem of result.stems) {
  console.log(`Created ${stem.stemType} track: ${stem.track.id}`);
  // Stems are auto-muted; unmute the ones you want
  await host.setTrackMute(stem.track.id, false);
}
```

### isStemSplitterAvailable()

Check if the stem splitter binary is available on the system.

**Returns:** `Promise<boolean>`

```typescript
const available = await host.isStemSplitterAvailable();
if (!available) {
  host.showToast('warning', 'Stem splitter not installed');
}
```

---

## Plugin/Synth Operations

### loadSynthPlugin(trackId, pluginName)

Load a VST3 or AudioUnit plugin onto a track.

```typescript
loadSynthPlugin(trackId: string, pluginName: string): Promise<number>
```

**Returns:** Plugin index (for use with `setPluginState`, `getPluginState`, `removePlugin`).

**Errors:** `NOT_OWNED`, `TRACK_NOT_FOUND`, `PLUGIN_NOT_FOUND`

---

### setPluginState(trackId, pluginIndex, stateBase64)

Set plugin state using base64-encoded preset data.

```typescript
setPluginState(trackId: string, pluginIndex: number, stateBase64: string): Promise<void>
```

---

### getPluginState(trackId, pluginIndex)

Get current plugin state as a base64-encoded string.

```typescript
getPluginState(trackId: string, pluginIndex: number): Promise<string>
```

---

### setRawPluginState / getRawPluginState

Like `setPluginState` / `getPluginState`, but in the plugin's own VST3/AU state format. Use these for third-party instruments whose patches do not survive the default format; Surge XT presets use `setPluginState`.

```typescript
setRawPluginState(trackId: string, pluginIndex: number, stateBase64: string): Promise<void>
getRawPluginState(trackId: string, pluginIndex: number): Promise<string>
```

---

### getTrackPlugins(trackId)

List plugins loaded on a track.

```typescript
getTrackPlugins(trackId: string): Promise<PluginSynthInfo[]>
```

**PluginSynthInfo:**

| Field | Type | Description |
|-------|------|-------------|
| `index` | `number` | Plugin slot index |
| `name` | `string` | Plugin name |
| `type` | `string` | `'VST3'`, `'AudioUnit'`, or `'Internal'` |
| `enabled` | `boolean` | Whether the plugin is active |

---

### removePlugin(trackId, pluginIndex)

Remove a plugin from a track.

```typescript
removePlugin(trackId: string, pluginIndex: number): Promise<void>
```

---

### isPluginAvailable(pluginName)

Check if a VST3/AU plugin is installed on the system.

```typescript
isPluginAvailable(pluginName: string): Promise<boolean>
```

---

## Instrument Plugin Selection

Let users swap a track's instrument for any scanned VST3/AU synth.

```typescript
getAvailableInstruments(): Promise<InstrumentDescriptor[]>
getTrackInstrument(trackId: string): Promise<InstrumentDescriptor | null> // null = default (Surge XT)
setTrackInstrument(trackId: string, pluginId: string): Promise<void>      // keeps the track's MIDI
showInstrumentEditor(trackId: string): Promise<void>                      // native editor window
hideInstrumentEditor(trackId: string): Promise<void>
```

The track methods are ownership-scoped (**Errors:** `NOT_OWNED`, `TRACK_NOT_FOUND`).

**InstrumentDescriptor** (also returned by `getAvailableFx`):

| Field | Type | Description |
|-------|------|-------------|
| `pluginId` | `string` | Stable plugin id (VST3 TUID or AU component id); pass it to `setTrackInstrument` or `loadTrackExternalFx` |
| `name` | `string` | Display name |
| `manufacturer` | `string` | Plugin manufacturer |
| `type` | `'vst3' \| 'au' \| 'vst' \| 'internal'` | Plugin format |
| `category` | `string` | Category from the scan |
| `missing` | `boolean` | Optional. `true` when the plugin is no longer installed |

---

## Scene Context

### getGenerationContext(excludeTrackId?, opts?)

Get the full generation context for the active scene, including concurrent track MIDI data. Use `excludeTrackId` to omit the current track's data (common when generating for that track). Pass `opts.pinTrackDbIds` to always include those tracks in full as reference material (e.g. "write a counterpart to these"); other tracks share a note budget and may be trimmed.

```typescript
getGenerationContext(
  excludeTrackId?: string,
  opts?: { pinTrackDbIds?: readonly string[] }
): Promise<PluginGenerationContext>
```

**PluginGenerationContext:**

| Field | Type | Description |
|-------|------|-------------|
| `chordProgression` | `object` | Key (`tonic`, `mode`), `chordsWithTiming`, `genre` |
| `concurrentTracks` | `PluginConcurrentTrackInfo[]` | Other tracks with their MIDI, organized by chord |
| `truncatedTrackCount` | `number` | Optional. Tracks dropped entirely to fit the note budget; tell the model its context is partial |

```typescript
const ctx = await host.getGenerationContext(myTrack.id);
// ctx.chordProgression.key = { tonic: 'C', mode: 'minor' }
// ctx.concurrentTracks[0].notesByChord[0].chord = 'Cm7'
```

---

### getMusicalContext()

Lightweight musical context without concurrent track data.

```typescript
getMusicalContext(): Promise<MusicalContext>
```

**MusicalContext:**

| Field | Type | Description |
|-------|------|-------------|
| `key` | `string` | Tonic: `'C'`, `'D'`, `'Eb'`, `'F#'`, etc. |
| `mode` | `string` | `'major'`, `'minor'`, `'dorian'`, `'mixolydian'`, etc. |
| `bpm` | `number` | Beats per minute (20–960) |
| `bars` | `number` | Scene length in bars |
| `genre` | `string \| null` | Genre hint: `'Drum & Bass'`, `'Lo-fi Hip Hop'`, etc. |
| `timeSignature` | `string` | The scene's meter: `'4/4'`, `'3/4'`, `'6/8'` |
| `chordProgression` | `PluginChordTiming[]` | Chord symbols with quarter-note timing |
| `contractPrompt` | `string \| null` | The scene's natural-language direction (e.g. `"dark psytrance, driving"`), or `null` if none is set |

---

### getActiveSceneId()

Get the currently active scene ID. Returns `null` if no scene is selected.

```typescript
getActiveSceneId(): string | null
```

---

### getSceneList()

Get all scenes in the project.

```typescript
getSceneList(): Promise<PluginSceneInfo[]>
```

**PluginSceneInfo:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Scene UUID |
| `name` | `string` | Scene name |
| `isMuted` | `boolean` | Whether the scene is muted |

---

## Transport & Events

### onTrackStateChange(listener)

Subscribe to real-time track state changes (mute, solo, volume, pan). The listener fires whenever the engine reports a state change for any track owned by this plugin. Returns an unsubscribe function.

```typescript
onTrackStateChange(listener: TrackStateChangeListener): UnsubscribeFn
```

**`TrackStateChangeListener`** is `(trackId: string, state: PluginTrackRuntimeState) => void`.

**PluginTrackRuntimeState:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Engine track ID |
| `muted` | `boolean` | Whether the track is muted |
| `solo` | `boolean` | Whether the track is soloed |
| `volume` | `number` | Volume level (0.0 – 1.0) |
| `pan` | `number` | Pan position (-1.0 left – 1.0 right) |

```typescript
const unsub = host.onTrackStateChange((trackId, state) => {
  console.log(`Track ${trackId}: muted=${state.muted}, volume=${state.volume}`);
  // Update your UI state accordingly
});

// Later: clean up
unsub();
```

---

### onTransportEvent(listener)

Subscribe to transport state changes (play, stop, BPM changes).

```typescript
onTransportEvent(listener: TransportEventListener): UnsubscribeFn
```

**TransportEvent:**

| Field | Type | Description |
|-------|------|-------------|
| `type` | `string` | `'play'`, `'stop'`, `'pause'`, `'bpmChange'`, `'positionChange'` |
| `bpm` | `number` | Current BPM (on `bpmChange`) |
| `position` | `number` | Position in seconds |
| `isPlaying` | `boolean` | Whether transport is playing |

```typescript
const unsub = host.onTransportEvent((event) => {
  if (event.type === 'bpmChange') {
    console.log('New BPM:', event.bpm);
  }
});

// Later: clean up
unsub();
```

---

### onDeckBoundary(listener)

Subscribe to deck loop boundary events, fired when a deck loops back to the start.

```typescript
onDeckBoundary(listener: DeckBoundaryListener): UnsubscribeFn
```

**DeckBoundaryEvent:**

| Field | Type | Description |
|-------|------|-------------|
| `deckId` | `string` | `'loop-a'` or `'loop-b'` |
| `bar` | `number` | Current bar number (1-based) |
| `beat` | `number` | Current beat within bar (1-based) |
| `loopCount` | `number` | How many loops completed |

---

### onSceneChange(listener)

Subscribe to scene change events.

```typescript
onSceneChange(listener: SceneChangeListener): UnsubscribeFn
```

Listener receives the new scene ID (`string`) or `null` if no scene is active.

---

### getTransportState()

Get a one-shot snapshot of the current transport state.

```typescript
getTransportState(): Promise<PluginTransportState>
```

**PluginTransportState:**

| Field | Type | Description |
|-------|------|-------------|
| `isPlaying` | `boolean` | Transport is playing |
| `isPaused` | `boolean` | Transport is paused |
| `bpm` | `number` | Current BPM |
| `position` | `number` | Position in seconds |
| `timeSignature` | `string` | e.g., `'4/4'` |

---

### onEngineReady(listener)

Subscribe to the engine-ready event, fired when the engine finishes loading tracks (after a scene change or a project load). A good place to re-read your tracks, for example with `adoptSceneTracks()`.

```typescript
onEngineReady(listener: () => void): UnsubscribeFn
```

---

## LLM Access

LLM methods are metered and require authentication. Check availability before use. The generation methods also require `"requiresLLM": true` in the manifest's `capabilities` (otherwise they throw `CAPABILITY_DENIED`).

### generateWithLLM(request)

Generate text or JSON via the host's authenticated LLM service. By default the host prefixes your `user` prompt with the scene's musical context (key, BPM, chords, genre, direction).

```typescript
generateWithLLM(request: LLMGenerationRequest): Promise<LLMGenerationResult>
```

**LLMGenerationRequest:**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `system` | `string` | - | System prompt (instructions, role, output format) |
| `user` | `string` | - | User prompt (the actual request) |
| `maxTokens` | `number` | host default | Max tokens for response (host may cap) |
| `responseFormat` | `string` | `'text'` | `'text'` or `'json'` |
| `skipContextPrefix` | `boolean` | `false` | Set `true` to send your prompt without the musical-context prefix |
| `thinkingLevel` | `'LOW' \| 'HIGH'` | host policy (low) | Reasoning depth. Leave unset; use `'HIGH'` only for genuinely hard multi-part problems (much slower) |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| `content` | `string` | Response text (parse as JSON if `responseFormat` was `'json'`) |
| `tokensUsed` | `number` | Tokens consumed |
| `model` | `string` | Model that generated the response |

**Errors:** `NOT_AUTHENTICATED`, `LLM_UNAVAILABLE`, `LLM_BUDGET_EXCEEDED`

```typescript
if (await host.isLLMAvailable()) {
  const result = await host.generateWithLLM({
    system: 'You are a music theory assistant. Return JSON.',
    user: `Suggest a chord progression in ${context.key} ${context.mode}`,
    responseFormat: 'json',
    maxTokens: 500,
  });
  const chords = JSON.parse(result.content);
}
```

---

### isLLMAvailable()

Check if LLM access is available (user authenticated and gateway reachable).

```typescript
isLLMAvailable(): Promise<boolean>
```

---

### generateWithLLMTools(request)

Generate with native tool calling (function calling), for plugins that run an agent loop: the model asks for tool calls, you run them and send the results back on the next turn. The request and response mirror Gemini's `generateContent` shape (`contents`, `systemInstruction`, `tools`, `toolConfig`, `generationConfig`; the response has `candidates` and `usageMetadata`). The host adds credentials; your plugin never sees an API key.

```typescript
generateWithLLMTools(request: LLMToolUseRequest): Promise<LLMToolUseResponse>
```

Choose the model with a **role**, not a model id. The host maps each role to its current model, so a model upgrade never needs a plugin change (SDK 3.17.0):

| Role | Use for |
|------|---------|
| `LLM_MODEL.BEST` | MIDI and counterpoint generation, agent tool use |
| `LLM_MODEL.LIGHTWEIGHT` | Cheap, fast work: classification, summaries |

```typescript
import { LLM_MODEL } from '@signalsandsorcery/plugin-sdk';

const response = await host.generateWithLLMTools({
  model: LLM_MODEL.BEST,
  systemInstruction: { parts: [{ text: 'You arrange drum parts.' }] },
  contents: [{ role: 'user', parts: [{ text: 'Add a fill in bar 4' }] }],
  tools: [{ functionDeclarations: [/* your tools */] }],
});
const parts = response.candidates[0]?.content.parts ?? [];
```

When you replay a model turn that contains a `functionCall`, send it back unchanged (including `thoughtSignature`), or the request is rejected.

---

## Agent Actions and Skills

Agents (the in-app chat, the `sas` CLI and MCP clients) can use your plugin in two ways.

### getSkills(): actions

An optional `GeneratorPlugin` method that declares **actions**: tools an agent can call. Each is registered as `plugin:<pluginId>:<id>`. `PluginAction` is an alias of the `PluginSkill` type.

```typescript
getSkills?(): PluginSkill[]
// PluginSkill = { id: string; description: string; inputSchema: { type: 'object'; properties?; required? }; isReadOnly?: boolean }
```

The `description` is what the model reads to decide when to call the action, so make it specific.

### getAgentSkills(): knowledge

An optional `GeneratorPlugin` method (SDK 3.20.0) that contributes **agent skills**: markdown know-how that tells an agent how to do a musical task well and which of your actions carry it out. Agents list skills by name and description and load a body only when a request needs it. The current Signals & Sorcery app does not load plugin agent skills yet; hosts that don't support them ignore the method, so it is safe to implement now.

```typescript
getAgentSkills?(): PluginAgentSkill[]
```

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | kebab-case, unique across all skills (prefix it with your domain, e.g. `'bass-voices'`) |
| `description` | `string` | One line, at most 200 characters |
| `body` | `string` | Markdown, at most 12,000 characters. Write `{{action:<id>}}` to refer to one of your actions; the host rewrites it to the registered tool name |
| `whenToUse`, `category`, `tags`, `genres`, `roles` | optional | Help agents find the skill |
| `relatedActions` | `string[]` | Optional. Ids of your actions the body relies on |

A plugin may contribute up to 8 skills (`AGENT_SKILL_LIMITS`). Check them in a test:

```typescript
import { validatePluginAgentSkills } from '@signalsandsorcery/plugin-sdk';

expect(validatePluginAgentSkills(plugin.getAgentSkills(), {
  actionIds: plugin.getSkills().map((a) => a.id),
})).toEqual([]);
```

The host side is `host.listAgentSkills()` (metadata of every installed skill) and `host.readAgentSkill(name)` (one skill with its body). Both are optional.

---

## Preset System

### getPresetCategories(pluginName)

Get available preset categories for a synth plugin (e.g., Surge XT).

```typescript
getPresetCategories(pluginName: string): Promise<string[]>
```

---

### getRandomPreset(category)

Get a random preset from a category.

```typescript
getRandomPreset(category: string): Promise<PluginPresetData | null>
```

---

### getPresetByName(category, name)

Get a specific preset by name.

```typescript
getPresetByName(category: string, name: string): Promise<PluginPresetData | null>
```

---

### classifyPresetCategory(description)

Use LLM to classify a text description into a preset category.

```typescript
classifyPresetCategory(description: string): Promise<string>
```

```typescript
const category = await host.classifyPresetCategory('warm analog pad');
const preset = await host.getRandomPreset(category);
if (preset) {
  await host.setPluginState(track.id, 0, preset.state);
}
```

---

## Plugin Presets

Plugin-specific presets (distinct from synth presets). These store your plugin's custom configurations.

### getPluginPresets(category?)

```typescript
getPluginPresets(category?: string): Promise<PluginPresetInfo[]>
```

---

### savePluginPreset(options)

```typescript
savePluginPreset(options: SavePluginPresetOptions): Promise<PluginPresetInfo>
```

**SavePluginPresetOptions:**

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | Preset name |
| `category` | `string` | Optional category |
| `data` | `Record<string, unknown>` | Preset data to store |

---

### deletePluginPreset(id)

```typescript
deletePluginPreset(id: string): Promise<void>
```

---

## Data Persistence

### Scene-Scoped Data

Per-scene data is tied to a specific scene. Use for track configurations, generation parameters, etc.

```typescript
getSceneData<T = unknown>(sceneId: string, key: string): Promise<T | null>
setSceneData(sceneId: string, key: string, value: unknown): Promise<void>
getAllSceneData(sceneId: string): Promise<Record<string, unknown>>
deleteSceneData(sceneId: string, key: string): Promise<void>
```

```typescript
// Save pattern config for this scene
await host.setSceneData(sceneId, 'pattern', { steps: 16, pulses: 5 });

// Restore on scene change
const config = await host.getSceneData<PatternConfig>(sceneId, 'pattern');
```

---

### Project-Scoped Data

Project-wide data persists across scenes.

```typescript
getProjectData<T = unknown>(key: string): Promise<T | null>
setProjectData(key: string, value: unknown): Promise<void>
```

---

### Global Settings

Global settings persist across projects. Managed via `host.settings`:

```typescript
interface PluginSettingsStore {
  get<T>(key: string, defaultValue: T): T;
  set(key: string, value: unknown): void;
  getAll(): Record<string, unknown>;
  onChange(listener: (key: string, value: unknown) => void): UnsubscribeFn;
}
```

```typescript
const density = host.settings.get<number>('density', 4);
host.settings.set('density', 8);
```

---

### Data Directory

Get the absolute path to the plugin's isolated data directory on disk.

```typescript
getDataDirectory(): string
```

---

## File System

`showOpenDialog` and `showSaveDialog` require the `fileDialog` capability in the manifest. `downloadFile` requires the URL's host in `network.allowedHosts`. `importFile` needs no capability.

### scanInstrumentLibrary(root, opts?)

*Optional (SDK 3.21.0).* The host scans an instrument pack root once and caches the
result: one call instead of a `listAudioFiles` walk plus a `readTextFile` per prompt and
per manifest (a large pack has tens of thousands of files).

```typescript
scanInstrumentLibrary?(root: string, opts?: { refresh?: boolean }): Promise<InstrumentLibraryScan>
```

The cache is per `root` and survives renderer reloads; it follows the pack's
`_pack-version.json` version (or the category folders' change times when there is none).
Pass `refresh: true` to scan again, for example after reinstalling the same version.

**InstrumentLibraryScan:**

| Field | Type | Description |
|-------|------|-------------|
| `root` | `string` | The scanned root |
| `version` | `string` | `_pack-version.json`'s version (`''` when there is none) |
| `flat` | `InstrumentLibraryFlatEntry[]` | Samples directly under a category: `{ categoryId, filename, prompt }` (`prompt` is the sibling `.txt`, or `null`) |
| `folders` | `InstrumentLibraryFolderEntry[]` | `<category>/<subdir>/manifest.json` folders: `{ categoryId, subdir, manifest, error? }` |

`manifest` holds the fields the instrument plugin uses (`schema_version`, `instrument_id`,
`category_display`, `open_ended`, `prompt`, `zones[]` of `{ sample, root_midi, min_midi,
max_midi }`), trimmed but **not validated**, so keep your own checks. It is `null` (with
`error`) when the file is missing or isn't valid JSON; one bad folder never fails the
scan. Paths with a `_`-prefixed segment are skipped.

Hosts older than 3.21.0 don't have this method: feature-detect it and fall back to
`listAudioFiles` + `readTextFile`.

```typescript
const scan = host.scanInstrumentLibrary
  ? await host.scanInstrumentLibrary(root)
  : await myOwnWalk(root); // listAudioFiles + readTextFile
```

---

### showOpenDialog(options)

Show a native file open dialog.

```typescript
showOpenDialog(options: PluginFileDialogOptions): Promise<string[] | null>
```

Returns `null` if the user cancels.

**PluginFileDialogOptions:**

| Field | Type | Description |
|-------|------|-------------|
| `title` | `string` | Dialog title |
| `defaultPath` | `string` | Starting directory |
| `filters` | `Array<{ name, extensions }>` | File type filters |
| `multiSelections` | `boolean` | Allow selecting multiple files |
| `directories` | `boolean` | Allow selecting directories |

---

### showSaveDialog(options)

Show a native file save dialog.

```typescript
showSaveDialog(options: PluginFileDialogOptions): Promise<string | null>
```

---

### downloadFile(url, filename, options?)

Download a file to the plugin's data directory.

```typescript
downloadFile(url: string, filename: string, options?: PluginDownloadOptions): Promise<string>
```

Returns the absolute path to the downloaded file. `PluginDownloadOptions`: `headers`, `overwrite` (default `false`), `timeoutMs` (default `120000`).

**Errors:** `CAPABILITY_DENIED` (if the host is not in `allowedHosts`)

---

### importFile(sourcePath, destFilename)

Copy a file into the plugin's data directory.

```typescript
importFile(sourcePath: string, destFilename: string): Promise<string>
```

---

## Network

Requires the `network` capability with `allowedHosts` in the manifest.

### httpRequest(options)

Make an HTTP request to an allowed host.

```typescript
httpRequest(options: PluginHttpRequestOptions): Promise<PluginHttpResponse>
```

**PluginHttpRequestOptions:**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `url` | `string` | - | Full URL (host must be in `allowedHosts`) |
| `method` | `string` | `'GET'` | `'GET'`, `'POST'`, `'PUT'`, `'DELETE'`, `'PATCH'` |
| `headers` | `Record<string, string>` | - | Request headers |
| `body` | `string \| Record<string, unknown>` | - | Request body |
| `timeoutMs` | `number` | `30000` | Timeout in milliseconds |

**Returns:** `PluginHttpResponse` with `status`, `statusText`, `headers`, and `body`.

**Errors:** `CAPABILITY_DENIED` (if host not in allowedHosts)

---

## Secure Storage

Secrets are encrypted using the OS keychain (Electron safeStorage) and scoped per plugin. Plugin A cannot access plugin B's secrets.

### storeSecret(key, value)

```typescript
storeSecret(key: string, value: string): Promise<void>
```

### getSecret(key)

```typescript
getSecret(key: string): Promise<string | null>
```

### deleteSecret(key)

```typescript
deleteSecret(key: string): Promise<void>
```

---

## Sample Library

### getSamples(filter?)

Query the sample library.

```typescript
getSamples(filter?: PluginSampleFilter): Promise<PluginSampleInfo[]>
```

**PluginSampleFilter:**

| Field | Type | Description |
|-------|------|-------------|
| `bpm` | `number` | Filter by BPM |
| `key` | `{ tonic, mode? }` | Filter by musical key |
| `category` | `string` | Filter by category |
| `searchQuery` | `string` | Text search |

---

### getSampleById(id)

```typescript
getSampleById(id: string): Promise<PluginSampleInfo | null>
```

---

### importSamples(filePaths)

Import audio files into the sample library.

```typescript
importSamples(filePaths: string[]): Promise<PluginSampleImportResult>
```

**Returns:** `{ imported: number, skipped: number, errors: string[], samples?: PluginImportedSample[] }`

`imported` counts files already in the library too. `samples` (hosts on SDK 3.18.0 or later) lists each imported file in input order as `{ id, sourcePath, duplicate }`, where `duplicate` is `true` if the file was already in the library. Check `result.samples !== undefined` before relying on it.

---

### createSampleTrack(sampleId, options?)

Create a sample track in the active scene.

```typescript
createSampleTrack(sampleId: string, options?: { name?: string }): Promise<PluginTrackHandle>
```

---

### deleteSampleTrack(trackId)

```typescript
deleteSampleTrack(trackId: string): Promise<void>
```

---

### getPluginSampleTracks()

Get all sample tracks in the active scene, re-establishing ownership. Returns track handles paired with their sample metadata.

```typescript
getPluginSampleTracks(): Promise<PluginSampleTrackInfo[]>
```

**PluginSampleTrackInfo:**

| Field | Type | Description |
|-------|------|-------------|
| `track` | `PluginTrackHandle` | Track handle (`id`, `name`, `dbId`, `role`) |
| `sample` | `PluginSampleInfo` | Associated sample metadata |
| `volume` | `number` | Track volume (0.0 – 1.0) |
| `pan` | `number` | Track pan (-1.0 left – 1.0 right) |

```typescript
const sampleTracks = await host.getPluginSampleTracks();
for (const st of sampleTracks) {
  console.log(`${st.track.name} → ${st.sample.filename} (vol: ${st.volume})`);
}
```

---

### timeStretchSample(sampleId, targetBpm)

Time-stretch a sample to a target BPM. Returns the new sample's info.

```typescript
timeStretchSample(sampleId: string, targetBpm: number): Promise<PluginSampleInfo>
```

---

### fitSampleToScene(sampleId)

Fit a sample to the active scene: stretch it to the scene's BPM, then chop or loop it so the clip is exactly the scene's length. Results are cached, so repeat calls are instant. 4/4 scenes only; other meters throw `TIME_SIGNATURE_UNSUPPORTED`.

```typescript
fitSampleToScene(sampleId: string): Promise<PluginSampleInfo>
```

---

### previewSample(filePath) / stopPreview()

Audition an audio file without creating a track. A new `previewSample` call replaces the current preview; `stopPreview` is safe to call when nothing is playing.

```typescript
previewSample(filePath: string): Promise<void>
stopPreview(): Promise<void>
```

---

## Notifications & Progress

### showToast(type, title, message?)

Show a toast notification.

```typescript
showToast(type: 'info' | 'success' | 'warning' | 'error', title: string, message?: string): void
```

---

### setProgress(trackId, progress)

**Deprecated.** Still callable, but nothing in the app shows it. For a busy indicator use the `onLoading` prop from `PluginUIProps` (a spinner in the accordion header) or render your own progress UI.

```typescript
setProgress(trackId: string, progress: number): void
```

---

### setStatusMessage(message)

**Deprecated.** Still callable, but nothing in the app shows it. Use `showToast()` or your own status text.

```typescript
setStatusMessage(message: string | null): void
```

---

### confirmAction(title, message)

Show a confirmation modal dialog. Returns `true` if the user confirms.

```typescript
confirmAction(title: string, message: string): Promise<boolean>
```

---

## Performance / Logging

### logMetric(name, durationMs, metadata?)

Log a performance metric.

```typescript
logMetric(name: string, durationMs: number, metadata?: Record<string, unknown>): void
```

---

### startTimer(name)

Start a timer. Returns a stop function that automatically calls `logMetric()`.

```typescript
startTimer(name: string): () => void
```

```typescript
const stop = host.startTimer('pattern-generation');
const notes = generatePattern(steps, pulses);
stop(); // logs: "pattern-generation: 42ms"
```

---

## Error Codes

All errors thrown by the host are `PluginError` instances with a typed `code` property:

```typescript
class PluginError extends Error {
  readonly code: PluginErrorCode;
  readonly details?: Record<string, unknown>;
}
```

| Code | Description |
|------|-------------|
| `NOT_OWNED` | Tried to modify a track not owned by this plugin |
| `TRACK_NOT_FOUND` | Track ID doesn't exist in engine |
| `TRACK_LIMIT_EXCEEDED` | Plugin has too many tracks (default: 16 per scene) |
| `NO_ACTIVE_SCENE` | No scene is selected |
| `ENGINE_ERROR` | Tracktion engine call failed |
| `INVALID_MIDI` | Malformed MIDI data |
| `FILE_NOT_FOUND` | Audio file doesn't exist |
| `INVALID_FORMAT` | Unsupported audio format |
| `PLUGIN_NOT_FOUND` | VST/AU plugin not installed |
| `LLM_BUDGET_EXCEEDED` | Over token limit |
| `LLM_UNAVAILABLE` | Gateway unreachable |
| `NOT_AUTHENTICATED` | User not logged in |
| `TIMEOUT` | Operation timed out |
| `CANCELLED` | User cancelled the operation |
| `INCOMPATIBLE` | Plugin requires newer SDK version |
| `CAPABILITY_DENIED` | Plugin lacks required capability in manifest |
| `SECRET_NOT_FOUND` | Secret key doesn't exist |
| `VALIDATION_ERROR` | Inputs failed validation |
| `AUDIO_CAPTURE_DENIED` | Microphone permission denied or no input device available |
| `TIME_SIGNATURE_UNSUPPORTED` | The scene's time signature is outside the manifest's `supportedTimeSignatures` |

```typescript
import { PluginError } from '@signalsandsorcery/plugin-sdk';

try {
  await host.createTrack({ name: 'New Track' });
} catch (err) {
  if (err instanceof PluginError) {
    switch (err.code) {
      case 'NO_ACTIVE_SCENE':
        host.showToast('warning', 'Select a scene first');
        break;
      case 'TRACK_LIMIT_EXCEEDED':
        host.showToast('error', 'Too many tracks', 'Delete some tracks first');
        break;
      default:
        host.showToast('error', 'Error', err.message);
    }
  }
}
```
