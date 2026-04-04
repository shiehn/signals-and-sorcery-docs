---
sidebar: auto
---

# Getting Started

This guide walks you through creating, installing, and debugging a Signals & Sorcery plugin.

::: tip Quick Start
Clone the **[Plugin Template](https://github.com/shiehn/sas-plugin-template)** to skip the boilerplate. It includes a working hello-world plugin with heavily commented examples of track creation, MIDI writing, and all common patterns:

```bash
cd ~/.signals-and-sorcery/plugins/
git clone https://github.com/shiehn/sas-plugin-template.git @my-org/my-plugin
cd @my-org/my-plugin
npm install && npm run build
# Restart Signals & Sorcery — plugin appears in the workstation
```
:::

## Prerequisites

- **Signals & Sorcery** v2.24.0 or later (Plugin SDK v1.0.0)
- **Node.js** 18+ (for building your plugin)
- **TypeScript** recommended but not required

## Installing the SDK

The Plugin SDK is published as an npm package with types, UI components, and hooks:

```bash
npm install @signalsandsorcery/plugin-sdk
```

This gives you:
- **TypeScript types** — `GeneratorPlugin`, `PluginHost`, `PluginUIProps`, and all supporting types
- **UI Components** — `TrackRow`, `VolumeSlider`, `PanSlider`, `FxToggleBar`, `SorceryProgressBar`, `InstrumentDrawer`
- **Hooks** — `useSceneState` (scene-keyed state management)
- **Constants** — `VALID_INSTRUMENT_ROLES`, `FX_CATEGORIES`, `PLUGIN_SDK_VERSION`

```typescript
// Import types for your plugin class
import type { GeneratorPlugin, PluginHost, PluginUIProps } from '@signalsandsorcery/plugin-sdk';

// Import UI components for your React panel
import { TrackRow, useSceneState, VolumeSlider, FxToggleBar } from '@signalsandsorcery/plugin-sdk';
```

### SDK UI Components

These pre-built components match the host app's visual style (Tailwind CSS classes provided by the host):

| Component | Description |
|-----------|-------------|
| `TrackRow` | Full-featured track row with prompt input, generate/shuffle/copy buttons, mute/solo, volume/pan, FX drawer, instrument drawer, and progress overlay |
| `VolumeSlider` | Compact horizontal volume slider (0-1) with dB tooltip |
| `PanSlider` | Compact horizontal pan slider (-1 to +1) with double-click to center |
| `FxToggleBar` | Per-track FX control panel with 6 categories, preset buttons, and dry/wet sliders |
| `SorceryProgressBar` | Animated progress bar with time-based pacing for long operations |
| `InstrumentDrawer` | Searchable grid of available VST3/AU instrument plugins |

### useSceneState Hook

Maintains separate state per scene — when the user switches scenes, state is preserved and restored:

```typescript
import { useSceneState } from '@signalsandsorcery/plugin-sdk';

// Inside your React component:
const [prompts, setPrompts, setPromptsForScene] = useSceneState(activeSceneId, {});
// prompts = state for current scene
// setPrompts(value) = update current scene
// setPromptsForScene(sceneId, value) = update a specific scene (for async callbacks)
```

## Plugin Directory Structure

A minimal plugin looks like this:

```
my-plugin/
├── plugin.json       # Required: manifest
├── index.ts          # Required: GeneratorPlugin entry point
└── components/
    └── Panel.tsx      # Optional: React UI component
```

A more complete plugin might include:

```
my-plugin/
├── plugin.json
├── index.ts
├── components/
│   ├── Panel.tsx
│   └── Controls.tsx
├── lib/
│   └── algorithms.ts
├── assets/
│   └── icon.svg
├── presets/
│   └── factory.json
└── package.json
```

## The Manifest (plugin.json)

Every plugin requires a `plugin.json` manifest in its root directory:

```json
{
  "id": "@my-org/my-plugin",
  "displayName": "My Plugin",
  "version": "1.0.0",
  "description": "A short description of what this plugin does",
  "generatorType": "midi",
  "main": "index.js",
  "icon": "assets/icon.svg",
  "author": "Your Name",
  "license": "MIT",
  "minHostVersion": "1.0.0",
  "capabilities": {}
}
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique ID using npm-style scoping: `@scope/name` |
| `displayName` | `string` | Human-readable name shown in the accordion header |
| `version` | `string` | Semver version string (e.g., `1.0.0`) |
| `description` | `string` | Short description for the settings panel |
| `generatorType` | `string` | One of: `midi`, `audio`, `sample`, `hybrid` |
| `main` | `string` | Entry point file relative to plugin root |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `icon` | `string` | 24x24 icon — data URL or relative path from plugin directory |
| `author` | `string` | Plugin author name |
| `license` | `string` | License identifier |
| `minHostVersion` | `string` | Minimum SDK version required (e.g., `1.0.0`) |
| `capabilities` | `object` | Required capabilities (see below) |
| `settings` | `object` | JSON Schema for auto-rendered settings form |
| `builtIn` | `boolean` | Reserved for built-in plugins |

### Generator Types

| Type | Description | Use Case |
|------|-------------|----------|
| `midi` | Creates MIDI clips on tracks | Synth patterns, drum sequences, arpeggiators |
| `audio` | Places audio files on tracks | AI audio generation, sound design |
| `sample` | Manages sample library tracks | Sample browsers, beat slicers |
| `hybrid` | Combines MIDI and audio | Multi-layered generators |

### Capabilities

Capabilities declare what platform features your plugin needs. The host enforces these at runtime — calling a capability-gated method without the right manifest entry throws a `CAPABILITY_DENIED` error.

```json
{
  "capabilities": {
    "requiresLLM": true,
    "requiresSurgeXT": true,
    "requiresNetwork": true,
    "network": {
      "allowedHosts": ["api.example.com", "cdn.example.com"]
    },
    "fileDialog": true
  }
}
```

| Capability | Default | Description |
|-----------|---------|-------------|
| `requiresLLM` | `false` | Plugin needs access to `generateWithLLM()` |
| `requiresSurgeXT` | `false` | Plugin needs the Surge XT synthesizer |
| `requiresNetwork` | `false` | Plugin makes HTTP requests |
| `network.allowedHosts` | `[]` | Specific hosts the plugin can reach via `httpRequest()` |
| `fileDialog` | `false` | Plugin can show native file open/save dialogs |

## Implementing GeneratorPlugin

Your entry point module must export a class that implements the `GeneratorPlugin` interface:

```typescript
import type {
  GeneratorPlugin,
  PluginHost,
  PluginUIProps,
  PluginSettingsSchema,
  MusicalContext,
} from '@signalsandsorcery/plugin-sdk';
import { MyPanel } from './components/Panel';

export class MyPlugin implements GeneratorPlugin {
  // --- Required readonly properties ---
  readonly id = '@my-org/my-plugin';
  readonly displayName = 'My Plugin';
  readonly version = '1.0.0';
  readonly description = 'Does something useful';
  readonly generatorType = 'midi' as const;

  private host: PluginHost | null = null;

  // --- Lifecycle ---

  async activate(host: PluginHost): Promise<void> {
    this.host = host;
    // Initialize plugin state, load saved data, etc.
    const savedState = await host.getProjectData<MyState>('state');
    if (savedState) {
      this.state = savedState;
    }
  }

  async deactivate(): Promise<void> {
    // Clean up: unsubscribe listeners, save state, release resources
    // Must complete within 5 seconds or host force-kills
    if (this.host) {
      await this.host.setProjectData('state', this.state);
    }
    this.host = null;
  }

  // --- UI ---

  getUIComponent() {
    return MyPanel;
  }

  // --- Settings (optional) ---

  getSettingsSchema(): PluginSettingsSchema | null {
    return {
      type: 'object',
      properties: {
        density: {
          type: 'number',
          label: 'Note Density',
          description: 'How many notes per bar',
          default: 4,
          min: 1,
          max: 32,
        },
        scale: {
          type: 'select',
          label: 'Scale',
          options: [
            { label: 'Major', value: 'major' },
            { label: 'Minor', value: 'minor' },
            { label: 'Pentatonic', value: 'pentatonic' },
          ],
          default: 'major',
        },
      },
    };
  }

  // --- Optional callbacks ---

  async onSceneChanged(sceneId: string | null): Promise<void> {
    // Called when the active scene changes
    // Use this to reload scene-specific state
  }

  onContextChanged(context: MusicalContext): void {
    // Called when musical context changes (BPM, key, chords, etc.)
    // Use this to update UI or recalculate patterns
  }
}
```

### Lifecycle

1. **Discovery** — Host scans plugin directories for `plugin.json` manifests
2. **Registration** — Plugin is registered with its manifest metadata
3. **Version check** — Host verifies `minHostVersion` compatibility
4. **Activation** — `activate(host)` is called with the scoped `PluginHost` instance
5. **Running** — Plugin renders UI, responds to events, creates tracks/MIDI
6. **Deactivation** — `deactivate()` is called (5-second timeout)

If `activate()` throws, the plugin is marked as **failed** and its accordion section shows an error boundary.

## Building the UI Component

Your React component receives `PluginUIProps`:

```tsx
import type { PluginUIProps } from '@signalsandsorcery/plugin-sdk';

interface PanelState {
  isGenerating: boolean;
  trackCount: number;
}

export function MyPanel({ host, activeSceneId, isAuthenticated, isConnected }: PluginUIProps) {
  const [state, setState] = React.useState<PanelState>({
    isGenerating: false,
    trackCount: 0,
  });

  // Load existing tracks on scene change
  React.useEffect(() => {
    if (!activeSceneId) return;
    host.getPluginTracks().then(tracks => {
      setState(prev => ({ ...prev, trackCount: tracks.length }));
    });
  }, [activeSceneId]);

  const handleGenerate = async () => {
    if (!activeSceneId) {
      host.showToast('warning', 'No Scene', 'Select a scene first');
      return;
    }

    setState(prev => ({ ...prev, isGenerating: true }));
    try {
      const track = await host.createTrack({ name: 'My Track', role: 'lead' });
      host.setProgress(track.id, 50);

      const context = await host.getMusicalContext();
      // ... generate notes ...

      await host.writeMidiClip(track.id, { /* ... */ });
      host.setProgress(track.id, -1); // hide progress
      host.showToast('success', 'Done', 'Pattern generated');
    } catch (err) {
      host.showToast('error', 'Failed', String(err));
    } finally {
      setState(prev => ({ ...prev, isGenerating: false }));
    }
  };

  return (
    <div>
      <p>Tracks: {state.trackCount}</p>
      <button onClick={handleGenerate} disabled={state.isGenerating || !isConnected}>
        {state.isGenerating ? 'Generating...' : 'Generate'}
      </button>
    </div>
  );
}
```

### PluginUIProps

| Prop | Type | Description |
|------|------|-------------|
| `host` | `PluginHost` | The scoped API instance for this plugin |
| `activeSceneId` | `string \| null` | Currently active scene ID |
| `isAuthenticated` | `boolean` | Whether the user is logged in (for LLM access) |
| `isConnected` | `boolean` | Whether engine and gateway are connected |
| `deckId` | `'left' \| 'right'` | Which workstation deck column this renders in |
| `onHeaderContent` | `(content: ReactNode \| null) => void` | Set/clear custom buttons in the accordion header |
| `onLoading` | `(loading: boolean) => void` | Show/hide a loading spinner in the accordion header |
| `sceneContext` | `PluginSceneContext \| null` | Scene-level context: contract state, chords, BPM, bars (see below) |
| `onSelectScene` | `(() => void) \| null` | Callback to open the scene selector. Null if not applicable |
| `onOpenContract` | `(() => void) \| null` | Callback to open the contract/chords section |
| `onExpandSelf` | `(() => void) \| null` | Callback to expand this plugin's own accordion section |

### PluginSceneContext

Provides scene-level musical context to the UI without requiring an async call.

| Field | Type | Description |
|-------|------|-------------|
| `hasContract` | `boolean` | Whether a contract has been generated (genre/prompt exists AND chords exist) |
| `contractPrompt` | `string \| null` | Original user prompt text (e.g., "dark psytrance") |
| `genre` | `string \| null` | Extracted genre |
| `key` | `{ tonic: string; mode: string } \| null` | Musical key, or null if no chord progression |
| `chords` | `string[]` | Chord symbols (e.g., `["Cm", "Fm", "G"]`). Empty if no chords |
| `bpm` | `number` | BPM from project tempo |
| `bars` | `number` | Scene length in bars |
| `hasTracks` | `boolean` | Whether any synth tracks exist in this scene |
| `isBulkGenerating` | `boolean` | Whether bulk generation is currently in progress |

### BulkAddPlaceholderTrack

Represents a planned track during the progressive bulk-add UX.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique placeholder identifier |
| `planIndex` | `number` | Position in the generation plan |
| `role` | `string` | Musical role (e.g., `'bass'`, `'lead'`) |
| `description` | `string` | Human-readable description of the planned track |
| `status` | `'planned' \| 'creating' \| 'completed' \| 'failed'` | Current generation status |
| `error` | `string` | Error message (only present when `status` is `'failed'`) |

## Installing a Plugin

Place your compiled plugin directory in the plugins folder:

```
~/.signals-and-sorcery/plugins/
└── my-plugin/
    ├── plugin.json
    ├── index.js
    └── ...
```

Restart Signals & Sorcery. The plugin appears in the workstation accordion and can be enabled/disabled in the Plugin Manager settings panel.

## Settings Form

If your plugin returns a schema from `getSettingsSchema()`, the host auto-renders a settings form in the Plugin Manager panel. Settings are persisted globally via `host.settings`:

```typescript
// Read a setting (with default)
const density = host.settings.get<number>('density', 4);

// Write a setting
host.settings.set('density', 8);

// React to setting changes
const unsub = host.settings.onChange((key, value) => {
  console.log(`Setting ${key} changed to`, value);
});
```

## Debugging

### Common Errors

| Error Code | Cause | Fix |
|------------|-------|-----|
| `NOT_OWNED` | Tried to modify a track created by another plugin | Only modify tracks returned by `createTrack()` or `getPluginTracks()` |
| `NO_ACTIVE_SCENE` | Called a track/MIDI method with no scene selected | Check `activeSceneId` before operating |
| `TRACK_LIMIT_EXCEEDED` | Created more than 16 tracks in one scene | Delete unused tracks or increase limit |
| `CAPABILITY_DENIED` | Called a gated method without the manifest capability | Add the required capability to `plugin.json` |
| `INCOMPATIBLE` | Plugin's `minHostVersion` is newer than the host | Update Signals & Sorcery or lower the version requirement |

### Tips

- **Check `isConnected`** before engine operations — the engine may not be ready yet
- **Check `activeSceneId`** before track/MIDI operations — it can be `null`
- **Use `showToast()`** to surface errors to the user during development
- **Use `logMetric()`** to track performance of expensive operations
- **Use `startTimer()`** for easy duration measurement:
  ```typescript
  const stop = host.startTimer('midi-generation');
  // ... do work ...
  stop(); // automatically logs duration
  ```
