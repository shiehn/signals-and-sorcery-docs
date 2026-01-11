---
sidebar: auto
---

![getting-started](/sas_getting_started.png)

## Quick Start Guide

### System Requirements

- **macOS** with Apple M-Series or Intel chip
- **Surge XT** synthesizer plugin (auto-installed by setup wizard)
- **Internet connection** for generation features
- **Google Account** for login

### Installation

#### 1. Download Signals & Sorcery

Choose the version for your system:

- **[Apple Silicon Mac (M1/M2/M3/M4)](https://storage.googleapis.com/docs-assets/signals-and-sorcery-2_3_0-arm64.dmg)** - Download for Apple Silicon Macs
- **[Intel Mac (x64)](https://storage.googleapis.com/docs-assets/signals-and-sorcery-2_3_0-x64.dmg)** - Download for Intel Macs

**Note:** The app is signed and notarized by Apple for security.

#### 2. Install and Launch

1. Double-click the downloaded DMG file to open it
2. Drag Signals & Sorcery to your Applications folder
3. Launch the app from Applications
4. **The setup wizard will guide you through installing Surge XT and configuring everything automatically**

![runes_cli](/sas_runes_cli_2.png)

### Basic Usage

#### Getting Started

1. **Launch Signals & Sorcery** - Open the app from your Applications folder
2. **Sign In** - Log in with your Google account
3. **Start Creating** - Use the chat interface to describe sounds and generate music

#### Creating Music with MIDI

The core workflow is describing the sound you want for each track, and the AI will generate MIDI and configure the appropriate synth patches:

```
"create a synth sub bass"

"add a 4 on the floor kick"

"add a snare"

"add a synth padd on bars 2 and 4"
```

### Troubleshooting

#### Audio Not Playing
- **Check Audio Settings** - Ensure your audio output device is correctly configured in the app
- **Verify Surge XT Installation** - The setup wizard should have installed Surge XT automatically
- **Restart the App** - Close and reopen Signals & Sorcery

#### Surge XT Not Loading
- **Re-run Setup Wizard** - Go to Settings and re-run the plugin installation
- **Check Architecture** - Ensure you installed the version matching your Mac (Apple Silicon or Intel)
- **Manual Installation** - See the manual installation section below

#### MIDI Not Generating
- **Check Track Has Instrument** - Ensure the track has Surge XT loaded
- **Verify Track Is Not Muted** - Unmute the track and check volume levels
- **Check Playback** - Press play to start playback
- **Rate Limits** - Daily token limits are set per user for the free tier

### Tips for Best Results

- **Be Specific** - Describe sounds in detail: "punchy techno kick" works better than just "drums"
- **One Task at a Time** - Break complex requests into steps
- **Iterate** - Generate MIDI, listen, then ask for adjustments
- **Use Musical Terms** - The system understands music theory: keys, scales, chord progressions, etc.

### Next Steps

- Experiment with different sound descriptions to hear how they're interpreted
- Try combining MIDI generation with FX processing for more complex productions
- Explore the [Features](/api-server/) section for advanced capabilities

---

### Manual Dependency Installation (Optional)

**Note:** The setup wizard handles dependency installation automatically. The steps below are only needed if you prefer to install dependencies manually or need to troubleshoot installation issues.

#### Install Surge XT

1. Download Surge XT from [https://surge-synthesizer.github.io/](https://surge-synthesizer.github.io/)
2. Download the version matching your Mac:
   - **macOS (Apple Silicon)** for M-Series Macs
   - **macOS (Intel)** for Intel Macs
3. Run the installer - it will install the VST3 plugin to the correct location

![getting-started](/sas_patch_bay.png)
