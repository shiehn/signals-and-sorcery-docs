---
sidebar: auto
---

# Plugin SDK

Signals & Sorcery has an extensible plugin system that lets you build custom **input generators** for the Loop Workstation. Plugins can generate MIDI patterns, manage audio samples, create generative audio textures, or combine all three.

Each plugin gets its own accordion section in the workstation UI and a scoped `PluginHost` API for interacting with tracks, MIDI, audio, and more. Plugins never access the audio engine directly; all interaction goes through the `PluginHost`, which enforces ownership scoping, capability gating, and track limits.

## Start Here

### I just want to use a plugin

The app has a built-in installer. Paste a GitHub URL and click Install;
no terminal needed.

1. In Signals & Sorcery: **Settings → Plugins → Add Plugin**
2. Paste `https://github.com/shiehn/sas-texture-plugin` (or any plugin repo)
3. Click Install, then **Restart Now** when prompted

Full walkthrough: **[Install a Plugin](./install-a-plugin.md)**.

### I want to build a plugin

The fastest way to build a plugin is to clone the template into your
plugins folder and run the build:

```bash
# macOS: see Install a Plugin for Windows/Linux paths
cd ~/Library/Application\ Support/signals-and-sorcery/plugins/
git clone https://github.com/shiehn/sas-plugin-template.git @my-org/my-plugin
cd @my-org/my-plugin
npm install && npm run build
```

Restart Signals & Sorcery; your plugin appears in the workstation. Edit the source, rebuild, and iterate.

