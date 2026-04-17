---
sidebar: auto
---

# Tutorial: Euclidean Rhythm Generator

Build a complete plugin that generates polyrhythmic drum patterns using the Euclidean algorithm. By the end, you'll have a working plugin with a React UI, scene-scoped state persistence, and MIDI post-processing.

## What We're Building

The **Euclidean algorithm** distributes a number of pulses as evenly as possible across a number of steps. For example, `E(5, 16)` produces `[x . . x . . x . . x . . x . . . .]` — the pattern behind many classic rhythms.

Our plugin will:
- Create a drum track with Surge XT loaded
- Let the user configure steps, pulses, and rotation per layer
- Generate MIDI from the Euclidean pattern
- Persist configuration per scene
- Use post-processing for swing and humanization

## Step 1: Project Setup

Create the plugin directory. The parent path depends on your OS —
see [Install a Plugin](./install-a-plugin.md) for Windows / Linux paths.

```bash
# macOS example
mkdir -p ~/Library/Application\ Support/signals-and-sorcery/plugins/euclidean-rhythm
cd ~/Library/Application\ Support/signals-and-sorcery/plugins/euclidean-rhythm
```

Easier shortcut: open **Settings → Plugins → Open Folder** in the app to
reveal the correct plugins directory — then `cd` into it.

### plugin.json

```json
{
  "id": "@tutorial/euclidean-rhythm",
  "displayName": "Euclidean Rhythms",
  "version": "1.0.0",
  "description": "Generate polyrhythmic patterns using the Euclidean algorithm",
  "generatorType": "midi",
  "main": "index.js",
  "minHostVersion": "1.0.0",
  "capabilities": {
    "requiresSurgeXT": true
  },
  "settings": {
    "defaultVelocity": {
      "type": "number",
      "label": "Default Velocity",
      "description": "Default MIDI velocity for generated notes",
      "default": 100,
      "min": 1,
      "max": 127
    }
  }
}
```

We declare `requiresSurgeXT` because we'll load Surge XT as the drum synth.

## Step 2: The Euclidean Algorithm

Create `lib/euclidean.ts`:

```typescript
/**
 * Bjorklund's algorithm: distribute `pulses` evenly across `steps`.
 * Returns a boolean array where `true` = hit.
 */
export function euclidean(steps: number, pulses: number, rotation: number = 0): boolean[] {
  if (pulses >= steps) return new Array(steps).fill(true);
  if (pulses <= 0) return new Array(steps).fill(false);

  // Bjorklund's algorithm
  let pattern: number[][] = [];
  const remainder: number[][] = [];

  for (let i = 0; i < pulses; i++) pattern.push([1]);
  for (let i = 0; i < steps - pulses; i++) remainder.push([0]);

  let remainderCount = remainder.length;

  while (remainderCount > 1) {
    const newPattern: number[][] = [];
    const newRemainder: number[][] = [];
    const min = Math.min(pattern.length, remainderCount);

    for (let i = 0; i < min; i++) {
      newPattern.push([...pattern[i], ...remainder[i]]);
    }

    if (pattern.length > remainderCount) {
      for (let i = min; i < pattern.length; i++) {
        newRemainder.push(pattern[i]);
      }
    } else {
      for (let i = min; i < remainderCount; i++) {
        newRemainder.push(remainder[i]);
      }
    }

    pattern = newPattern;
    remainderCount = newRemainder.length;
    remainder.length = 0;
    remainder.push(...newRemainder);
  }

  // Flatten
  const flat = [...pattern.flat(), ...remainder.flat()];

  // Rotate
  const rot = ((rotation % steps) + steps) % steps;
  const result = [...flat.slice(rot), ...flat.slice(0, rot)];

  return result.map(v => v === 1);
}
```

## Step 3: Plugin Implementation

Create `index.ts`:

