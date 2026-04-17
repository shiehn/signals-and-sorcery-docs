---
sidebar: auto
---

# Plugin SDK

Signals & Sorcery has an extensible plugin system that lets you build custom **input generators** for the Loop Workstation. Plugins can generate MIDI patterns, manage audio samples, create AI-generated audio textures, or combine all three.

Each plugin gets its own accordion section in the workstation UI and a scoped `PluginHost` API for interacting with tracks, MIDI, audio, and more. Plugins never access the audio engine directly — all interaction goes through the `PluginHost`, which enforces ownership scoping, capability gating, and track limits.

## Start Here

### I just want to use a plugin

The app has a built-in installer. Paste a GitHub URL and click Install —
no terminal needed.

1. In Signals & Sorcery: **Settings → Plugins → Add Plugin**
2. Paste `https://github.com/shiehn/sas-texture-plugin` (or any plugin repo)
3. Click Install, then **Restart Now** when prompted

Full walkthrough: **[Install a Plugin](./install-a-plugin.md)**.

### I want to build a plugin

The fastest way to build a plugin is to clone the template into your
plugins folder and run the build:

```bash
# macOS — see Install a Plugin for Windows/Linux paths
cd ~/Library/Application\ Support/signals-and-sorcery/plugins/
git clone https://github.com/shiehn/sas-plugin-template.git @my-org/my-plugin
cd @my-org/my-plugin
npm install && npm run build
```

Restart Signals & Sorcery — your plugin appears in the workstation. Edit the source, rebuild, and iterate.

