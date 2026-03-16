---
sidebar: auto
---

# API Reference

Complete reference for the `PluginHost` API — the scoped interface that plugins use to interact with Signals & Sorcery. Each plugin receives its own `PluginHost` instance with ownership-scoped access.

## Track Management

All track methods are **ownership-scoped** — plugins can only modify tracks they created. Attempting to modify another plugin's track throws a `NOT_OWNED` error.

### createTrack(options)

Create a new track in the active scene.

```typescript
createTrack(options: CreateTrackOptions): Promise<PluginTrackHandle>
```

**Parameters:**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `name` | `string` | auto-generated | Display name for the track |
| `role` | `string` | — | Musical role hint: `'bass'`, `'drums'`, `'lead'`, `'chords'`, `'pad'`, `'arp'`, `'fx'` |
| `loadSynth` | `boolean` | `false` | Load a synth plugin immediately |
| `synthName` | `string` | `'Surge XT'` | Which synth to load (ignored if `loadSynth` is false) |
| `metadata` | `Record<string, unknown>` | — | Plugin-specific metadata stored in the database |

**Returns:** `PluginTrackHandle` with `id`, `name`, `dbId`, and optional `role`.

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
| `clampRegister` | `[number, number]` | — | Clamp note pitches to `[low, high]` range |
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

Play a single note on a track for preview. Fire-and-forget — does not record.

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

Invoke the host's AI audio texture generation pipeline.

```typescript
generateAudioTexture(request: PluginAudioTextureRequest): Promise<PluginAudioTextureResult>
```

**PluginAudioTextureRequest:**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `prompt` | `string` | — | Text description of the desired audio |
| `durationSeconds` | `number` | scene length | Duration in seconds |
| `bpm` | `number` | project BPM | Target BPM |

**Returns:** `PluginAudioTextureResult` with `filePath` and `durationSeconds`.

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

## Scene Context

### getGenerationContext(excludeTrackId?)

Get the full generation context for the active scene, including concurrent track MIDI data. Use `excludeTrackId` to omit the current track's data (common when generating for that track).

```typescript
getGenerationContext(excludeTrackId?: string): Promise<PluginGenerationContext>
```

**PluginGenerationContext:**

| Field | Type | Description |
|-------|------|-------------|
| `chordProgression` | `object` | Key (`tonic`, `mode`), `chordsWithTiming`, `genre` |
| `concurrentTracks` | `PluginConcurrentTrackInfo[]` | Other tracks with their MIDI, organized by chord |

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
| `timeSignature` | `string` | `'4/4'`, `'3/4'`, `'6/8'` |
| `chordProgression` | `PluginChordTiming[]` | Chord symbols with quarter-note timing |

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

Subscribe to deck loop boundary events — fired when a deck loops back to the start.

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

## LLM Access

LLM methods are metered and require authentication. Check availability before use.

### generateWithLLM(request)

Generate text or JSON via the host's authenticated LLM service.

```typescript
generateWithLLM(request: LLMGenerationRequest): Promise<LLMGenerationResult>
```

**LLMGenerationRequest:**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `system` | `string` | — | System prompt (instructions, role, output format) |
| `user` | `string` | — | User prompt (the actual request) |
| `maxTokens` | `number` | host default | Max tokens for response (host may cap) |
| `responseFormat` | `string` | `'text'` | `'text'` or `'json'` |

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

Requires the `fileDialog` capability in the manifest.

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

Returns the absolute path to the downloaded file.

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
| `url` | `string` | — | Full URL (host must be in `allowedHosts`) |
| `method` | `string` | `'GET'` | `'GET'`, `'POST'`, `'PUT'`, `'DELETE'`, `'PATCH'` |
| `headers` | `Record<string, string>` | — | Request headers |
| `body` | `string \| Record<string, unknown>` | — | Request body |
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

**Returns:** `{ imported: number, skipped: number, errors: string[] }`

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

## Notifications & Progress

### showToast(type, title, message?)

Show a toast notification.

```typescript
showToast(type: 'info' | 'success' | 'warning' | 'error', title: string, message?: string): void
```

---

### setProgress(trackId, progress)

Show a progress indicator on a track. Pass `-1` to hide.

```typescript
setProgress(trackId: string, progress: number): void
```

`progress` range: `0` to `100`, or `-1` to hide.

---

### setStatusMessage(message)

Set a status message in the plugin's accordion header. Pass `null` to clear.

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

```typescript
import { PluginError } from '@sas/plugin-sdk';

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
