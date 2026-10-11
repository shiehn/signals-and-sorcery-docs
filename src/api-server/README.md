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
- **Synth V** - Vocal lines sung through Synthesizer V Studio 2 Pro (needs Synth V and an installed voice); lyrics with several verses become one take per verse (see [Lyrics per verse](#lyrics-per-verse))

Upcoming plugin integrations: **Splice**, **ElevenLabs**, **live coding**, and **agentic prompting**.

### 🎤 Singing with Synth V

The **Synth V** panel sings your words through Synthesizer V Studio 2 Pro: type or
paste the lyrics, pick a style and press **Sing**. The melody and harmonies are
composed to fit your scene, the take opens in Synth V, and once it is bounced each
voice lands on its own lane in Signals & Sorcery.

#### Lyrics per verse

Write the lyrics as verses: leave a **blank line** between them, or start each with
a line such as `[Verse 2]` (header lines are never sung). Press **Sing** and you get
**one take per verse, all on the same melody**, in one Synth V project and one
bounce: each verse's words on its own lanes, named **V1 Lead**, **V2 Lead** and so on
(harmonies included), with a **Verse 1**, **Verse 2** header above each take's rows
in the panel.

The takes form a set of alternatives, so in [Arrange mode](/arrange/#takes) **each
section sings its own verse** by its position: the first verse section sings verse 1,
the second sings verse 2, with nothing to set. Right-click a section and open
**Take ▸** to pin a different verse.

- The verses times the voices, plus the scene's other Synth V lanes, must fit in 16 lanes. If they don't, Sing refuses before anything is created and gives the numbers: "3 verses × 6 voices = 18 lanes, but this scene has room for 16: use fewer verses or voices."
- One verse behaves exactly as before: a single take, with the lanes named as they were.
- After **✍ New words**, the next **Sing** sings the new words.

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

- **Import your own sample libraries**: drop your WAV drum kits and instrument
  samples into the drum and instrument generators; they sit alongside (or replace)
  the factory packs and feed generation and shuffle automatically
- **Load your own instrument plugins**: put any VST3/AU synth or sampler on a synth track
- Imports are kept separate from shipped packs, copied safely, and easy to back up

[Custom Sounds guide →](/custom-sounds/)

### 🔄 Scene-Based Composition

Organize your music into scenes:
- Group tracks into logical units that share a contract
- Duplicate scenes to try variations
- Arrange scenes into a full song in [Arrange mode](/arrange/)
