---
sidebar: auto
---

![prologue](/sas_prologue.png)

## What is Signals & Sorcery?

Signals & Sorcery is a **Generative Audio Workstation (GAW)** — a new kind of music tool built around contract-based composing. Define a musical contract (key, chords, tempo, bars), then let AI generate MIDI via **Gemini** and audio via **Lyria** within those constraints. Preview privately in headphones, refine, and push approved material to your audience in real-time.

The platform features hardware-level audio routing: separate headphone (cue) and main outputs let you audition AI-generated clips privately before your audience hears them.

## Who is this for?

- **Generative Music Performers** who want to create and perform AI-generated music live
- **Electronic Musicians** looking for a new approach to live performance with AI assistance
- **Live Coders & Experimental Artists** who want intuitive AI-driven music generation
- **Streamers & Content Creators** who want to generate music in real-time while broadcasting
- **Anyone** who finds traditional live performance setups limiting and wants to explore generative approaches

## How does it work?

### Core Technology

- **Native Audio Engine**: Built on Tracktion Engine (C++) with JSON-RPC communication
- **AI-Powered Generation**: Uses **Gemini** for MIDI generation and **Lyria** for audio generation
- **Contract-Based Composing**: Define key, chords, BPM, and bars — AI composes within those constraints
- **Dual-Deck Architecture**: Loop A (composition/preview) and Loop B (performance/audience) with independent routing
- **Plugin SDK**: All generators (synths, samples, audio textures) are built on the extensible Plugin SDK
- **Custom Instrument Support**: Load any VST3/AU instrument plugin on synth tracks

### The Performance Workflow

1. **Define** - Set up a musical contract (key, chords, tempo, structure)
2. **Generate** - AI composes MIDI and audio that fits your contract
3. **Preview** - Generated clips play in your headphones (cue output)
4. **Refine** - Iterate on the generation until you're satisfied
5. **Perform** - Push approved clips to the audience (main output)

### Key Features

- **Contract-Based Generation**: Musical contracts ensure coherent compositions across tracks
- **Gemini MIDI + Lyria Audio**: Purpose-built AI models for music generation
- **Private Preview**: Audition generated content in headphones before the audience hears it
- **Deck Transfer**: Move material from composition to performance deck
- **Plugin SDK**: Built-in synth, sample, and audio texture generators — with upcoming integrations for Splice, ElevenLabs, live coding, and agentic prompting
- **Custom Instruments**: Load any VST3/AU synth plugin alongside or instead of the default Surge XT

## Current Limitations

- **macOS Only**: Tested on M-series & Intel chips (Windows/Linux not supported)
- **Surge XT Default**: Ships with Surge XT as the default synth, but any VST3/AU instrument can be loaded


