---
sidebar: auto
---

![sorceress](/sas_sorceress.png)

## Core Features

### 🎵 Contract-Based Composing
Define a musical contract and generate within those constraints:

- Set **key, chords, BPM, and bars** to establish the musical framework
- **Gemini** generates MIDI that respects the contract
- **Lyria** generates audio for texture and atmosphere
- All tracks in a scene share the same contract for coherent compositions

### 🎛️ Dual-Deck Performance Workflow
Built around the core concept of private preview and public performance:

- **Composition Deck** - Generate and preview clips in headphones
- **Performance Deck** - Play approved clips for your audience

### 🧩 Extensible Plugin SDK
All built-in generators and tools run on the Plugin SDK:

- **Synth Generator** - MIDI generation with Gemini, played through Surge XT or any VST3/AU instrument
- **Drum Generator** - Drum-pattern MIDI generation with a built-in sample-based drum sampler
- **Instrument Generator** - MIDI generation for pitched, polyphonic sample-based instruments
- **Loops** - Sample / loop library browser with FX chains and time-stretching
- **Stems** - Audio-from-text generation with Lyria, with optional stem splitting
- **Chat** - Conversational assistant that builds and edits your scene from natural-language prompts
- **Recorder** - Loop-aware microphone recording (opt-in)

Upcoming plugin integrations: **Splice**, **ElevenLabs**, **live coding**, and **agentic prompting**.

### 🎧 Audio Routing Modes

Hardware-level support for headphone/main output separation:

- **Solo Mode** - Single output for practice and production
- **Performance Mode** - Separate Cue (headphones) and Master (PA/speakers) outputs

[View Audio Routing Documentation →](./audio-routing.md)

### 🎹 Instrument Support

- **Surge XT** ships as the default synth with bundled presets
- **Any VST3/AU instrument** can be loaded per track via the instrument selector
- The synth generator picks appropriate Surge XT patches based on sound descriptions
- Custom instruments preserve their state across scenes and project save/load

[How to load your own VST3/AU instruments →](/custom-sounds/#load-your-own-instrument-plugins-vst3-au)

### 🗂️ Bring Your Own Sounds

- **Import your own sample libraries** — drop your WAV drum kits and instrument
  samples into the drum and instrument generators; they sit alongside (or replace)
  the factory packs and feed generation and shuffle automatically
- **Load your own instrument plugins** — put any VST3/AU synth or sampler on a synth track
- Imports are kept separate from shipped packs, copied safely, and easy to back up

[Custom Sounds guide →](/custom-sounds/)

### 🔄 Scene-Based Composition

Organize your performance into scenes:
- Group tracks into logical units
- Clone scenes between decks
- Build setlists for live performance
