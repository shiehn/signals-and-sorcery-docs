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

### 🎼 Arrange Mode
Lay your scenes out as a full song, by hand, without leaving the app:

- **Compose on top, arrange at the bottom**: drop scenes onto a horizontal timeline, repeat them, and reorder them
- **Copies and linked copies**: edit one chorus and every linked chorus follows
- **Paint layers bar by bar**, including layers borrowed from other scenes, which keep their own scene's bus
- **Your real mix**: faders, pan and panel bus effects stay live while the song plays; only sound changes re-render

[Arrange Mode guide →](/arrange/)

### 🧩 Extensible Plugin SDK
All built-in panels run on the Plugin SDK. These are on by default:

- **Drums** - Drum-pattern MIDI with a built-in sample-based drum sampler
- **Instruments** - Pitched, polyphonic sample-based instruments
- **Synths** - MIDI generation played through Surge XT or any VST3/AU instrument
- **Bass** - One monophonic bassline from your description
- **Ensemble** - Two to six voices written together, for Strings, Horns or Winds
- **Arpeggiator** - A repeating arp pattern designed from your description
- **Pads** - The scene's chords voiced as sustained pads that rotate across Surge XT patches
- **Loops** - Audio loop and sample browser with time-stretching and effects

Turn these on in the plugins panel when you want them:

- **Stems** - Audio from text prompts, with optional stem splitting
- **Chat** - An assistant that builds and edits your scene from plain-language requests
- **Recorder** - Loop-aware microphone recording
- **Animate** - Movement over time: pumper, autopan, tremolo, trance gate, filter sweeps, risers, ducking and more
- **Mix Assets** - A palette of hits, risers and shots
- **Text2Voice** - Paste some text and hear it sung over your scene
- **Freesound** - Sounds from freesound.org that match the scene's key and BPM
- **Synth V** - Vocal lines sung through Synthesizer V Studio 2 Pro (needs Synth V and an installed voice)

Upcoming plugin integrations: **Splice**, **ElevenLabs**, **live coding**, and **agentic prompting**.

### 🎧 Audio Output

- **One stereo output** for everything: built-in audio, headphones or any interface
- Follows your system output device, or stays on the one you choose
- Pick the channel pair on multi-output interfaces, and set the buffer size
- **Master FX** for your monitoring (room correction, headphone virtualization), never printed to exports

[Audio Output guide →](./audio-routing.md)

### 🎹 Instrument Support

- **Surge XT** ships as the default synth with bundled presets
- **Any VST3/AU instrument** can be loaded per track via the instrument selector
- The synth generator picks appropriate Surge XT patches based on sound descriptions
- Custom instruments preserve their state across scenes and project save/load

[How to load your own VST3/AU instruments →](/custom-sounds/#load-your-own-instrument-plugins-vst3-au)

### ❄ Freeze

Free up CPU by turning a track's instrument and effects into audio:

- **The track ❄** on a track row renders that track to a stem and plays it instead of the live instrument. Your mixer (volume, pan, mute, solo) stays live. Click it again to unfreeze.
- **The scene ❄** in the scene list freezes every track in that scene, and **Freeze ALL** (the ❄ in the Scenes title bar) freezes the whole project. While a batch runs, their counts tick up one track at a time (0/7, 1/7 … 7/7).
- Tracks with an instrument (MIDI tracks) can freeze; audio tracks such as loops and stems can't.
- Change a frozen track's sound and it unfreezes itself so you hear the edit; a note tells you why. Unfreezing brings back the instrument and effects exactly as they were, including each plugin's Dry/Wet setting.
- Changed an instrument inside its own plugin window? The app can't see that, so use **↻ Force re-render stem** in the track's drawer.
- Playback stops while a stem renders.

### 🗂️ Bring Your Own Sounds

- **Import your own sample libraries** — drop your WAV drum kits and instrument
  samples into the drum and instrument generators; they sit alongside (or replace)
  the factory packs and feed generation and shuffle automatically
- **Load your own instrument plugins** — put any VST3/AU synth or sampler on a synth track
- Imports are kept separate from shipped packs, copied safely, and easy to back up

[Custom Sounds guide →](/custom-sounds/)

### 🔄 Scene-Based Composition

Organize your music into scenes:
- Group tracks into logical units that share a contract
- Duplicate scenes to try variations
- Arrange scenes into a full song in [Arrange mode](/arrange/)
