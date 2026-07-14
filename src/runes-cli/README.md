---
sidebar: auto
---

![runes_cli](/sas_runes_cli_2.png)

# Developer Guide

## Development Setup

### Prerequisites

- **Node.js 18+** - Required for TypeScript development
- **macOS (Apple Silicon) or Windows 10/11 (64-bit)** - Windows dev setup notes live in the repo's `WINDOWS-PORT.md`
- **Git** - For version control

### Getting Started

```bash
# Clone the monorepo
git clone https://github.com/shiehn/sas-platform.git
cd sas-platform/sas-app

# Install dependencies
npm install

# Run in development mode
npm run start         # Default dev server (safe mode, crash protection)
npm run dev:smart     # Auto-restarts on crashes
```

## Architecture Overview

### Project Structure

```
sas-platform/                   # monorepo root
├── sas-app/              # Electron desktop app
│   ├── src/
│   │   ├── main/               # Electron main process: services, IPC, tool registry
│   │   ├── renderer/           # React UI (pages, components)
│   │   ├── audio-engine/       # TypeScript JSON-RPC client for the native engine
│   │   ├── music-engine/       # Composition engine + harmonic-rules-engine.ts
│   │   ├── plugins/            # Built-in plugin registration (plugins/index.ts)
│   │   └── shared/             # Shared types
│   └── resources/              # Bundled native binaries
├── sas-audio-engine/           # Native C++ audio engine (Tracktion Engine)
│   ├── src/
│   │   ├── main.cpp            # Entry point (JSON-RPC over TCP, port 9998)
│   │   ├── DeckManager.cpp     # Multi-deck coordination
│   │   └── SceneManager.cpp    # Scene management
│   └── CMakeLists.txt
├── sas-audio-tool/             # Native C++ audio utility
├── sas-stem-splitter/          # Stem separation (Demucs)
├── sas-plugin-sdk/             # @signalsandsorcery/plugin-sdk
└── signals-and-sorcery-docs/   # This documentation site
```

### Key Technologies

- **Electron** - Desktop application framework
- **React 18** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Tracktion Engine** - Native C++ audio engine
- **MCP** - Model Context Protocol for LLM tools
- **Tailwind CSS** - Utility-first CSS
- **Zod** - Runtime type validation

## Audio Engine Architecture

The audio engine is a native C++ process built on Tracktion Engine, communicating via JSON-RPC over TCP (port 9998).

### Key Concepts

- **Decks**: FolderTracks that act as mix buses (Composition Deck, Performance Deck)
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

# Build the platform installer
npm run dist:mac:dmg   # macOS arm64 DMG
npm run dist:win       # Windows x64 NSIS installer
```

### Release Process

The release script handles everything:

```bash
# Full release (tests, build, upload, deploy docs)
npm run release

# Release with version type
npm run release:minor  # 2.51.0 → 2.52.0
npm run release:patch  # 2.51.0 → 2.51.1
npm run release:major  # 2.51.0 → 3.0.0

# Build only (no upload)
npm run release:build-only
```

The release script (per-OS — one shared version number, each OS publishes
its own artifact, possibly staggered):
1. Runs all tests
2. Bumps version in package.json — or offers **publish current (no bump)**
   when the other OS already released this version first
3. Builds this platform's installer (macOS arm64 DMG / Windows x64 NSIS exe)
4. Uploads to GCP storage
5. Merge-updates downloads.json: only this platform's entry changes; the
   other platform's entry is preserved (the site renders per-platform
   versions from this manifest)
6. Deploys documentation
7. Creates git tag (skipped when the tag already exists from the other OS)
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
- [Main README](https://github.com/shiehn/sas-platform)
- [Audio Engine Architecture](https://github.com/shiehn/sas-platform/blob/main/sas-audio-engine/README.md)

### Support
- [GitHub Issues](https://github.com/shiehn/sas-platform/issues)
- [Discord Community](https://discord.gg/UcHCjfpRkV)
- Email: stevehiehn@gmail.com

### Related Projects
- [Model Context Protocol](https://github.com/modelcontextprotocol/modelcontextprotocol)
- [Tracktion Engine](https://github.com/Tracktion/tracktion_engine)
- [Electron](https://www.electronjs.org/)
- [React](https://react.dev/)
