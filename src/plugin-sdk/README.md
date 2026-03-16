---
sidebar: auto
---

# Plugin SDK

Signals & Sorcery has an extensible plugin system that lets you build custom **input generators** for the Loop Workstation. Plugins can generate MIDI patterns, manage audio samples, create AI-generated audio textures, or combine all three.

## How It Works

A plugin is a directory containing a `plugin.json` manifest and a module that implements the `GeneratorPlugin` interface. Each plugin gets its own accordion section in the workstation UI and a scoped `PluginHost` API for interacting with tracks, MIDI, audio, and more.

```
my-plugin/
├── plugin.json          # Manifest (id, capabilities, entry point)
├── index.ts             # GeneratorPlugin implementation
└── components/
    └── Panel.tsx         # React UI component
```

### Architecture Overview

```
┌──────────────────────────────────────────────┐
│  Loop Workstation UI                         │
│  ┌────────────┐ ┌────────────┐ ┌──────────┐ │
│  │ Synth Gen  │ │ Sample     │ │ Your     │ │
│  │ (built-in) │ │ (built-in) │ │ Plugin   │ │
│  └─────┬──────┘ └─────┬──────┘ └────┬─────┘ │
│        │              │              │       │
│  ┌─────▼──────────────▼──────────────▼─────┐ │
│  │           PluginHost (scoped)           │ │
│  │  Ownership · Capabilities · Isolation   │ │
│  └─────────────────┬───────────────────────┘ │
│                    │                         │
│  ┌─────────────────▼───────────────────────┐ │
│  │         Tracktion Audio Engine          │ │
│  └─────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

Plugins never access the audio engine directly — all interaction goes through the `PluginHost` API, which enforces ownership scoping, capability gating, and track limits.

## Quick Start

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
    return EuclideanPanel;
  }

  getSettingsSchema() {
    return null;
  }
}
```

### 3. Build the UI Component

```tsx
function EuclideanPanel({ host, activeSceneId }: PluginUIProps) {
  const handleGenerate = async () => {
    const track = await host.createTrack({ name: 'Euclidean', role: 'drums' });
    const context = await host.getMusicalContext();
    const notes = generateEuclidean(16, 5, context.bpm);

    await host.writeMidiClip(track.id, {
      startTime: 0,
      endTime: context.bars * 4 * 60 / context.bpm,
      tempo: context.bpm,
      notes,
    });
  };

  return <button onClick={handleGenerate}>Generate Pattern</button>;
}
```

## Documentation

| Page | Description |
|------|-------------|
| [Getting Started](./getting-started.md) | Directory structure, manifest options, installation, and debugging |
| [API Reference](./api-reference.md) | Complete PluginHost API with types, parameters, and code examples |
| [Tutorial](./tutorial.md) | Build a Euclidean Rhythm Generator plugin from scratch |

## Built-in Plugins

These ship with Signals & Sorcery and serve as reference implementations:

| Plugin | Type | Description |
|--------|------|-------------|
| `@sas/synth-generator` | midi | AI-powered MIDI generation with Surge XT |
| `@sas/sample-player` | sample | Sample library browser with time-stretching |
| `@sas/audio-texture` | audio | AI audio texture generation via Lyria 2 |

## Security Model

- **Ownership scoping** — Plugins can only modify tracks they created
- **Capability gating** — Network and file system access require manifest declarations
- **Secret isolation** — Each plugin's secrets are isolated via `storeSecret()`/`getSecret()`
- **Track limits** — 16 tracks per plugin per scene (configurable)