```typescript
import type {
  GeneratorPlugin,
  PluginHost,
  PluginUIProps,
  PluginMidiNote,
  PluginSettingsSchema,
  MusicalContext,
} from '@signalsandsorcery/plugin-sdk';
import { EuclideanPanel } from './components/Panel';

/** Per-layer config stored in scene data */
export interface LayerConfig {
  steps: number;
  pulses: number;
  rotation: number;
  pitch: number;     // MIDI note for this layer
  velocity: number;
  enabled: boolean;
}

/** Full pattern config stored per scene */
export interface PatternConfig {
  layers: LayerConfig[];
  swing: number;
  humanize: number;
}

export const DEFAULT_LAYERS: LayerConfig[] = [
  { steps: 16, pulses: 4, rotation: 0, pitch: 36, velocity: 110, enabled: true },  // Kick
  { steps: 16, pulses: 4, rotation: 4, pitch: 38, velocity: 100, enabled: true },  // Snare
  { steps: 16, pulses: 5, rotation: 0, pitch: 42, velocity: 90, enabled: true },   // Hi-hat
];

export const DEFAULT_CONFIG: PatternConfig = {
  layers: DEFAULT_LAYERS,
  swing: 0,
  humanize: 10,
};

export class EuclideanRhythmPlugin implements GeneratorPlugin {
  readonly id = '@tutorial/euclidean-rhythm';
  readonly displayName = 'Euclidean Rhythms';
  readonly version = '1.0.0';
  readonly description = 'Generate polyrhythmic patterns using the Euclidean algorithm';
  readonly generatorType = 'midi' as const;

  private host: PluginHost | null = null;

  async activate(host: PluginHost): Promise<void> {
    this.host = host;
  }

  async deactivate(): Promise<void> {
    this.host = null;
  }

  getUIComponent() {
    return EuclideanPanel;
  }

  getSettingsSchema(): PluginSettingsSchema {
    return {
      type: 'object',
      properties: {
        defaultVelocity: {
          type: 'number',
          label: 'Default Velocity',
          description: 'Default MIDI velocity for generated notes',
          default: 100,
          min: 1,
          max: 127,
        },
      },
    };
  }

  async onSceneChanged(sceneId: string | null): Promise<void> {
    // The UI component handles scene changes via the activeSceneId prop
  }

  onContextChanged(context: MusicalContext): void {
    // Could auto-regenerate here if desired
  }
}
```

## Step 4: React UI Component

Create `components/Panel.tsx`:

