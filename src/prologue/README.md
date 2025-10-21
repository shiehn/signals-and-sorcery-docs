---
sidebar: auto
---

![prologue](/sas_prologue.png)

## What is Signals & Sorcery?

Signals & Sorcery is an AI-powered DAW agent for REAPER that specializes in MIDI generation and music production workflow automation. Describe the sounds you want in natural language, and the AI will generate MIDI, configure synthesizer patches, and control your DAW - transforming creative ideas into music without manual programming or plugin diving.

## Who is this for?

- **Music Producers** who want to quickly sketch musical ideas using text descriptions
- **Electronic Musicians** working with MIDI and synthesizers (currently Surge XT)
- **REAPER Users** looking to speed up their creative workflow with AI assistance
- **Experimental Artists** who want to explore AI-driven music generation
- **Anyone** who finds traditional MIDI programming tedious and wants a more intuitive approach

## How does it work?

### Core Technology

- **Electron Desktop App**: Native macOS application with chat-based interface (Apple Silicon only)
- **AI-Powered MIDI Generation**: Uses OpenAI to interpret musical descriptions and generate MIDI data
- **REAPER Integration**: Lua bridge script (`__startup.lua`) communicates via MCP protocol
- **Surge XT Integration**: Automatically loads and configures synth patches based on sound descriptions
- **Deterministic FX Rack**: Fixed 6-slot system (Instrument, EQ, Distortion, Delay, Reverb, Compression)

### Key Features

- **Text-to-MIDI Generation**: Describe sounds ("punchy techno kick", "ambient pad chords") and get MIDI
- **Automatic Synth Configuration**: AI selects and configures appropriate Surge XT patches
- **Natural Language DAW Control**: Create tracks, manage FX, control transport, all through text
- **Zero-Friction Setup**: Bridge and presets auto-install on first launch
- **FX Preset System**: Bundled EQ, compression, reverb, delay, and distortion presets
- **Smart Workflow**: Multi-step operations executed automatically with state validation

## Current Limitations

- **macOS Apple Silicon Only**: Requires M1/M2/M3/M4 chip (Intel Mac and Windows/Linux not supported yet)
- **OpenAI API Required**: No offline mode, requires active OpenAI account with credits
- **Surge XT Dependency**: Currently only works with Surge XT synthesizer
- **MIDI-Focused**: Primarily designed for MIDI/synth-based production, not audio recording workflows




