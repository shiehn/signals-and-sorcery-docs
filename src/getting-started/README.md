---
sidebar: auto
---

![getting-started](/sas_getting_started.png)

## Quick Start Guide

### System Requirements

- **macOS** with Apple Silicon (M1/M2/M3/M4) or Intel chip
- **REAPER** 6.0 or later
- **Surge XT** synthesizer plugin
- **Internet connection** for AI features
- **OpenAI API Key** (required)

### Installation

#### 1. Install Dependencies

Before installing Signals & Sorcery, you'll need to install the required dependencies:

##### Install REAPER

1. Download REAPER from [https://www.reaper.fm/download.php](https://www.reaper.fm/download.php)
2. Download the version matching your Mac:
   - **macOS (ARM64)** for Apple Silicon Macs (M1/M2/M3/M4)
   - **macOS (x64)** for Intel Macs
3. Open the downloaded DMG and drag REAPER to your Applications folder
4. Launch REAPER at least once to complete initial setup

##### Install Surge XT

1. Download Surge XT from [https://surge-synthesizer.github.io/](https://surge-synthesizer.github.io/)
2. Download the version matching your Mac:
   - **macOS (Apple Silicon)** for M1/M2/M3/M4 Macs
   - **macOS (Intel)** for Intel Macs
3. Run the installer - it will install the VST3 plugin to the correct location
4. Verify installation: Open REAPER → Insert a new track → Click FX button → Search for "Surge XT" in the plugin list

##### Get OpenAI API Key

1. Create an account at [https://platform.openai.com/](https://platform.openai.com/)
2. Navigate to API Keys: [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
3. Click "Create new secret key"
4. Copy the key (you'll need this later)
5. Note: You'll need to add credits to your OpenAI account for API usage

#### 2. Download Signals & Sorcery

Choose the version for your system:

- **[Apple Silicon Mac (M1/M2/M3/M4)](https://storage.googleapis.com/docs-assets/signals-and-sorcery-0_14_1-arm64.dmg)** - Download for Apple Silicon Macs
- **[Intel Mac (x64)](https://storage.googleapis.com/docs-assets/signals-and-sorcery-0_14_1-x64.dmg)** - Download for Intel Macs

**Note:** The app is signed and notarized by Apple for security.

#### 3. Install and Launch

1. Double-click the downloaded DMG file to open it
2. Drag Signals & Sorcery to your Applications folder
3. Launch the app from Applications
4. On first launch, the REAPER bridge will auto-install to your REAPER Scripts folder

#### 4. Configure Settings

1. In Signals & Sorcery, click the Settings icon
2. Enter your OpenAI API key
3. Verify the connection shows as active

![runes_cli](/sas_runes_cli_2.png)

### Basic Usage

#### Getting Started

1. **Open REAPER** - Launch REAPER first (the bridge script will auto-start)
2. **Launch Signals & Sorcery** - Open the app from your Applications folder
3. **Verify Connection** - Check that the app shows "Connected" status

#### Creating Music with MIDI

The core workflow is describing the sound you want for each track, and the AI will generate MIDI and configure the appropriate synth patches:

```
You: Create 4 tracks - drums, bass, lead synth, and pad

AI: Created 4 tracks with Surge XT loaded on each

You: For the drums, create a driving techno beat at 128 BPM with punchy kicks

AI: Generated MIDI drum pattern and configured Surge XT with a punchy kick preset

You: Add a deep rolling bassline that follows a minor progression

AI: Generated bassline MIDI in A minor and configured Surge XT bass preset

You: Create an arpeggiated lead melody that's bright and energetic

AI: Generated arpeggio MIDI pattern and configured Surge XT lead preset

You: Add ambient pad chords that wash in the background

AI: Generated chord progression and configured Surge XT pad preset
```

#### Common Workflows

**Track Management:**
- "Create 3 new tracks for drums, bass, and melody"
- "Rename track 2 to Bass"
- "Delete the last track"
- "Mute all tracks except track 1"

**MIDI Generation:**
- "Generate a 4-bar drum pattern in 4/4 time"
- "Create a bassline that follows a C minor scale"
- "Add a melody on track 3 with eighth notes"
- "Generate chord progression in the key of G major"

**FX Processing:**
- "Add reverb to track 2"
- "Shuffle FX on the bass track for a new sound"
- "Add EQ and compression to the drum bus"
- "Clear all FX from track 3"

**Transport Control:**
- "Start playback"
- "Set tempo to 140 BPM"
- "Loop from bar 1 to bar 8"
- "Stop recording"

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

#### OpenAI API Issues
- **Verify API Key** - Check that your key is entered correctly in Settings
- **Check Credits** - Log into platform.openai.com to verify you have available credits
- **Rate Limits** - If you see errors, you may be hitting rate limits (wait and retry)

### Tips for Best Results

- **Be Specific** - Describe sounds in detail: "punchy techno kick" works better than just "drums"
- **One Task at a Time** - Break complex requests into steps
- **Iterate** - Generate MIDI, listen, then ask for adjustments
- **Use Musical Terms** - The AI understands music theory: keys, scales, chord progressions, etc.

### Next Steps

- Experiment with different sound descriptions to hear how the AI interprets them
- Try combining MIDI generation with FX processing for more complex productions
- Explore the [Features](/api-server/) section for advanced capabilities

![getting-started](/sas_patch_bay.png)