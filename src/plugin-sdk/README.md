# Plugin SDK

Signals & Sorcery has an extensible plugin system that allows you to build custom input generators for the Loop Workstation. Plugins can generate MIDI patterns, manage audio samples, or create AI-generated audio textures.

## Quick Start

A plugin is a directory containing a `plugin.json` manifest and a JavaScript/TypeScript module that implements the `GeneratorPlugin` interface.

### 1. Create the Manifest

```json
{
  "id": "@my/euclidean-rhythm",
  "displayName": "Euclidean Rhythms",
  "version": "1.0.0",
  "description": "Generate polyrhythmic patterns using Euclidean algorithms",
  "generatorType": "midi",
  "main": "index.js",
  "minHostVersion": "1.0.0",
  "capabilities": {
    "requiresLLM": false
  }
}
```

### 2. Implement GeneratorPlugin

```typescript
import type { GeneratorPlugin, PluginHost, PluginUIProps } from '@sas/plugin-sdk';

export class EuclideanRhythmPlugin implements GeneratorPlugin {
  readonly id = '@my/euclidean-rhythm';
  readonly displayName = 'Euclidean Rhythms';
  readonly version = '1.0.0';
  readonly description = 'Polyrhythmic pattern generator';
  readonly generatorType = 'midi';

  private host: PluginHost | null = null;

  async activate(host: PluginHost): Promise<void> {
    this.host = host;
  }

  async deactivate(): Promise<void> {
    this.host = null;
  }

  getUIComponent() {
    return EuclideanPanel; // Your React component
  }

  getSettingsSchema() {
    return null;
  }
}
```

### 3. Build the UI Component

Your UI component receives `PluginUIProps` with the scoped `PluginHost` API:

```tsx
function EuclideanPanel({ host, activeSceneId }: PluginUIProps) {
  const handleGenerate = async () => {
    const track = await host.createTrack({ name: 'Euclidean', role: 'drums' });
    const context = await host.getMusicalContext();

    // Generate euclidean pattern...
    const notes = generateEuclidean(16, 5, context.bpm);

    await host.writeMidiClip(track.id, {
      startTime: 0,
      endTime: context.bars * 4 * 60 / context.bpm,
      tempo: context.bpm,
      notes,
    });
  };

  return (
    <div>
      <button onClick={handleGenerate}>Generate Pattern</button>
    </div>
  );
}
```

## PluginHost API

The `PluginHost` is the scoped API surface that plugins use to interact with the host application. Each plugin gets its own instance with ownership-scoped access.

### Track Management

| Method | Description |
|--------|-------------|
| `createTrack(options)` | Create a new track in the active scene |
| `deleteTrack(trackId)` | Delete a track owned by this plugin |
| `getPluginTracks()` | Get all tracks this plugin owns |
| `setTrackMute(trackId, muted)` | Mute/unmute an owned track |
| `setTrackVolume(trackId, volume)` | Set volume (0.0 - 1.0) |
| `setTrackPan(trackId, pan)` | Set pan (-1.0 to 1.0) |

### MIDI Operations

| Method | Description |
|--------|-------------|
| `writeMidiClip(trackId, clip)` | Write MIDI notes to a track |
| `clearMidi(trackId)` | Clear all MIDI from a track |
| `postProcessMidi(notes, options)` | Run quantize/swing/humanize pipeline |

### Musical Context

| Method | Description |
|--------|-------------|
| `getMusicalContext()` | Get key, mode, BPM, genre, chords |
| `getGenerationContext(excludeTrackId?)` | Full context with concurrent track MIDI |
| `getActiveSceneId()` | Currently active scene |

### AI / LLM

| Method | Description |
|--------|-------------|
| `generateWithLLM(request)` | Generate text/JSON via host LLM |
| `isLLMAvailable()` | Check if LLM is available |

### Data Persistence

| Method | Description |
|--------|-------------|
| `setSceneData(sceneId, key, value)` | Store per-scene plugin data |
| `getSceneData(sceneId, key)` | Read per-scene plugin data |
| `setProjectData(key, value)` | Store per-project plugin data |
| `getProjectData(key)` | Read per-project plugin data |
| `settings.get(key, default)` | Read plugin settings (global) |
| `settings.set(key, value)` | Write plugin settings (global) |

### Sample Library

| Method | Description |
|--------|-------------|
| `getSamples(filter?)` | Query the sample library |
| `importSamples(filePaths)` | Import audio files |
| `createSampleTrack(sampleId)` | Add sample to active scene |

### Notifications

| Method | Description |
|--------|-------------|
| `showToast(type, title, message?)` | Show a notification |
| `setProgress(trackId, progress)` | Show progress on a track (-1 to hide) |
| `confirmAction(title, message)` | Show confirmation dialog |

## Plugin Capabilities

Plugins declare capabilities in their manifest. The host enforces these at runtime:

```json
{
  "capabilities": {
    "requiresLLM": true,
    "requiresSurgeXT": true,
    "network": {
      "allowedHosts": ["api.splice.com"]
    },
    "fileDialog": true
  }
}
```

| Capability | Default | Description |
|-----------|---------|-------------|
| `requiresLLM` | `false` | Plugin needs LLM access |
| `requiresSurgeXT` | `false` | Plugin needs Surge XT synth |
| `network.allowedHosts` | `[]` | Allowed HTTP hosts for `httpRequest()` |
| `fileDialog` | `false` | Plugin can show file open/save dialogs |

## Security Model

- **Ownership scoping**: Plugins can only modify tracks they created
- **Capability gating**: Network and file system access require manifest declarations
- **Secret isolation**: Each plugin's secrets are isolated via `storeSecret()`/`getSecret()`
- **Track limits**: 16 tracks per plugin per scene (configurable)

## Built-in Plugins

| Plugin | Type | Description |
|--------|------|-------------|
| `@sas/synth-generator` | midi | AI MIDI generation with Surge XT |
| `@sas/sample-player` | sample | Sample library with time-stretching |
| `@sas/audio-texture` | audio | AI audio generation via Lyria 2 |
