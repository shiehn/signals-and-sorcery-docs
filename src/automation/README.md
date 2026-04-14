---
sidebar: auto
title: Automating Signals & Sorcery with AI
---

# Automating Signals & Sorcery with AI

Signals & Sorcery ships with a public programmatic surface — the same one the
in-app AI uses. Anything the app can do, an AI agent (Claude Code, OpenClaw,
Cursor, …) or your own script can drive from the outside.

## The big idea

**Agents drive S&S by writing shell scripts.** Not a custom DSL, not a
workflow engine config language — just bash, Python, or whatever your agent
is fluent in, calling the `sas` CLI.

```bash
# What an AI agent actually writes to make a chill lo-fi beat:
SCENE=$(sas scene_create --name "Verse" | jq -r '.changes.sceneId')
for ROLE in bass drums keys pad; do
  sas add_instrument --name "$ROLE" --role "$ROLE" --prompt "chill lo-fi"
done
sas play_scene --deck main
```

That's a *real* program. It's composable, debuggable (run any line
yourself), and uses a language every modern LLM is fluent in. You don't
have to teach your agent a custom grammar — the CLI is the grammar.

## Why not a custom DSL?

Short answer: we tried, then rejected it. Two reasons:

1. **LLMs are already fluent in bash/Python/JS.** Forcing them to emit a
   YAML-with-templates dialect burns context and produces brittle output.
2. **The CLI + `jq` + bash variables give you everything a DSL would** —
   composition, branching, loops, error handling — for free.

The longer version of this reasoning lives in the [design doc][design] and
follows the thinking in
[Armin Ronacher's "Tools: Code Is All You Need"][ronacher] and
[Eric Holmes' "MCP is dead, long live the CLI"][holmes]. Our take: both of
them are right, and the CLI *is* the tool that lets agents write code.

## Three ways to integrate

Pick the path that matches your agent's capabilities:

### 1. Shell-capable agents → use the `sas` CLI

**Examples:** Claude Code, OpenClaw, your terminal, a CI job, a cron.

The agent writes shell scripts. Every action is one `sas <action> [flags]`
call. JSON out on stdout; pipe through `jq` for details. See the
[CLI reference](./cli-reference.md) and [Examples](./examples.md).

### 2. MCP-capable agents → use the MCP tool server

**Examples:** Cursor Agent, Claude Desktop, any MCP client.

S&S spawns a local MCP server (DeclarAgent on port 19100) that exposes the
same tool surface. Connect your MCP client to it — the tools register
automatically. See [For agents](./for-agents.md) for per-client setup.

### 3. HTTP-direct → use the local REST API

**Examples:** Python notebooks, curl scripts, custom web UIs.

Every tool is callable via `POST /api/v1/execute` on `localhost:7655`.
Stream events via SSE on `/api/v1/events/stream`. This is what both the
CLI and the MCP server wrap.

## What an agent has to work with

- **~40 typed tools** — scene/track CRUD, FX, MIDI generation, transport,
  composition, rendering, samples, export. Every tool has a 4-section
  description (`WHEN TO USE` / `WHEN NOT TO USE` / `INPUTS` / `OUTPUTS`)
  the agent reads to pick the right one.
- **5 composite tools** that wrap multi-step flows: `compose_scene`,
  `add_instrument`, `play_scene`, `render_to_performance`, `create_transition`.
- **Typed domain events** streamed over SSE so agents (and the app UI)
  react to state changes in real time.
- **Idempotency keys** so retrying a failed call is safe — no duplicate
  tracks, no corrupted state.
- **Progressive disclosure** — a small core tool set is always visible;
  everything else is discoverable via `sas tool_search` or
  `sas list-actions`.

## Quick start

```bash
# 1. Make sure S&S is running
# 2. Install the CLI (ships with the app):
ln -s "$(which signals-and-sorcery)/../resources/app/dist/cli/sas.js" /usr/local/bin/sas

# 3. Verify
sas health
# → { "status": "ok", ... }

# 4. See what you can do
sas list-actions
sas help compose_scene
```

Then either:
- **Go manual:** write the bash yourself and call `sas` as needed.
- **Point an agent at it:** open Claude Code in a terminal, tell it what
  you want, let it discover tools with `sas help <name>`.

## Where to next

- **[CLI reference](./cli-reference.md)** — `sas` install, flags, exit
  codes, argument conventions.
- **[Examples](./examples.md)** — worked bash scripts for common flows.
- **[For agents](./for-agents.md)** — integration notes for Claude Code,
  OpenClaw, Cursor, and custom clients.

[design]: https://github.com/shiehn/sas-platform/blob/main/sas-assistant/docs-ai-planning/ai-orchestration-design.md
[ronacher]: https://lucumr.pocoo.org/2025/7/3/tools/
[holmes]: https://ejholmes.github.io/2026/02/28/mcp-is-dead-long-live-the-cli.html
