---
sidebar: auto
---

![sorceress](/sas_sorceress.png)

## Core Features

### 🎵 Natural Language Control
Control REAPER with conversational commands - no more hunting through menus or memorizing shortcuts. Just type what you want to do:

- "Add a reverb to the vocals"
- "Create a drum track with an 808 pattern"
- "Automate the volume to fade out over 4 bars"
- "Record enable all guitar tracks"

### 🤖 Multiple AI Providers
Choose the AI that works best for you:

- **OpenAI (ChatGPT)** - Most capable, best for complex operations
- **Groq** - Fast and free tier available, great for beginners
- **Claude** - Anthropic's AI with strong reasoning capabilities

### 🛠️ 93 Comprehensive DSL Tools
Full coverage of REAPER operations organized into categories:

- **Track Operations** - Create, delete, rename, solo, mute, arm
- **Effects & Processing** - Add/remove FX, adjust parameters
- **Transport Control** - Play, stop, record, loop, tempo
- **Navigation** - Move cursor, select regions, zoom
- **Automation** - Create envelopes, draw curves, latch/touch modes
- **MIDI Operations** - Note editing, velocity, timing
- **Mixing** - Volume, pan, sends, routing
- **File Management** - Import, export, render

### 🧠 Smart Router Technology
Intelligently manages tool selection to work within LLM limits:

- Analyzes your query for intent and keywords
- Selects ~25 most relevant tools from 93 available
- Maps relationships for multi-step operations
- Always includes essential core tools
- Enables complex workflows without hitting API limits

### 🔄 Zero-Friction Setup
Get started in seconds:

- Auto-installs REAPER bridge on first launch
- No manual configuration needed
- Bridge loads as `__startup.lua` in REAPER
- Automatic connection establishment
- Built-in error recovery

### 📊 State Validation (Development)
Ensures commands achieve their intended effect:

- Tracks DAW state before/after commands
- Validates successful execution
- Detects common failure patterns
- Provides actionable recommendations
- Useful for testing and debugging

### 🏗️ Layered Architecture (Experimental)
Advanced processing pipeline for improved reliability:

1. **Intent Analysis** - Fast pattern matching with LLM fallback
2. **Validation Layer** - Pre-execution parameter checking
3. **Planning Layer** - Multi-step operation management
4. **Tool Execution** - MCP bridge integration
5. **Retry & Recovery** - Automatic retry with backoff
6. **Response Formatting** - User-friendly messages

### 💻 Developer-Friendly
Built with modern technologies and best practices:

- **TypeScript** throughout for type safety
- **React** UI with Tailwind CSS
- **Electron** for cross-platform desktop
- **MCP** (Model Context Protocol) standard
- **Comprehensive testing** suite
- **Well-documented** codebase
- **MIT Licensed** open source

## Advanced Capabilities

### Multi-Step Operations
Execute complex workflows with a single command:

```
"Create a drum bus with 4 tracks, add compression and EQ to the bus, 
and set up sends from each drum track"
```

The AI will:
1. Create 4 new tracks
2. Create a bus track
3. Route the drum tracks to the bus
4. Add compression and EQ plugins
5. Configure the routing and sends

### Context-Aware Actions
The AI understands context and relationships:

```
"Duplicate the selected track and add different effects to the copy"
```

### Batch Operations
Apply changes across multiple tracks:

```
"Add vintage compression to all vocal tracks"
"Set all drum tracks to input channel 1-8"
"Create volume automation on every track"
```

### Smart Suggestions
Get help when you're not sure:

```
You: "How do I make the vocals sound wider?"
AI: "I can help with that! Here are some options:
1. Add a stereo widener effect
2. Use a chorus or doubler
3. Pan duplicate tracks left/right
Which would you like to try?"
```

## Performance & Reliability

- **Fast Response Times** - TypeScript server with optimized operations
- **Error Recovery** - Automatic retry on transient failures
- **State Persistence** - Remembers context between commands
- **Undo Support** - All operations are undoable in REAPER
- **Safe Operations** - Non-destructive by default
- **Performance Monitoring** - Track execution times and success rates

## Coming Soon

- **Windows & Linux Support** - Currently macOS only
- **Plugin Presets** - Save and recall effect chains
- **Macro Recording** - Record command sequences
- **Custom Tools** - Add your own DSL tools
- **Cloud Sync** - Share settings across devices
- **Collaborative Features** - Work with others in real-time