---
sidebar: auto
---

![prologue](/sas_prologue.png)

## What is Signals & Sorcery?

Signals & Sorcery is a **Generative Audio Workstation (GAW)**, a new kind of music tool built around contract-based composing. Define a musical contract (key, chords, tempo, bars), then generate MIDI via **Gemini** and audio via **Stable Audio** and **Lyria** within those constraints. Preview privately in headphones, refine, and push approved material to your audience in real-time.

Most generative music tools are one-shot: type a prompt, get a finished song, and you're done. That works for background music, but it skips the creative process. Signals & Sorcery takes the opposite approach. You generate infinite MIDI and audio layers within a contract you define, then compose, preview, and perform with them. You get the speed of generation without giving up creative control.

The platform features hardware-level audio routing: separate headphone (cue) and main outputs let you audition generated clips privately before your audience hears them.

## Who is this for?

- **Generative Music Performers** who want to create and perform generated music live
- **Electronic Musicians** looking for a new approach to live performance with generative tools
- **Live Coders & Experimental Artists** who want intuitive, prompt-driven music generation
- **Streamers & Content Creators** who want to generate music in real-time while broadcasting
- **Anyone** who finds traditional live performance setups limiting and wants to explore generative approaches

## How does it work?

### Core Technology

- **Native Audio Engine**: Built on Tracktion Engine (C++) with JSON-RPC communication
- **Generative Models**: Uses **Gemini** for MIDI generation, and **Stable Audio** and **Lyria** for audio generation
- **Contract-Based Composing**: Define key, chords, BPM, and bars, and the generators compose within those constraints
- **Dual-Deck Architecture**: Composition Deck (preview) and Performance Deck (audience) with independent routing
- **Plugin SDK**: All generators (synths, samples, audio textures) are built on the extensible Plugin SDK
- **Custom Instrument Support**: Load any VST3/AU instrument plugin on synth tracks

### The Performance Workflow

1. **Define** - Set up a musical contract (key, chords, tempo, structure)
2. **Generate** - The generators compose MIDI and audio that fit your contract
3. **Preview** - Generated clips play in your headphones (cue output)
4. **Refine** - Iterate on the generation until you're satisfied
5. **Perform** - Push approved clips to the audience (main output)

### Key Features

- **Contract-Based Generation**: Musical contracts ensure coherent compositions across tracks
- **Gemini MIDI + Stable Audio & Lyria**: Purpose-built models for music generation
- **Private Preview**: Audition generated content in headphones before the audience hears it
- **Deck Transfer**: Move material from composition to performance deck
- **Plugin SDK**: Built-in synth, drum, instrument, sample, and audio generators plus a chat assistant, with upcoming integrations for Splice, ElevenLabs, live coding, and agentic prompting
- **Custom Instruments**: Load any VST3/AU synth plugin alongside or instead of the default Surge XT

## Video Tutorials

See Signals & Sorcery in action. Check out the [Video Tutorials](/tutorials/) for demos of MIDI generation, samples, plugins, and audio generation.

## Current Limitations

- **macOS (Apple Silicon) & Windows 10/11 (64-bit)**: Intel Macs and Linux are not supported
- **Surge XT Default**: Ships with Surge XT as the default synth, but any VST3/AU instrument can be loaded


