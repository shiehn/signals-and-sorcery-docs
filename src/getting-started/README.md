---
sidebar: auto
---

![getting-started](/sas_getting_started.png)

## Quick Start Guide

### System Requirements

- **macOS** with Apple M-Series or Intel chip
- **REAPER** 6.0 or later (auto-installed by setup wizard)
- **Surge XT** synthesizer plugin (auto-installed by setup wizard)
- **Internet connection** generation happens server-side
- **Google Account** social login login with google

### Installation

#### 1. Download Signals & Sorcery

Choose the version for your system:

- **[Apple Silicon Mac (M1/M2/M3/M4)](https://storage.googleapis.com/docs-assets/signals-and-sorcery-1_3_0-arm64.dmg)** - Download for Apple Silicon Macs
- **[Intel Mac (x64)](https://storage.googleapis.com/docs-assets/signals-and-sorcery-1_3_0-x64.dmg)** - Download for Intel Macs

**Note:** The app is signed and notarized by Apple for security.

#### 2. Install and Launch

1. Double-click the downloaded DMG file to open it
2. Drag Signals & Sorcery to your Applications folder
3. Launch the app from Applications
4. **The setup wizard will guide you through installing REAPER, Surge XT, and configuring everything automatically**
5. On first launch, the REAPER bridge will auto-install to your REAPER Scripts folder

![runes_cli](/sas_runes_cli_2.png)

### Basic Usage

#### Getting Started

1. **Open REAPER** - Launch REAPER first (the bridge script will auto-start)
2. **Launch Signals & Sorcery** - Open the app from your Applications folder
3. **Verify Connection** - Check that the app shows "Connected" status

#### Creating Music with MIDI

The core workflow is describing the sound you want for each track, and the AI will generate MIDI and configure the appropriate synth patches:

```
"create a synth sub bass"

"add a 4 on the floor kick"

"add a snare"

"add a synth padd on bars 2 and 4"
```

### Troubleshooting

#### Bridge Not Connecting
- **Make sure REAPER is running** - The bridge only loads when REAPER starts
- **Check REAPER Console** - Go to View → ReaScript Console to see bridge status messages
- **Verify Bridge Installation** - Look for `__startup.lua` in `~/Library/Application Support/REAPER/Scripts/`
- **Restart Both Apps** - Close REAPER and Signals & Sorcery, then reopen REAPER first

#### Surge XT Not Loading
- **Verify Plugin Installation** - Open REAPER → Insert FX → Search for "Surge XT"
- **Re-scan Plugins** - REAPER → Preferences → Plug-ins → VST → "Re-scan"
- **Check Architecture** - Ensure you installed the version matching your Mac (Apple Silicon or Intel)

#### MIDI Not Generating
- **Check Track Has Instrument** - Ensure the track has Surge XT or another synth loaded
- **Verify Track Is Not Muted** - Unmute the track and check volume levels
- **Check Playback** - Press spacebar in REAPER to start playback
- **Rate Limits** - Daily token limits are set per user for the free tier

### Tips for Best Results

- **Be Specific** - Describe sounds in detail: "punchy techno kick" works better than just "drums"
- **One Task at a Time** - Break complex requests into steps
- **Iterate** - Generate MIDI, listen, then ask for adjustments
- **Use Musical Terms** - The AI understands music theory: keys, scales, chord progressions, etc.

### Next Steps

- Experiment with different sound descriptions to hear how the AI interprets them
- Try combining MIDI generation with FX processing for more complex productions
- Explore the [Features](/api-server/) section for advanced capabilities

---

### Manual Dependency Installation (Optional)

**Note:** The setup wizard handles all dependency installation automatically. The steps below are only needed if you prefer to install dependencies manually or need to troubleshoot installation issues.

#### Install REAPER

1. Download REAPER from [https://www.reaper.fm/download.php](https://www.reaper.fm/download.php)
2. Download the version matching your Mac:
   - **macOS (ARM64)** for Apple Silicon Macs (M-Series)
   - **macOS (x64)** for Intel Macs
3. Open the downloaded DMG and drag REAPER to your Applications folder
4. Launch REAPER at least once to complete initial setup

#### Install Surge XT

1. Download Surge XT from [https://surge-synthesizer.github.io/](https://surge-synthesizer.github.io/)
2. Download the version matching your Mac:
   - **macOS (Apple Silicon)** for M-Series Macs
   - **macOS (Intel)** for Intel Macs
3. Run the installer - it will install the VST3 plugin to the correct location
4. Verify installation: Open REAPER → Insert a new track → Click FX button → Search for "Surge XT" in the plugin list

![getting-started](/sas_patch_bay.png)
