---
sidebar: auto
---

![getting-started](/sas_getting_started.png)

## Quick Start Guide

### System Requirements

- **macOS** with Apple M-Series or Intel chip
- **Surge XT** synthesizer plugin (auto-installed by setup wizard)
- **Internet connection** for AI generation features
- **Solo and Performance modes** (Audio interface with 4+ outputs required for performance with headphone/main separation)

### Installation

#### 1. Download Signals & Sorcery

Choose the version for your system:

- **[Apple Silicon Mac (M1/M2/M3/M4)](https://storage.googleapis.com/docs-assets/signals-and-sorcery-2_40_0-arm64.dmg)** - Download for Apple Silicon Macs
- **[Intel Mac (x64)](https://storage.googleapis.com/docs-assets/signals-and-sorcery-2_40_0-x64.dmg)** - Download for Intel Macs

**Note:** The app is signed and notarized by Apple for security.

#### 2. Install and Launch

1. Double-click the downloaded DMG file to open it
2. Drag Signals & Sorcery to your Applications folder
3. Launch the app from Applications
4. **The setup wizard will guide you through installing Surge XT and configuring everything automatically**

![runes_cli](/sas_runes_cli_2.png)

### The Performance Workflow

Signals & Sorcery is a **Generative Audio Workstation (GAW)** built around contract-based composing. Define a musical contract, generate content, preview privately, and perform to your audience.

#### Core Concepts

- **Musical Contract** - Key, chords, BPM, and bars that define the compositional framework
- **Composition Deck** - Generate and preview clips in your headphones
- **Performance Deck** - Play approved clips for your audience

#### Basic Workflow

1. **Define a Contract** - Set key, chords, tempo, and structure for your scene

2. **Generate** - AI creates clips that fit your contract:
   - **Gemini** generates MIDI for synth tracks
   - **Lyria** generates audio for texture tracks

3. **Preview** - Generated clips play in your headphones (cue output)

4. **Approve** - Push clips you like to the performance deck

5. **Perform** - Audience hears only the performance deck (main output)

### Audio Routing Modes

#### Solo Mode (Single Output)
For practicing or single-speaker setups. Listen to one source at a time.

#### Performance Mode (Recommended)
Requires a 4+ channel audio interface:
- **Cue Output** (channels 1-2) → Headphones for private preview
- **Main Output** (channels 3-4) → Speakers/PA for audience

This is the core workflow: compose in headphones, push to audience.

#### Stream Mode
For Twitch/YouTube streaming:
- **Cue Output** → Your headphones
- **Main Output** → Stream audio (via BlackHole virtual audio)

See [Audio Routing](/api-server/audio-routing.html) for detailed setup instructions.

### Troubleshooting

#### Audio Not Playing
- **Check Audio Settings** - Ensure your audio output device is correctly configured
- **Verify Surge XT Installation** - The setup wizard should have installed Surge XT automatically
- **Restart the App** - Close and reopen Signals & Sorcery

#### Surge XT Not Loading
- **Re-run Setup Wizard** - Go to Settings and re-run the plugin installation
- **Check Architecture** - Ensure you installed the version matching your Mac (Apple Silicon or Intel)
- **Manual Installation** - See the manual installation section below

#### Clips Not Generating
- **Check Track Has Instrument** - Ensure the track has an instrument loaded (Surge XT or a custom VST3/AU plugin)
- **Verify Track Is Not Muted** - Unmute the track and check volume levels
- **Check Playback** - Press play to start playback
- **Rate Limits** - Daily token limits are set per user for the free tier

### Tips for Best Results

- **Be Specific** - Describe sounds in detail: "punchy techno kick with long decay" works better than just "kick"
- **Use Contracts** - Set key, chords, and tempo before generating for coherent results
- **One Task at a Time** - Break complex requests into steps
- **Iterate** - Generate, listen, then ask for adjustments
- **Use Musical Terms** - The system understands keys, scales, chord progressions, rhythmic patterns, etc.

### Next Steps

- Watch the [Video Tutorials](/tutorials/) to see each feature in action
- Experiment with different sound descriptions and musical contracts
- Set up Performance Mode for dual-deck workflow
- Explore the [Audio Routing](/api-server/audio-routing.html) options for your setup
- Check the [Features](/api-server/) section for advanced capabilities
- Read the [Plugin SDK](/plugin-sdk/) documentation to build custom generators

---

### Manual Dependency Installation (Optional)

**Note:** The setup wizard handles dependency installation automatically. The steps below are only needed if you prefer to install dependencies manually.

#### Install Surge XT

1. Download Surge XT from [https://surge-synthesizer.github.io/](https://surge-synthesizer.github.io/)
2. Download the version matching your Mac:
   - **macOS (Apple Silicon)** for M-Series Macs
   - **macOS (Intel)** for Intel Macs
3. Run the installer - it will install the VST3 plugin to the correct location

![getting-started](/sas_patch_bay.png)
