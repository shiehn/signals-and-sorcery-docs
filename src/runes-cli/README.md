---
sidebar: auto
---

![runes_cli](/sas_runes_cli_2.png)

# Developer Guide

## Development Setup

### Prerequisites

- **Node.js 18+** - Required for TypeScript development
- **macOS 10.15+** - macOS only (Apple Silicon & Intel)
- **Git** - For version control

### Getting Started

```bash
# Clone the repository
git clone https://github.com/shiehn/signals-and-sorcery.git
cd signals-and-sorcery

# Install dependencies
npm install

# Run in development mode
npm run start         # Standard development mode
npm run dev:safe      # Safe mode with crash protection
npm run dev:smart     # Auto-restarts on crashes
```

## Architecture Overview

### Project Structure

```
signals-and-sorcery/
├── src/
│   ├── main/              # Electron main process
│   │   ├── index.ts       # App entry point
│   │   ├── services/      # Core services
│   │   └── setup-handlers.ts  # IPC handlers
│   ├── renderer/          # React UI
│   │   ├── App.tsx        # Main component
│   │   ├── pages/         # UI pages
│   │   └── components/    # React components
│   ├── audio-engine/      # Tracktion Engine TypeScript API
│   │   └── tracktion-engine.ts  # JSON-RPC client
│   ├── mcp-server/        # TypeScript MCP
│   │   ├── index.ts       # Server entry
│   │   └── dsl/tools/     # DSL tool definitions
│   └── music-engine/      # Composition engine
│       ├── services/      # Project binding, transitions
│       └── harmonic-rules-engine.ts
├── sas-audio-engine/      # Native C++ audio engine
│   ├── src/
│   │   ├── main.cpp       # Entry point
│   │   ├── Deck.cpp       # Deck management
│   │   ├── DeckManager.cpp # Multi-deck coordination
│   │   └── SceneManager.cpp # Scene management
│   └── CMakeLists.txt
├── scripts/              # Build & test scripts
└── docs/                 # Documentation
```

### Key Technologies

- **Electron** - Desktop application framework
- **React 19** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Tracktion Engine** - Native C++ audio engine
- **MCP** - Model Context Protocol for LLM tools
- **Tailwind CSS** - Utility-first CSS
- **Zod** - Runtime type validation

## Audio Engine Architecture

The audio engine is a native C++ process built on Tracktion Engine, communicating via JSON-RPC over TCP (port 9998).

### Key Concepts

- **Decks**: FolderTracks that act as mix buses (Loop-A, Loop-B, Transition)
- **Scenes**: FolderTracks that group audio tracks together
- **Tracks**: AudioTracks containing clips and plugins

See `sas-audio-engine/README.md` for detailed architecture documentation.

## Adding New DSL Tools

### Tool Structure

```typescript
// src/mcp-server/dsl/tools/tracks.ts
export const createTrackTool = {
  name: "dsl_create_track",
  description: "Create a new track",
  parameters: z.object({
    name: z.string().optional().describe("Track name"),
    type: z.enum(['audio', 'midi']).default('audio'),
    index: z.number().optional().describe("Insert position")
  }),
  execute: async (params) => {
    const engine = await getSharedTracktionEngine();
    return await engine.createTrack(params);
  }
};
```

### Tool Categories

Tools are organized by function:

- `tracks.ts` - Track operations (create, delete, rename)
- `effects.ts` - FX and processing
- `transport.ts` - Playback control
- `scene-operations.ts` - Scene management
- `deck-operations.ts` - Deck control
- `generation.ts` - Content generation

## Testing

### Unit Tests

```bash
# Run all tests
npm test

# Test specific module
npm test -- src/audio-engine

# Test with coverage
npm test -- --coverage
```

### Integration Tests

```bash
# Test with real audio engine
npm run test:engine

# Run C++ engine tests
npm run test:engine:cpp
```

### E2E Tests

```bash
# Run Playwright tests
npm run test:e2e

# Test with UI
npm run test:e2e:headed
```

## Debugging

### Enable Debug Logging

```bash
# In .env file
VITE_LOG_LEVEL=debug

# Or via environment
DEBUG=* npm run start
```

### Chrome DevTools

1. Open the app
2. Press `Cmd+Option+I` (Mac)
3. Use Console, Network, and Sources tabs

### Audio Engine Debugging

Check the main process logs:
```bash
ENABLE_TEST_SERVER=true npm run electron:dev > output.log 2>&1
grep "DeckManager\|SceneManager" output.log
```

## Building & Distribution

### Build Commands

```bash
# Build TypeScript
npm run build

# Build for current platform
npm run dist

# Build DMG for macOS
npm run dist:mac:dmg
```

### Release Process

The release script handles everything:

```bash
# Full release (tests, build, upload, deploy docs)
npm run release

# Release with version type
npm run release:minor  # 0.12.0 → 0.13.0
npm run release:patch  # 0.12.0 → 0.12.1
npm run release:major  # 0.12.0 → 1.0.0

# Build only (no upload)
npm run release:build-only
```

The release script:
1. Runs all tests
2. Bumps version in package.json
3. Builds DMGs (arm64 + x64)
4. Uploads to GCP storage
5. Updates downloads.json
6. Deploys documentation
7. Creates git tag
8. Creates GitHub release

## Contributing

### Code Style

- Use TypeScript for type safety
- Follow ESLint rules
- Write tests for new features

### Commit Messages

Follow conventional commits:
```
feat: add new deck operation
fix: resolve audio routing issue
docs: update developer guide
test: add unit tests for scene manager
```

### Pull Request Process

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Update documentation
5. Submit PR with description

## Resources

### Documentation
- [Main README](https://github.com/shiehn/signals-and-sorcery)
- [Audio Engine Architecture](https://github.com/shiehn/signals-and-sorcery/blob/main/sas-audio-engine/README.md)
- [Tool Architecture](https://github.com/shiehn/signals-and-sorcery/blob/main/TOOL_ARCHITECTURE.md)

### Support
- [GitHub Issues](https://github.com/shiehn/signals-and-sorcery/issues)
- [Discord Community](https://discord.gg/UcHCjfpRkV)
- Email: stevehiehn@gmail.com

### Related Projects
- [Model Context Protocol](https://github.com/anthropics/mcp)
- [Tracktion Engine](https://github.com/Tracktion/tracktion_engine)
- [Electron](https://www.electronjs.org/)
- [React](https://react.dev/)
