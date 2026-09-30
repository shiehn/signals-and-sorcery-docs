---
sidebar: auto
---

![prologue](/sas_prologue.png)

## What is Signals & Sorcery?

Signals & Sorcery is a **Generative Audio Workstation (GAW)**, a new kind of music tool built around contract-based composing. Define a musical contract (key, chords, tempo, bars), then generate MIDI via **Gemini** and audio via **Stable Audio** and **Lyria** within those constraints. Preview and refine your layers, arrange your scenes into a full song, then export a mix, a master or stems, or send everything to Ableton Live.

Most generative music tools are one-shot: type a prompt, get a finished song, and you're done. That works for background music, but it skips the creative process. Signals & Sorcery takes the opposite approach. You generate infinite MIDI and audio layers within a contract you define, then compose, preview, and arrange them yourself. You get the speed of generation without giving up creative control.

## Who is this for?

- **Producers & Electronic Musicians** who want generated layers without giving up creative control
- **Songwriters & Composers** who sketch sections quickly and arrange them into full songs
- **Live Coders & Experimental Artists** who want intuitive, prompt-driven music generation
- **Streamers & Content Creators** who want to make music while broadcasting
- **Ableton Live users** who want to generate parts and finish them in Live

## How does it work?

### Core Technology

- **Native Audio Engine**: Built on Tracktion Engine (C++) with JSON-RPC communication
- **Generative Models**: Uses **Gemini** for MIDI generation, and **Stable Audio** and **Lyria** for audio generation
- **Contract-Based Composing**: Define key, chords, BPM, and bars, and the generators compose within those constraints
- **Composer + Arranger**: compose scenes on top, arrange them into a song at the bottom ([Arrange mode](/arrange/))
- **Plugin SDK**: All generators (synths, samples, audio textures) are built on the extensible Plugin SDK
- **Custom Instrument Support**: Load any VST3/AU instrument plugin on synth tracks

### The Workflow

1. **Define** - Set up a musical contract (key, chords, tempo, structure)
2. **Generate** - The generators compose MIDI and audio that fit your contract
3. **Preview** - Press Play to hear the scene in the composer
4. **Refine** - Iterate on the generation until you're satisfied
5. **Arrange** - Lay your scenes out as a song in [Arrange mode](/arrange/)
6. **Export** - Render a mix, a master or stems, or send the song to Ableton Live

### Key Features

- **Contract-Based Generation**: Musical contracts ensure coherent compositions across tracks
- **Gemini MIDI + Stable Audio & Lyria**: Purpose-built models for music generation
- **Arrange Mode**: Build a full song from your scenes with copies, linked copies, bar-by-bar layers, fades and effects
- **Export**: A reference mix, a loudness-targeted master, stems that sum to the mix, and a hand-off to Ableton Live
- **Plugin SDK**: Built-in synth, drum, instrument, sample, and audio generators plus a chat assistant, with upcoming integrations for Splice, ElevenLabs, live coding, and agentic prompting
- **Custom Instruments**: Load any VST3/AU synth plugin alongside or instead of the default Surge XT

## Video Tutorials

See Signals & Sorcery in action. Check out the [Video Tutorials](/tutorials/) for demos of MIDI generation, samples, plugins, and audio generation.

## Current Limitations

- **macOS (Apple Silicon) & Windows 10/11 (64-bit)**: Intel Macs and Linux are not supported
- **Surge XT Default**: Ships with Surge XT as the default synth, but any VST3/AU instrument can be loaded