```tsx
import React from 'react';
import type { PluginUIProps, PluginMidiNote } from '@signalsandsorcery/plugin-sdk';
import { euclidean } from '../lib/euclidean';
import type { PatternConfig, LayerConfig } from '../index';
import { DEFAULT_CONFIG } from '../index';

export function EuclideanPanel({ host, activeSceneId, isConnected }: PluginUIProps) {
  const [config, setConfig] = React.useState<PatternConfig>(DEFAULT_CONFIG);
  const [isGenerating, setIsGenerating] = React.useState(false);

  // Load saved config when scene changes
  React.useEffect(() => {
    if (!activeSceneId) return;
    host.getSceneData<PatternConfig>(activeSceneId, 'config').then(saved => {
      if (saved) setConfig(saved);
      else setConfig(DEFAULT_CONFIG);
    });
  }, [activeSceneId]);

  // Save config whenever it changes
  React.useEffect(() => {
    if (!activeSceneId) return;
    host.setSceneData(activeSceneId, 'config', config);
  }, [config, activeSceneId]);

  const updateLayer = (index: number, update: Partial<LayerConfig>) => {
    setConfig(prev => ({
      ...prev,
      layers: prev.layers.map((layer, i) =>
        i === index ? { ...layer, ...update } : layer
      ),
    }));
  };

  const handleGenerate = async () => {
    if (!activeSceneId || !isConnected) return;
    setIsGenerating(true);
    host.setStatusMessage('Generating...');

    try {
      // Get or create our track
      let tracks = await host.getPluginTracks();
      let track = tracks[0];

      if (!track) {
        track = await host.createTrack({
          name: 'Euclidean Drums',
          role: 'drums',
          loadSynth: true,
        });
      }

      host.setProgress(track.id, 30);

      // Get musical context
      const context = await host.getMusicalContext();
      const beatsPerBar = parseInt(context.timeSignature.split('/')[0], 10);
      const totalBeats = context.bars * beatsPerBar;

      // Generate notes from all enabled layers
      const allNotes: PluginMidiNote[] = [];

      for (const layer of config.layers) {
        if (!layer.enabled) continue;

        const pattern = euclidean(layer.steps, layer.pulses, layer.rotation);
        const beatStep = totalBeats / layer.steps;

        for (let i = 0; i < pattern.length; i++) {
          if (pattern[i]) {
            allNotes.push({
              pitch: layer.pitch,
              startBeat: i * beatStep,
              durationBeats: beatStep * 0.8,  // Slightly shorter than grid
              velocity: layer.velocity,
            });
          }
        }
      }

      host.setProgress(track.id, 60);

      // Post-process for swing and humanization
      const processed = await host.postProcessMidi(allNotes, {
        quantize: false,            // Already on grid from algorithm
        swing: config.swing,
        humanize: config.humanize,
        removeOverlaps: true,
      });

      host.setProgress(track.id, 80);

      // Write to track
      const secondsPerBeat = 60 / context.bpm;
      await host.writeMidiClip(track.id, {
        startTime: 0,
        endTime: totalBeats * secondsPerBeat,
        tempo: context.bpm,
        notes: processed,
      });

      host.setProgress(track.id, -1);
      host.setStatusMessage(null);
      host.showToast('success', 'Pattern Generated',
        `${processed.length} notes across ${config.layers.filter(l => l.enabled).length} layers`
      );
    } catch (err) {
      host.setStatusMessage(null);
      host.showToast('error', 'Generation Failed', String(err));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Layer Controls */}
      {config.layers.map((layer, i) => (
        <LayerRow
          key={i}
          layer={layer}
          index={i}
          onChange={(update) => updateLayer(i, update)}
        />
      ))}

      {/* Global Controls */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <label>
          Swing: {config.swing}%
          <input
            type="range" min={0} max={100} value={config.swing}
            onChange={e => setConfig(prev => ({ ...prev, swing: Number(e.target.value) }))}
          />
        </label>
        <label>
          Humanize: {config.humanize}%
          <input
            type="range" min={0} max={100} value={config.humanize}
            onChange={e => setConfig(prev => ({ ...prev, humanize: Number(e.target.value) }))}
          />
        </label>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating || !activeSceneId || !isConnected}
      >
        {isGenerating ? 'Generating...' : 'Generate Pattern'}
      </button>
    </div>
  );
}

/** Single layer row with pattern visualization */
function LayerRow({
  layer, index, onChange,
}: {
  layer: LayerConfig;
  index: number;
  onChange: (update: Partial<LayerConfig>) => void;
}) {
  const pattern = euclidean(layer.steps, layer.pulses, layer.rotation);
  const labels = ['Kick', 'Snare', 'Hi-hat'];

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', opacity: layer.enabled ? 1 : 0.5 }}>
      {/* Enable toggle */}
      <input
        type="checkbox" checked={layer.enabled}
        onChange={e => onChange({ enabled: e.target.checked })}
      />

      {/* Label */}
      <span style={{ width: '60px', fontWeight: 'bold' }}>
        {labels[index] || `Layer ${index + 1}`}
      </span>

      {/* Pattern visualization */}
      <div style={{ display: 'flex', gap: '2px' }}>
        {pattern.map((hit, i) => (
          <div
            key={i}
            style={{
              width: '12px', height: '12px', borderRadius: '2px',
              background: hit ? '#4ade80' : '#333',
              border: '1px solid #555',
            }}
          />
        ))}
      </div>

      {/* Steps / Pulses / Rotation */}
      <label>
        S:<input
          type="number" min={2} max={32} value={layer.steps}
          style={{ width: '40px' }}
          onChange={e => onChange({ steps: Number(e.target.value) })}
        />
      </label>
      <label>
        P:<input
          type="number" min={0} max={layer.steps} value={layer.pulses}
          style={{ width: '40px' }}
          onChange={e => onChange({ pulses: Number(e.target.value) })}
        />
      </label>
      <label>
        R:<input
          type="number" min={0} max={layer.steps - 1} value={layer.rotation}
          style={{ width: '40px' }}
          onChange={e => onChange({ rotation: Number(e.target.value) })}
        />
      </label>
    </div>
  );
}
```

