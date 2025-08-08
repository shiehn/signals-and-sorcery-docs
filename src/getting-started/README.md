---
sidebar: auto
---

![getting-started](/sas_getting_started.png)

## Quick Start Guide

### System Requirements

- **macOS** 10.15 or later (Windows/Linux coming soon)
- **REAPER** 6.0 or later
- **Internet connection** for AI features
- **API Key** from one of the supported providers (free tiers available)

### Installation

#### 1. Download the Application

Choose the version for your system:
- **[Apple Silicon Mac (M1/M2/M3)](https://storage.googleapis.com/docs-assets/signals-and-sorcery-0_0_1-arm64.dmg)** - Download for Apple Silicon Macs (v0.0.1)
- **Intel Mac** - Coming soon

#### 2. Install and Launch

1. Open the downloaded DMG file
2. Drag Signals & Sorcery to your Applications folder
3. Launch the application
4. The REAPER bridge will auto-install on first launch

#### 3. Get an API Key

You'll need an API key from one of these providers:

- **[Groq](https://console.groq.com/keys)** - Recommended for beginners (fast & free tier)
- **[OpenAI](https://platform.openai.com/api-keys)** - Most capable but requires payment
- **Claude** - Anthropic's AI (requires API key)

#### 4. Configure Settings

1. Open Settings in the app
2. Enter your API key
3. Select your preferred AI provider
4. Optionally enable experimental features like Layered Architecture

### Basic Usage Examples

```
You: Create a new project with 4 tracks for drums, bass, guitar, and vocals
AI: Creating your tracks now...

You: Add EQ and compression to the vocal track
AI: Added ReaEQ and ReaComp to track 4 "vocals"...

You: Record enable the guitar track and set input to channel 2
AI: Track 3 "guitar" is now record-armed with input set to channel 2...

You: Generate a simple drum pattern
AI: Created a basic 4/4 kick and snare pattern...
```

### Common Commands

#### Track Operations
- "Create 5 new audio tracks"
- "Rename track 3 to Lead Guitar"
- "Delete the last track"
- "Mute all tracks except vocals"

#### Effects & Processing
- "Add reverb to track 2"
- "Remove all effects from the selected track"
- "Add a compressor to the drum bus"
- "Insert ReaEQ on the master track"

#### Transport & Navigation
- "Start recording"
- "Loop from bar 8 to bar 16"
- "Go to 1 minute 30 seconds"
- "Set tempo to 120 BPM"

#### Automation
- "Automate volume on track 1"
- "Create a fade out over the last 4 bars"
- "Draw automation for pan from left to right"

### Troubleshooting

#### Bridge Not Loading
- Ensure REAPER Scripts folder contains `__startup.lua`
- Restart REAPER after installation
- Try manual installation from the Bridge Installer UI

#### MCP Connection Failed
- Make sure REAPER is running
- Check bridge console output in REAPER
- Verify file permissions in Scripts/mcp_bridge_data/

#### API Key Issues
- Verify your API key is correct
- Check you have credits/quota remaining
- Try a different provider if one isn't working

### Next Steps

- Explore the [Features](/api-server/) section for advanced capabilities
- Check the [Developer Guide](/runes-cli/) if you want to extend the app
- Join our [Discord Community](https://discord.gg/reaper-chat) for support and tips

![getting-started](/sas_patch_bay.png)