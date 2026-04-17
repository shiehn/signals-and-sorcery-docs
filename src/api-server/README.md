---
sidebar: auto
---

![sorceress](/sas_sorceress.png)

## Core Features

### 🎵 Contract-Based Composing
Define a musical contract and let AI generate within those constraints:

- Set **key, chords, BPM, and bars** to establish the musical framework
- AI generates MIDI via **Gemini** that respects the contract
- AI generates audio via **Lyria** for texture and atmosphere
- All tracks in a scene share the same contract for coherent compositions

### 🎛️ Dual-Deck Performance Workflow
Built around the core concept of private preview and public performance:

- **Composition Deck** - Generate and preview clips in headphones
- **Performance Deck** - Play approved clips for your audience

### 🧩 Extensible Plugin SDK
All built-in generators run on the Plugin SDK:

- **Synth Generator** - AI MIDI generation with Gemini, played through Surge XT or any VST3/AU instrument
- **Sample Player** - Sample-based tracks with FX chains
- **Audio Texture** - AI audio generation with Lyria

Upcoming plugin integrations: **Splice**, **ElevenLabs**, **live coding**, and **agentic prompting**.

### 🎧 Audio Routing Modes

Hardware-level support for headphone/main output separation:

- **Solo Mode** - Single output for practice and production
- **Performance Mode** - Separate Cue (headphones) and Master (PA/speakers) outputs
- **Stream Mode** - Route Master to OBS/Twitch while monitoring privately in headphones

[View Audio Routing Documentation →](./audio-routing.md)

### 🎹 Instrument Support

- **Surge XT** ships as the default synth with bundled presets
- **Any VST3/AU instrument** can be loaded per track via the instrument selector
- AI selects appropriate Surge XT patches based on sound descriptions
- Custom instruments preserve their state across scenes and project save/load

### 🔄 Scene-Based Composition

Organize your performance into scenes:
- Group tracks into logical units
- Clone scenes between decks
- Build setlists for live performance