## Step 5: Understanding Key Concepts

### Ownership Scoping

When your plugin calls `host.createTrack()`, the host records that your plugin owns that track. You can only modify tracks you own:

```typescript
// This works — you created this track
const track = await host.createTrack({ name: 'My Drums' });
await host.writeMidiClip(track.id, clipData);

// This throws NOT_OWNED — track belongs to another plugin
await host.writeMidiClip(someOtherTrackId, clipData);
```

Use `host.getPluginTracks()` to retrieve your tracks when the scene changes.

### Scene-Scoped Data

Plugin data is scoped to scenes. When the user switches scenes, your stored data goes with it:

```typescript
// Save config for the current scene
await host.setSceneData(activeSceneId, 'config', myConfig);

// Load when scene changes (in useEffect or onSceneChanged)
const saved = await host.getSceneData<PatternConfig>(activeSceneId, 'config');
```

### MIDI Post-Processing

The host provides a full MIDI processing pipeline. Instead of implementing quantization and swing yourself, delegate to the host:

```typescript
const processed = await host.postProcessMidi(rawNotes, {
  quantize: true,
  quantizeGrid: '1/16',
  swing: 25,
  humanize: 10,
  enforceScale: true,     // Uses the scene's key/mode
  clampRegister: [36, 72], // Keep notes in range
});
```

### Musical Context

Always use the scene's musical context for timing calculations:

```typescript
const ctx = await host.getMusicalContext();
// ctx.bpm = 120
// ctx.bars = 4
// ctx.key = 'C'
// ctx.mode = 'minor'
// ctx.timeSignature = '4/4'
// ctx.chordProgression = [{ symbol: 'Cm7', startQn: 0, endQn: 4 }, ...]

const secondsPerBeat = 60 / ctx.bpm;
const totalBeats = ctx.bars * parseInt(ctx.timeSignature.split('/')[0], 10);
const clipDuration = totalBeats * secondsPerBeat;
```

## Step 6: Install and Test

1. Build your TypeScript to JavaScript (the host loads the `main` entry from `plugin.json`):

```bash
npx tsc --outDir .
```

2. Restart Signals & Sorcery

3. Your plugin should appear as an accordion section in the Loop Workstation

4. Create a scene, then click **Generate Pattern**

### Testing Checklist

- [ ] Plugin appears in the workstation accordion
- [ ] Pattern visualization updates when changing steps/pulses/rotation
- [ ] Generate button creates a track with MIDI notes
- [ ] Pattern persists when switching away and back to the scene
- [ ] Swing and humanize controls affect the output
- [ ] Disabling a layer excludes it from generation
- [ ] Error toasts appear if no scene is selected

## Next Steps

Ideas for extending this plugin:

- **Add more layers** with an "Add Layer" button
- **MIDI pitch mapping** — let users assign any MIDI note per layer
- **Preset management** — save/load pattern configurations using `host.savePluginPreset()`
- **Live preview** — use `host.auditionNote()` to preview patterns before committing
- **AI-assisted patterns** — use `host.generateWithLLM()` to suggest interesting step/pulse combinations based on the genre
- **Transport sync** — use `host.onDeckBoundary()` to regenerate patterns on each loop

See the [API Reference](./api-reference.md) for the complete list of available methods.
