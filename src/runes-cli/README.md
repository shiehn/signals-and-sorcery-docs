---
sidebar: auto
---

![runes_cli](/sas_runes_cli_2.png)

# Developer Guide

## Development Setup

### Prerequisites

- **Node.js 18+** - Required for TypeScript development
- **macOS 10.15+** - Currently macOS only (Windows/Linux coming soon)
- **REAPER 6.0+** - The DAW we're controlling
- **Git** - For version control

### Getting Started

```bash
# Clone the repository
git clone https://github.com/shiehn/reaper-chat.git
cd reaper-chat

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
│   │   ├── mcp-typescript.ts  # MCP server manager
│   │   └── bridge-installer.ts # Auto-installer
│   ├── renderer/          # React UI
│   │   ├── App.tsx        # Main component
│   │   ├── pages/         # UI pages
│   │   └── components/    # React components
│   ├── mcp-server/        # TypeScript MCP
│   │   ├── index.ts       # Server entry
│   │   ├── dsl/           # 93 DSL tools
│   │   └── resources/     # Lua bridges
│   └── layers/            # Experimental architecture
│       ├── intent/        # Intent analysis
│       ├── validation/    # Parameter validation
│       ├── planning/      # Multi-step planning
│       ├── execution/     # Tool execution
│       ├── retry/         # Retry mechanisms
│       └── response/      # Response formatting
├── scripts/              # Build & test scripts
├── docs/                 # Documentation
└── conversation-tracking/ # Analysis data
```

### Key Technologies

- **Electron** - Desktop application framework
- **React 19** - UI framework
- **TypeScript** - Type-safe JavaScript
- **MCP** - Model Context Protocol for LLM tools
- **Tailwind CSS** - Utility-first CSS
- **Zod** - Runtime type validation

## Adding New DSL Tools

### ⚠️ IMPORTANT: Read First!

Before adding tools, **you MUST read [TOOL_ARCHITECTURE.md](https://github.com/shiehn/reaper-chat/blob/main/TOOL_ARCHITECTURE.md)**. The smart router requires careful tool placement to function correctly.

### Tool Structure

```typescript
// src/mcp-server/dsl/tracks.ts
export const createTrackTool = {
  name: "dsl_create_track",
  description: "Create a new track in REAPER",
  parameters: z.object({
    name: z.string().optional().describe("Track name"),
    type: z.enum(['audio', 'midi']).default('audio'),
    index: z.number().optional().describe("Insert position")
  }),
  execute: async (params) => {
    // Implementation
    return await reaperAPI.createTrack(params);
  }
};
```

### Tool Categories

Tools must be placed in the correct category file:

- `tracks.ts` - Track operations (create, delete, rename)
- `effects.ts` - FX and processing
- `transport.ts` - Playback control
- `automation.ts` - Envelope and automation
- `navigation.ts` - Cursor and selection
- `mixing.ts` - Volume, pan, routing
- `midi.ts` - MIDI operations
- `generation.ts` - Content generation

### Adding a Tool Checklist

1. ✅ Determine the correct category
2. ✅ Add tool to category file
3. ✅ Define tool relationships in router
4. ✅ Update category keywords
5. ✅ Add corresponding Lua function if needed
6. ✅ Write unit tests
7. ✅ Update documentation

## Testing

### Unit Tests

```bash
# Run all tests
npm test

# Test specific module
npm test -- dsl/tracks

# Test with coverage
npm test -- --coverage
```

### Integration Tests

```bash
# Test with real REAPER instance
npm run test:integration

# Test specific command flow
node scripts/tests/test-full-stack.js 10
```

### E2E Tests

```bash
# Run Playwright tests
npm run test:e2e

# Test layered architecture
npm run test:e2e:layered

# Test backward compatibility
npm run test:e2e:compat
```

## Debugging

### Enable Debug Logging

```bash
# In .env file
VITE_LOG_LEVEL=debug
DEBUG_TOOL_SELECTION=true
ENABLE_CONVERSATION_TRACKING=true

# Or via environment
DEBUG=* npm run start
```

### Chrome DevTools

1. Open the app
2. Press `Cmd+Option+I` (Mac) or `Ctrl+Shift+I` (Windows)
3. Use Console, Network, and Sources tabs

### REAPER Bridge Debugging

1. Open REAPER's ReaScript console
2. Look for MCP bridge output
3. Check `Scripts/mcp_bridge_data/` for logs

## Building & Distribution

### Build Commands

```bash
# Build TypeScript
npm run build

# Build for current platform
npm run dist

# Build for specific platforms
npm run dist:mac
npm run dist:win
npm run dist:linux
```

### Release Process

1. Update version in `package.json`
2. Run tests: `npm test`
3. Build: `npm run dist`
4. Test the built app
5. Create GitHub release
6. Upload artifacts

## Contributing

### Code Style

- Use TypeScript for type safety
- Follow ESLint rules
- Use Prettier for formatting
- Write tests for new features

### Commit Messages

Follow conventional commits:
```
feat: add new DSL tool for track routing
fix: resolve MCP connection timeout
docs: update developer guide
test: add unit tests for effects tools
```

### Pull Request Process

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Update documentation
5. Submit PR with description

## Advanced Topics

### Layered Architecture

Enable experimental features:

```typescript
// src/main/config.ts
export const config = {
  useLayeredArchitecture: true,
  layers: {
    intent: true,
    validation: true,
    planning: true,
    retry: true,
    response: true
  }
};
```

### Custom Tool Providers

```typescript
// src/mcp-server/providers/custom.ts
export class CustomToolProvider {
  async getTools() {
    return [
      // Your custom tools
    ];
  }
}
```

### Performance Optimization

- Use batch operations for multiple tracks
- Cache frequently used data
- Optimize Lua bridge calls
- Monitor with conversation tracking

## Resources

### Documentation
- [Main README](https://github.com/shiehn/reaper-chat)
- [Tool Architecture](https://github.com/shiehn/reaper-chat/blob/main/TOOL_ARCHITECTURE.md)
- [State Validation](https://github.com/shiehn/reaper-chat/blob/main/docs/STATE_VALIDATION.md)
- [DSL Tool Mapping](https://github.com/shiehn/reaper-chat/blob/main/docs/DSL_TOOL_REASCRIPT_MAPPING.md)

### Support
- [GitHub Issues](https://github.com/shiehn/reaper-chat/issues)
- [Discord Community](https://discord.gg/reaper-chat)
- Email: support@reaper-chat.com

### Related Projects
- [Model Context Protocol](https://github.com/anthropics/mcp)
- [REAPER ReaScript](https://www.reaper.fm/sdk/reascript/reascript.php)
- [Electron](https://www.electronjs.org/)
- [React](https://react.dev/)