**[Plugin Template on GitHub](https://github.com/shiehn/sas-plugin-template)**: fully commented hello-world plugin with examples of track creation, MIDI writing, and all common patterns. It builds against plugin SDK 3.x.

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
| Loops Plugin | [github.com/shiehn/sas-loops-plugin](https://github.com/shiehn/sas-loops-plugin) |
| Stems Plugin | [github.com/shiehn/sas-stems-plugin](https://github.com/shiehn/sas-stems-plugin) |
| Chat Plugin | [github.com/shiehn/sas-chat-plugin](https://github.com/shiehn/sas-chat-plugin) |

### Additional Plugins

Installable via **Settings → Plugins → Add Plugin** (paste the GitHub URL).

| Plugin | Link |
|--------|------|
| Texture Plugin | [github.com/shiehn/sas-texture-plugin](https://github.com/shiehn/sas-texture-plugin) |

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
| `getSkills` | `() => PluginSkill[]` | **Optional.** Declare actions agents can call. Each is registered as a tool named `plugin:<pluginId>:<id>`. `PluginAction` is an alias of `PluginSkill`. |
| `getAgentSkills` | `() => PluginAgentSkill[]` | **Optional (SDK 3.20.0).** Contribute agent skills: markdown know-how telling agents when and how to use your actions. Called at activation; hosts without plugin skill support ignore it. See [Agent Actions and Skills](./api-reference.md#agent-actions-and-skills). |

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
| `isExpanded` | `boolean` | Whether this plugin's accordion section is open. The panel stays mounted while collapsed, so watch this prop (not mount/unmount) to know the user is looking at it |

---

## PluginHost API: Complete Method Reference

All methods below are available on the `host` object your plugin receives in `activate()` and via `PluginUIProps.host`. Methods marked with **ownership** require the track to be owned by the calling plugin. Methods marked **Optional** can be missing on older hosts: check `typeof host.method === 'function'` before calling them.

### Track Management

| Method | Signature | Description |
|--------|-----------|-------------|
| `createTrack` | `(options: CreateTrackOptions) => Promise<PluginTrackHandle>` | Create a new track in the active scene. Options: `name`, `role`, `loadSynth`, `synthName`, `instrumentPluginId`, `metadata`. |
| `deleteTrack` | `(trackId: string) => Promise<void>` | Delete an owned track. **Ownership.** |
| `getPluginTracks` | `() => Promise<PluginTrackHandle[]>` | Get all tracks this plugin owns in the active scene. |
| `getTrackInfo` | `(trackId: string) => Promise<PluginTrackInfo>` | Get detailed info (name, muted, volume, pan, plugins) for an owned track. **Ownership.** |
| `adoptSceneTracks` | `() => Promise<PluginTrackHandle[]>` | Adopt unowned tracks in the scene matching this plugin's generator type. Useful for re-activation. |
| `setTrackMute` | `(trackId: string, muted: boolean) => Promise<void>` | Mute or unmute a track. **Ownership.** |
| `setTrackSolo` | `(trackId: string, solo: boolean) => Promise<void>` | Solo or unsolo a track. **Ownership.** |
| `setTrackVolume` | `(trackId: string, volume: number) => Promise<void>` | Set track volume (0.0 silent – 1.0 full). **Ownership.** |
| `setTrackPan` | `(trackId: string, pan: number) => Promise<void>` | Set track pan (-1.0 left – 1.0 right). **Ownership.** |
| `setTrackName` | `(trackId: string, name: string) => Promise<void>` | Rename a track. **Ownership.** |
| `setTrackRole` | `(trackId: string, role: string) => Promise<void>` | Persist a track's musical role (e.g. `'bass'`, `'kicks'`). **Ownership.** |
| `getValidRoles` | `() => readonly string[]` | The host's canonical role tokens. Use it instead of a hard-coded list when building prompts or validating roles. |
| `reorderTracks` | `(orderedTrackIds: readonly string[]) => Promise<void>` | Persist this plugin's row order for the active scene (pass track `dbId`s). `getPluginTracks()` returns tracks in this order. |
| `shufflePreset` | `(trackId: string, excludeNames?: readonly string[], options?: ShufflePresetOptions) => Promise<ShufflePresetResult>` | Change the Surge XT preset, picked from a category matched to the track's MIDI pitch range. `excludeNames` removes presets from the pool; `options.description` enables description-based matching where the host supports it. Returns `{ presetName, presetCategory }`. **Ownership.** |
| `duplicateTrack` | `(trackId: string) => Promise<PluginTrackHandle>` | Clone an owned track: copies MIDI data and role. A Surge XT copy gets a different preset; a custom instrument copy keeps the source's state. **Ownership.** |

### MIDI Operations

| Method | Signature | Description |
|--------|-----------|-------------|
| `writeMidiClip` | `(trackId: string, clip: MidiClipData) => Promise<MidiWriteResult>` | Write MIDI notes to a track (replaces existing MIDI). Clip has `startTime`, `endTime`, `tempo`, `notes`. **Ownership.** |
| `clearMidi` | `(trackId: string) => Promise<void>` | Clear all MIDI from a track. **Ownership.** |
| `readMidiNotes` | `(trackId: string) => Promise<ReadMidiResult>` | **Optional.** Read a track's current MIDI as `{ clips: [{ startTime, endTime, notes }] }` for in-place editing. **Ownership.** |
| `postProcessMidi` | `(notes: PluginMidiNote[], options: PostProcessOptions) => Promise<PluginMidiNote[]>` | Run the host's MIDI pipeline: quantize, swing, scale enforcement, register clamping, overlap removal, humanization. |
| `auditionNote` | `(trackId: string, pitch: number, velocity: number, durationMs: number) => Promise<void>` | Play a single note for preview. Fire-and-forget. **Ownership.** |

### Audio Operations

| Method | Signature | Description |
|--------|-----------|-------------|
| `writeAudioClip` | `(trackId: string, filePath: string, position?: number) => Promise<void>` | Place an audio file (`.wav`, `.aiff`, `.mp3`, `.flac`, `.ogg`) on a track. **Ownership.** |
| `generateAudioTexture` | `(request: PluginAudioTextureRequest) => Promise<PluginAudioTextureResult>` | Invoke audio generation. Request has `prompt`, optional `durationSeconds` and `bpm`. Returns `{ filePath, durationSeconds, cuePoints }`. |
| `exportTrackAudio` | `(trackId: string) => Promise<ExportTrackAudioResult>` | **Optional.** Render only this track, offline, from its own scene (its length and time signature) to a temporary WAV; returns `{ path, bpm, durationMs }`. Throws a retryable `ENGINE_ERROR` while another render holds the engine. See [exportTrackAudio](./api-reference.md#exporttrackaudio-trackid). **Ownership.** |

### Plugin/Synth Operations

| Method | Signature | Description |
|--------|-----------|-------------|
| `loadSynthPlugin` | `(trackId: string, pluginName: string) => Promise<number>` | Load a VST3/AU plugin onto a track. Returns plugin index. **Ownership.** |
| `setPluginState` | `(trackId: string, pluginIndex: number, stateBase64: string) => Promise<void>` | Set plugin state from base64-encoded preset data. **Ownership.** |
| `getPluginState` | `(trackId: string, pluginIndex: number) => Promise<string>` | Get current plugin state as base64. **Ownership.** |
| `setRawPluginState` / `getRawPluginState` | `(trackId, pluginIndex, stateBase64) => Promise<void>` / `(trackId, pluginIndex) => Promise<string>` | Same as the two above, in the plugin's own VST3/AU state format. Use for third-party instruments whose patches the default format does not preserve. **Ownership.** |
| `awaitStateApplied` | `(trackId: string, opts?: AwaitStateAppliedOptions) => Promise<StateApplyVerdict>` | **Optional (SDK 3.22.0).** The engine's verdict on whether the plugin really loaded the last state you wrote: `verified`, `not_applied` (`errorCode: 'STATE_NOT_APPLIED'`), `timeout` (default 45 s) or `unsupported`. Never rejects. **→ All** uses it to re-apply a part once and name a part that still missed. See [awaitStateApplied](./api-reference.md#awaitstateapplied-trackid-opts). **Ownership.** |
| `getTrackPlugins` | `(trackId: string) => Promise<PluginSynthInfo[]>` | List all plugins loaded on a track. Returns `{ index, name, type, enabled }[]`. **Ownership.** |
| `removePlugin` | `(trackId: string, pluginIndex: number) => Promise<void>` | Remove a plugin from a track. **Ownership.** |
| `isPluginAvailable` | `(pluginName: string) => Promise<boolean>` | Check if a VST3/AU plugin is installed on the system. |

### Instrument Plugin Selection

| Method | Signature | Description |
|--------|-----------|-------------|
| `getAvailableInstruments` | `() => Promise<InstrumentDescriptor[]>` | Get available instrument plugins (VST3/AU synths) scanned by the engine. |
| `getTrackInstrument` | `(trackId: string) => Promise<InstrumentDescriptor \| null>` | Get the instrument currently loaded on a track. Null = default (Surge XT). **Ownership.** |
| `setTrackInstrument` | `(trackId: string, pluginId: string) => Promise<void>` | Change the instrument plugin on a track. Preserves MIDI data. **Ownership.** |
| `showInstrumentEditor` / `hideInstrumentEditor` | `(trackId: string) => Promise<void>` | Open or close the instrument's native editor window. **Ownership.** |

### FX Operations

Per-track FX are 3rd-party VST3/AU inserts on the track's plugin chain, placed before Volume & Pan. All methods are optional: feature-gate on `typeof host.getTrackExternalFx === 'function'`.

| Method | Signature | Description |
|--------|-----------|-------------|
| `getAvailableFx` | `() => Promise<InstrumentDescriptor[]>` | Scanned FX (non-instrument) plugins on this machine, for an FX picker. |
| `getTrackExternalFx` | `(trackId: string) => Promise<TrackExternalFxEntry[]>` | List the track's FX inserts. Returns `{ index, pluginId, name, enabled }[]`. **Ownership.** |
| `loadTrackExternalFx` | `(trackId: string, pluginId: string) => Promise<TrackExternalFxEntry>` | Add an FX plugin by scanned `pluginId` (from `getAvailableFx`). Instruments are rejected. **Ownership.** |
| `removeTrackExternalFx` | `(trackId: string, fxIndex: number) => Promise<void>` | Remove an insert by its `TrackExternalFxEntry.index`. **Ownership.** |
| `setTrackExternalFxEnabled` | `(trackId: string, fxIndex: number, enabled: boolean) => Promise<void>` | Bypass (or un-bypass) an insert. **Ownership.** |
| `moveTrackExternalFx` | `(trackId: string, fromFxIndex: number, toFxIndex: number) => Promise<void>` | Move an insert to another slot (splice semantics: it lands *at* `toFxIndex`). **Ownership.** |
| `showTrackExternalFxEditor` | `(trackId: string, fxIndex: number) => Promise<void>` | Open the plugin's native editor window. **Ownership.** |
| `copyTrackFxFrom` | `(destTrackId: string, sourceTrackDbId: string) => Promise<TrackFxCopyResult>` | Copy a source track's whole FX chain onto an owned track. Partial success is normal: plugins missing from this machine land in `externalMissing`. **Ownership (dest only).** |

### Panel Mix Bus

Each plugin can have one mix bus per scene: volume, mute, solo and an FX chain on the sum of its tracks. All methods are **Optional** and scoped to this plugin. Most panels use the `usePanelBus(host, activeSceneId)` hook with the `PanelMasterStrip` component instead of calling them directly; see [Panel Mix Bus](./api-reference.md#panel-mix-bus).

| Method | Signature | Description |
|--------|-----------|-------------|
| `getPanelBusState` | `(sceneId: string) => Promise<PanelBusState>` | `{ engaged, volume, muted, soloed, fx }`. When the bus is engaged, reading also routes the panel's not-yet-routed tracks into it. |
| `setPanelBusVolume` / `setPanelBusMute` / `setPanelBusSolo` | `(sceneId, value) => Promise<void>` | Bus fader (dB), mute and solo. |
| `loadPanelBusFx` / `removePanelBusFx` / `setPanelBusFxEnabled` / `movePanelBusFx` / `showPanelBusFxEditor` | `(sceneId, ...)` | Manage the bus FX chain, same idioms as the track FX methods. |
| `disengagePanelBus` | `(sceneId: string) => Promise<void>` | Remove the bus and return the panel's tracks to flat routing. |

### Scene Context

| Method | Signature | Description |
|--------|-----------|-------------|
| `getGenerationContext` | `(excludeTrackId?: string, opts?: PluginGenerationContextOptions) => Promise<PluginGenerationContext>` | Full context with chord progression and concurrent track MIDI data. Use `excludeTrackId` to omit the current track; `opts.pinTrackDbIds` always includes those reference tracks in full. |
| `getMusicalContext` | `() => Promise<MusicalContext>` | Lightweight context: `key`, `mode`, `bpm`, `bars`, `genre`, `timeSignature`, `chordProgression`, `contractPrompt`. No concurrent MIDI. |
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

All event methods return an `UnsubscribeFn`; call it to stop receiving events.

### LLM Access

Metered and requires authentication. Check availability before use. Both generation methods require the `requiresLLM` capability.

| Method | Signature | Description |
|--------|-----------|-------------|
| `generateWithLLM` | `(request: LLMGenerationRequest) => Promise<LLMGenerationResult>` | Generate text or JSON. Request: `system`, `user`, optional `maxTokens`, `responseFormat`, `skipContextPrefix`, `thinkingLevel`. Returns `{ content, tokensUsed, model }`. |
| `generateWithLLMTools` | `(request: LLMToolUseRequest) => Promise<LLMToolUseResponse>` | Generate with native tool calling, for agent loops. Pass a model role, `LLM_MODEL.BEST` or `LLM_MODEL.LIGHTWEIGHT`, as `model`; the host maps it to the current model. |
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

The two dialog methods require the `fileDialog` capability in the manifest. `downloadFile` requires the download's host to be listed in `network.allowedHosts`.

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
| `importSamples` | `(filePaths: string[]) => Promise<PluginSampleImportResult>` | Import audio files. Returns `{ imported, skipped, errors, samples? }`; `samples` (SDK 3.18.0 hosts) lists each file's library `id` and a `duplicate` flag. |
| `createSampleTrack` | `(sampleId: string, options?) => Promise<PluginTrackHandle>` | Create a sample track in the active scene. |
| `deleteSampleTrack` | `(trackId: string) => Promise<void>` | Delete a sample track. |
| `getPluginSampleTracks` | `() => Promise<PluginSampleTrackInfo[]>` | Get all sample tracks in the scene. Re-establishes ownership. Returns `{ track, sample, volume, pan }[]`. |
| `timeStretchSample` | `(sampleId: string, targetBpm: number) => Promise<PluginSampleInfo>` | Time-stretch a sample to a target BPM. Returns the new sample info. |
| `fitSampleToScene` | `(sampleId: string) => Promise<PluginSampleInfo>` | Stretch to the scene's BPM, then chop or loop to exactly the scene's length. 4/4 scenes only. |
| `previewSample` / `stopPreview` | `(filePath: string) => Promise<void>` / `() => Promise<void>` | Audition a file without creating a track, and stop the audition. |

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
| `setProgress` | `(trackId: string, progress: number) => void` | **Deprecated.** Not shown anywhere in the UI. Use `PluginUIProps.onLoading` or your own progress UI. |
| `setStatusMessage` | `(message: string \| null) => void` | **Deprecated.** Not shown anywhere in the UI. Use `showToast()` or your own status text. |
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
| `VALIDATION_ERROR` | Inputs failed validation |
| `AUDIO_CAPTURE_DENIED` | Microphone permission denied or no input device available |
| `TIME_SIGNATURE_UNSUPPORTED` | The scene's time signature is outside the plugin's `supportedTimeSignatures` |

---

## Built-in Plugins

These ship with Signals & Sorcery and serve as reference implementations:

| Plugin | Type | Description |
|--------|------|-------------|
| `@signalsandsorcery/synth-generator` | midi | Generative MIDI with Surge XT presets |
| `@signalsandsorcery/loops` | sample | Audio loop / sample library browser with time-stretching |
| `@signalsandsorcery/stems` | audio | Audio-from-text via Lyria 3, with stem splitting |
| `@signalsandsorcery/drum-generator` | midi | Drum-pattern MIDI played through a built-in sample-based drum sampler |
| `@signalsandsorcery/instrument-generator` | midi | Pitched, polyphonic sample-based instruments |
| `@signalsandsorcery/chat-panel` | hybrid | Scene-scoped chat agent that works through the app's tools (off by default) |

## Security Model

- **Ownership scoping**: Plugins can only modify tracks they created (enforced at runtime)
- **Capability gating**: Network and file system access require manifest declarations
- **Secret isolation**: Each plugin's secrets are encrypted and scoped per plugin
- **Track limits**: 16 tracks per plugin per scene (configurable)