**[Plugin Template on GitHub](https://github.com/shiehn/sas-plugin-template)** — Fully commented hello-world plugin with examples of track creation, MIDI writing, and all common patterns.

## Guides

| Page | Description |
|------|-------------|
| [Install a Plugin](./install-a-plugin.md) | How users install, enable, disable, and remove plugins (no coding required) |
| [Getting Started](./getting-started.md) | Directory structure, manifest options, installation, and debugging |
| [API Reference](./api-reference.md) | Complete PluginHost API with full type signatures, parameters, and code examples |
| [Tutorial](./tutorial.md) | Build a Euclidean Rhythm Generator plugin from scratch |

## Resources

### Development

| Resource | Link |
|----------|------|
| Plugin Template | [github.com/shiehn/sas-plugin-template](https://github.com/shiehn/sas-plugin-template) |
| Plugin SDK (npm) | [@signalsandsorcery/plugin-sdk](https://www.npmjs.com/package/@signalsandsorcery/plugin-sdk) |
| SDK Source | [github.com/shiehn/sas-plugin-sdk](https://github.com/shiehn/sas-plugin-sdk) |

### Reference Plugins

Built-in plugins that ship with Signals & Sorcery. Source is open for study or forking.

| Plugin | Link |
|--------|------|
| Synth Plugin | [github.com/shiehn/sas-synth-plugin](https://github.com/shiehn/sas-synth-plugin) |
| Sample Plugin | [github.com/shiehn/sas-sample-plugin](https://github.com/shiehn/sas-sample-plugin) |
| Audio Plugin | [github.com/shiehn/sas-audio-plugin](https://github.com/shiehn/sas-audio-plugin) |

### Additional Plugins

Installable via **Settings → Plugins → Add Plugin** (paste the GitHub URL).

| Plugin | Link |
|--------|------|
| Texture Plugin | [github.com/shiehn/sas-texture-plugin](https://github.com/shiehn/sas-texture-plugin) |
| Chat Plugin | [github.com/shiehn/sas-chat-plugin](https://github.com/shiehn/sas-chat-plugin) |

---

## Plugin Lifecycle Hooks

Every plugin implements the `GeneratorPlugin` interface. The host calls these methods during the plugin lifecycle.

| Method | Signature | Description |
|--------|-----------|-------------|
| `activate` | `(host: PluginHost) => Promise<void>` | Called when the plugin is activated. Receives the scoped `PluginHost` instance. Initialize state, load saved data, subscribe to events here. |
| `deactivate` | `() => Promise<void>` | Called when the plugin is deactivated (5-second timeout). Clean up listeners, save state, release resources. |
| `getUIComponent` | `() => ComponentType<PluginUIProps>` | Return the React component to render in the accordion section. |
| `getSettingsSchema` | `() => PluginSettingsSchema \| null` | Return a JSON schema for auto-rendered settings, or `null` for no settings UI. |
| `onSceneChanged` | `(sceneId: string \| null) => Promise<void>` | **Optional.** Called when the active scene changes. Reload scene-specific state here. |
| `onContextChanged` | `(context: MusicalContext) => void` | **Optional.** Called when musical context changes (BPM, key, chords). Update UI or recalculate patterns. |

---

## PluginUIProps

Props passed to your plugin's React component by the host.

| Prop | Type | Description |
|------|------|-------------|
| `host` | `PluginHost` | The scoped API instance for this plugin |
| `activeSceneId` | `string \| null` | Currently active scene ID |
| `isAuthenticated` | `boolean` | Whether the user is logged in (needed for LLM access) |
| `isConnected` | `boolean` | Whether engine and gateway are connected |
| `deckId` | `'left' \| 'right'` | Which workstation deck column this renders in |
| `onHeaderContent` | `(content: ReactNode \| null) => void` | Inject custom content (e.g., buttons) into the accordion header |
| `onLoading` | `(loading: boolean) => void` | Show/hide a loading spinner in the accordion header |
| `sceneContext` | `PluginSceneContext \| null` | Scene-level context: contract state, chords, BPM, bars |
| `onSelectScene` | `(() => void) \| null` | Callback to open the scene selector. Null if not applicable |
| `onOpenContract` | `(() => void) \| null` | Callback to open the contract/chords section |
| `onExpandSelf` | `(() => void) \| null` | Callback to expand this plugin's own accordion section |

---

## PluginHost API — Complete Method Reference

All methods below are available on the `host` object your plugin receives in `activate()` and via `PluginUIProps.host`. Methods marked with **ownership** require the track to be owned by the calling plugin.

### Track Management

| Method | Signature | Description |
|--------|-----------|-------------|
| `createTrack` | `(options: CreateTrackOptions) => Promise<PluginTrackHandle>` | Create a new track in the active scene. Options: `name`, `role`, `loadSynth`, `synthName`, `metadata`. |
| `deleteTrack` | `(trackId: string) => Promise<void>` | Delete an owned track. **Ownership.** |
| `getPluginTracks` | `() => Promise<PluginTrackHandle[]>` | Get all tracks this plugin owns in the active scene. |
| `getTrackInfo` | `(trackId: string) => Promise<PluginTrackInfo>` | Get detailed info (name, muted, volume, pan, plugins) for an owned track. **Ownership.** |
| `adoptSceneTracks` | `() => Promise<PluginTrackHandle[]>` | Adopt unowned tracks in the scene matching this plugin's generator type. Useful for re-activation. |
| `setTrackMute` | `(trackId: string, muted: boolean) => Promise<void>` | Mute or unmute a track. **Ownership.** |
| `setTrackSolo` | `(trackId: string, solo: boolean) => Promise<void>` | Solo or unsolo a track. **Ownership.** |
| `setTrackVolume` | `(trackId: string, volume: number) => Promise<void>` | Set track volume (0.0 silent – 1.0 full). **Ownership.** |
| `setTrackPan` | `(trackId: string, pan: number) => Promise<void>` | Set track pan (-1.0 left – 1.0 right). **Ownership.** |
| `setTrackName` | `(trackId: string, name: string) => Promise<void>` | Rename a track. **Ownership.** |
| `shufflePreset` | `(trackId: string) => Promise<ShufflePresetResult>` | Randomly change the Surge XT preset based on MIDI pitch analysis. Returns `{ presetName, presetCategory }`. **Ownership.** |
| `duplicateTrack` | `(trackId: string) => Promise<PluginTrackHandle>` | Clone an owned track — copies MIDI data, role, and loads Surge XT on the new track. **Ownership.** |

### MIDI Operations

| Method | Signature | Description |
|--------|-----------|-------------|
| `writeMidiClip` | `(trackId: string, clip: MidiClipData) => Promise<MidiWriteResult>` | Write MIDI notes to a track (replaces existing MIDI). Clip has `startTime`, `endTime`, `tempo`, `notes`. **Ownership.** |
| `clearMidi` | `(trackId: string) => Promise<void>` | Clear all MIDI from a track. **Ownership.** |
| `postProcessMidi` | `(notes: PluginMidiNote[], options: PostProcessOptions) => Promise<PluginMidiNote[]>` | Run the host's MIDI pipeline: quantize, swing, scale enforcement, register clamping, overlap removal, humanization. |
| `auditionNote` | `(trackId: string, pitch: number, velocity: number, durationMs: number) => Promise<void>` | Play a single note for preview. Fire-and-forget. **Ownership.** |

### Audio Operations

| Method | Signature | Description |
|--------|-----------|-------------|
| `writeAudioClip` | `(trackId: string, filePath: string, position?: number) => Promise<void>` | Place an audio file (`.wav`, `.aiff`, `.mp3`, `.flac`, `.ogg`) on a track. **Ownership.** |
| `generateAudioTexture` | `(request: PluginAudioTextureRequest) => Promise<PluginAudioTextureResult>` | Invoke AI audio generation. Request has `prompt`, optional `durationSeconds` and `bpm`. Returns `{ filePath, durationSeconds }`. |

### Plugin/Synth Operations

| Method | Signature | Description |
|--------|-----------|-------------|
| `loadSynthPlugin` | `(trackId: string, pluginName: string) => Promise<number>` | Load a VST3/AU plugin onto a track. Returns plugin index. **Ownership.** |
| `setPluginState` | `(trackId: string, pluginIndex: number, stateBase64: string) => Promise<void>` | Set plugin state from base64-encoded preset data. **Ownership.** |
| `getPluginState` | `(trackId: string, pluginIndex: number) => Promise<string>` | Get current plugin state as base64. **Ownership.** |
| `getTrackPlugins` | `(trackId: string) => Promise<PluginSynthInfo[]>` | List all plugins loaded on a track. Returns `{ index, name, type, enabled }[]`. **Ownership.** |
| `removePlugin` | `(trackId: string, pluginIndex: number) => Promise<void>` | Remove a plugin from a track. **Ownership.** |
| `isPluginAvailable` | `(pluginName: string) => Promise<boolean>` | Check if a VST3/AU plugin is installed on the system. |

### Instrument Plugin Selection

| Method | Signature | Description |
|--------|-----------|-------------|
| `getAvailableInstruments` | `() => Promise<InstrumentDescriptor[]>` | Get available instrument plugins (VST3/AU synths) scanned by the engine. |
| `getTrackInstrument` | `(trackId: string) => Promise<InstrumentDescriptor \| null>` | Get the instrument currently loaded on a track. Null = default (Surge XT). **Ownership.** |
| `setTrackInstrument` | `(trackId: string, pluginId: string) => Promise<void>` | Change the instrument plugin on a track. Preserves MIDI data. **Ownership.** |

### FX Operations

Per-track FX with 6 categories in signal chain order: `eq` → `compressor` → `chorus` → `phaser` → `delay` → `reverb`.

| Method | Signature | Description |
|--------|-----------|-------------|
| `getTrackFxState` | `(trackId: string) => Promise<PluginTrackFxDetailState>` | Get FX state for all categories (`enabled`, `presetIndex`, `dryWet` per category). **Ownership.** |
| `toggleTrackFx` | `(trackId: string, category: string, enabled: boolean) => Promise<void>` | Enable or disable an FX category. **Ownership.** |
| `setTrackFxPreset` | `(trackId: string, category: string, presetIndex: number) => Promise<{ dryWet?: number }>` | Set FX preset (0–4). Returns new dry/wet if the preset changes it. **Ownership.** |
| `setTrackFxDryWet` | `(trackId: string, category: string, value: number) => Promise<void>` | Set dry/wet mix (0.0 dry – 1.0 wet). **Ownership.** |

### Scene Context

| Method | Signature | Description |
|--------|-----------|-------------|
| `getGenerationContext` | `(excludeTrackId?: string) => Promise<PluginGenerationContext>` | Full context with chord progression and concurrent track MIDI data. Use `excludeTrackId` to omit the current track. |
| `getMusicalContext` | `() => Promise<MusicalContext>` | Lightweight context: `key`, `mode`, `bpm`, `bars`, `genre`, `timeSignature`, `chordProgression`. No concurrent MIDI. |
| `getActiveSceneId` | `() => string \| null` | Get the currently active scene ID. Synchronous. Returns `null` if no scene is selected. |
| `getSceneList` | `() => Promise<PluginSceneInfo[]>` | Get all scenes in the project. Returns `{ id, name, isMuted }[]`. |

### Transport & Events

| Method | Signature | Description |
|--------|-----------|-------------|
| `getTransportState` | `() => Promise<PluginTransportState>` | One-shot snapshot: `isPlaying`, `isPaused`, `bpm`, `position`, `timeSignature`. |
| `onTrackStateChange` | `(listener) => UnsubscribeFn` | Subscribe to real-time track state changes (mute, solo, volume, pan). Only fires for owned tracks. |
| `onTransportEvent` | `(listener) => UnsubscribeFn` | Subscribe to transport events (play, stop, BPM change, position change). |
| `onDeckBoundary` | `(listener) => UnsubscribeFn` | Subscribe to deck loop boundary events (`deckId`, `bar`, `beat`, `loopCount`). |
| `onSceneChange` | `(listener) => UnsubscribeFn` | Subscribe to scene change events. Listener receives `string \| null`. |

All event methods return an `UnsubscribeFn` — call it to stop receiving events.

### LLM Access

Metered and requires authentication. Check availability before use.

| Method | Signature | Description |
|--------|-----------|-------------|
| `generateWithLLM` | `(request: LLMGenerationRequest) => Promise<LLMGenerationResult>` | Generate text or JSON. Request: `system`, `user`, optional `maxTokens`, `responseFormat`. Returns `{ content, tokensUsed, model }`. |
| `isLLMAvailable` | `() => Promise<boolean>` | Check if LLM service is available (user authenticated, gateway reachable). |

### Synth Preset System

For interacting with Surge XT factory presets.

| Method | Signature | Description |
|--------|-----------|-------------|
| `getPresetCategories` | `(pluginName: string) => Promise<string[]>` | Get available categories (e.g., `['Bass', 'Keys', 'Lead', 'Pad', ...]` for Surge XT). |
| `getRandomPreset` | `(category: string) => Promise<PluginPresetData \| null>` | Get a random preset from a category. Returns base64 state data. |
| `getPresetByName` | `(category: string, name: string) => Promise<PluginPresetData \| null>` | Get a specific preset by name. |
| `classifyPresetCategory` | `(description: string) => Promise<string>` | Classify a text description (e.g., `"warm analog pad"`) into a preset category. |

### Plugin Presets

Custom presets specific to your plugin (distinct from synth presets).

| Method | Signature | Description |
|--------|-----------|-------------|
| `getPluginPresets` | `(category?: string) => Promise<PluginPresetInfo[]>` | Get saved presets, optionally filtered by category. |
| `savePluginPreset` | `(options: SavePluginPresetOptions) => Promise<PluginPresetInfo>` | Save a preset. Options: `name`, optional `category`, `data`. |
| `deletePluginPreset` | `(id: string) => Promise<void>` | Delete a saved preset by ID. |

### Data Persistence

#### Scene-Scoped Data

Per-scene key-value storage. Data is tied to a specific scene.

| Method | Signature | Description |
|--------|-----------|-------------|
| `getSceneData` | `<T>(sceneId: string, key: string) => Promise<T \| null>` | Read a value for this scene. |
| `setSceneData` | `(sceneId: string, key: string, value: unknown) => Promise<void>` | Write a value for this scene. |
| `getAllSceneData` | `(sceneId: string) => Promise<Record<string, unknown>>` | Get all stored data for a scene. |
| `deleteSceneData` | `(sceneId: string, key: string) => Promise<void>` | Delete a key from scene data. |

#### Project-Scoped Data

Project-wide data that persists across scenes.

| Method | Signature | Description |
|--------|-----------|-------------|
| `getProjectData` | `<T>(key: string) => Promise<T \| null>` | Read project-scoped data. |
| `setProjectData` | `(key: string, value: unknown) => Promise<void>` | Write project-scoped data. |

#### Global Settings

Persists across projects via `host.settings`:

| Method | Signature | Description |
|--------|-----------|-------------|
| `settings.get` | `<T>(key: string, defaultValue: T) => T` | Read a setting (synchronous, from cache). Returns `defaultValue` if not set. |
| `settings.set` | `(key: string, value: unknown) => void` | Write a setting (persists to DB). |
| `settings.getAll` | `() => Record<string, unknown>` | Get all settings. |
| `settings.onChange` | `(listener) => UnsubscribeFn` | React to setting changes. Returns unsub function. |

#### Data Directory

| Method | Signature | Description |
|--------|-----------|-------------|
| `getDataDirectory` | `() => string` | Absolute path to the plugin's isolated data directory on disk. |

### File System

Requires the `fileDialog` capability in the manifest.

| Method | Signature | Description |
|--------|-----------|-------------|
| `showOpenDialog` | `(options: PluginFileDialogOptions) => Promise<string[] \| null>` | Show a native file open dialog. Returns selected paths or `null` if cancelled. |
| `showSaveDialog` | `(options: PluginFileDialogOptions) => Promise<string \| null>` | Show a native file save dialog. |
| `downloadFile` | `(url: string, filename: string, options?) => Promise<string>` | Download a file to the plugin's data directory. Returns the local path. |
| `importFile` | `(sourcePath: string, destFilename: string) => Promise<string>` | Copy a local file into the plugin's data directory. |

### Network

Requires the `network` capability with `allowedHosts` in the manifest.

| Method | Signature | Description |
|--------|-----------|-------------|
| `httpRequest` | `(options: PluginHttpRequestOptions) => Promise<PluginHttpResponse>` | Make an HTTP request to an allowed host. Options: `url`, `method`, `headers`, `body`, `timeoutMs`. Returns `{ status, statusText, headers, body }`. |

### Secure Storage

Secrets are encrypted via the OS keychain and scoped per plugin. Plugin A cannot access plugin B's secrets.

| Method | Signature | Description |
|--------|-----------|-------------|
| `storeSecret` | `(key: string, value: string) => Promise<void>` | Store an encrypted secret (e.g., API key). |
| `getSecret` | `(key: string) => Promise<string \| null>` | Retrieve a secret. Returns `null` if not found. |
| `deleteSecret` | `(key: string) => Promise<void>` | Delete a stored secret. |

### Sample Library

| Method | Signature | Description |
|--------|-----------|-------------|
| `getSamples` | `(filter?: PluginSampleFilter) => Promise<PluginSampleInfo[]>` | Query the sample library. Filter by `bpm`, `key`, `category`, `searchQuery`. |
| `getSampleById` | `(id: string) => Promise<PluginSampleInfo \| null>` | Get a specific sample by ID. |
| `importSamples` | `(filePaths: string[]) => Promise<PluginSampleImportResult>` | Import audio files. Returns `{ imported, skipped, errors }`. |
| `createSampleTrack` | `(sampleId: string, options?) => Promise<PluginTrackHandle>` | Create a sample track in the active scene. |
| `deleteSampleTrack` | `(trackId: string) => Promise<void>` | Delete a sample track. |
| `getPluginSampleTracks` | `() => Promise<PluginSampleTrackInfo[]>` | Get all sample tracks in the scene. Re-establishes ownership. Returns `{ track, sample, volume, pan }[]`. |
| `timeStretchSample` | `(sampleId: string, targetBpm: number) => Promise<PluginSampleInfo>` | Time-stretch a sample to a target BPM. Returns the new sample info. |

### Scene Composition

| Method | Signature | Description |
|--------|-----------|-------------|
| `composeScene` | `(options: ComposeSceneOptions) => Promise<ComposeSceneResult>` | Trigger bulk composition for the active scene. LLM plans arrangement, creates tracks, generates MIDI. Options: `contractPrompt`, optional `genre`. |
| `onComposeProgress` | `(listener: ComposeProgressListener) => UnsubscribeFn` | Subscribe to composition progress events (`planning`, `generating`, `complete`, `error`). |
| `onEngineReady` | `(listener: () => void) => UnsubscribeFn` | Subscribe to engine ready events. Fires when the engine finishes loading tracks after a scene change. |

### Notifications & Progress

| Method | Signature | Description |
|--------|-----------|-------------|
| `showToast` | `(type, title, message?) => void` | Show a toast notification. Type: `'info'`, `'success'`, `'warning'`, `'error'`. |
| `setProgress` | `(trackId: string, progress: number) => void` | Show progress on a track (0–100). Pass `-1` to hide. |
| `setStatusMessage` | `(message: string \| null) => void` | Set a status message in the accordion header. Pass `null` to clear. |
| `confirmAction` | `(title: string, message: string) => Promise<boolean>` | Show a confirmation dialog. Returns `true` if confirmed. |

### Performance / Logging

| Method | Signature | Description |
|--------|-----------|-------------|
| `logMetric` | `(name: string, durationMs: number, metadata?) => void` | Log a named performance metric. |
| `startTimer` | `(name: string) => () => void` | Start a timer. Returns a stop function that auto-logs the duration via `logMetric()`. |

---

## Error Codes

All errors thrown by the host are `PluginError` instances with a typed `code` property.

| Code | Description |
|------|-------------|
| `NOT_OWNED` | Tried to modify a track not owned by this plugin |
| `TRACK_NOT_FOUND` | Track ID doesn't exist in engine |
| `TRACK_LIMIT_EXCEEDED` | Plugin has too many tracks (default: 16 per scene) |
| `NO_ACTIVE_SCENE` | No scene is selected |
| `ENGINE_ERROR` | Audio engine call failed |
| `INVALID_MIDI` | Malformed MIDI data (e.g., empty notes array) |
| `FILE_NOT_FOUND` | Referenced file doesn't exist |
| `INVALID_FORMAT` | Unsupported audio format |
| `PLUGIN_NOT_FOUND` | VST/AU plugin not installed or not found on track |
| `LLM_BUDGET_EXCEEDED` | Over daily token limit |
| `LLM_UNAVAILABLE` | LLM gateway unreachable |
| `NOT_AUTHENTICATED` | User not logged in |
| `TIMEOUT` | Operation timed out |
| `CANCELLED` | User cancelled the operation |
| `INCOMPATIBLE` | Plugin requires newer SDK version |
| `CAPABILITY_DENIED` | Plugin lacks required capability in manifest |
| `SECRET_NOT_FOUND` | Secret key doesn't exist |

---

## Built-in Plugins

These ship with Signals & Sorcery and serve as reference implementations:

| Plugin | Type | Description |
|--------|------|-------------|
| `@signalsandsorcery/synth-generator` | midi | AI-powered MIDI generation with Surge XT presets |
| `@signalsandsorcery/sample-player` | sample | Sample library browser with time-stretching |
| `@signalsandsorcery/audio-texture` | audio | AI audio texture generation via Lyria 3 |

## Security Model

- **Ownership scoping** — Plugins can only modify tracks they created (enforced at runtime)
- **Capability gating** — Network and file system access require manifest declarations
- **Secret isolation** — Each plugin's secrets are encrypted and scoped per plugin
- **Track limits** — 16 tracks per plugin per scene (configurable)
