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
yourself), and uses a language every modern LLM is fluent in.

## Three ways to integrate

Pick the path that matches your agent's capabilities:

### 1. Shell-capable agents → use the `sas` CLI

**Examples:** Claude Code, OpenClaw, your terminal, a CI job, a cron.

The agent writes shell scripts. Every action is one `sas <action> [flags]`
call. JSON out on stdout; pipe through `jq` for details. See the
[CLI reference](./cli-reference.md) and [Examples](./examples.md).

**Installing the CLI (macOS):** on first launch the app offers to add
`sas` to your PATH — one admin prompt, wrapper installed to
`/usr/local/bin/sas`. No Node.js required; the wrapper runs the CLI
through the app's own bundled runtime. You can toggle it any time in
**Settings → Developer Tools → sas CLI**.

**If `sas` isn't found on PATH** (after install, or for users who
skipped the checkbox), you have three fallbacks, in order of
convenience:

1. **Open a new terminal window.** Existing shells don't pick up
   PATH changes; a fresh one does.
2. **Re-run the install** from the app: *Settings → Developer Tools →
   sas CLI → Install* (or *Reinstall* if it's stale).
3. **Skip the CLI entirely** — call the local HTTP API directly:
   ```bash
   curl -s -X POST http://localhost:7655/api/v1/execute \
     -H 'Content-Type: application/json' \
     -d '{"action":"scene_create","params":{"name":"Verse"}}'
   ```
   Every CLI command maps one-to-one to a `POST /api/v1/execute`
   request; option 2 below (MCP) and option 3 (HTTP-direct) both
   work without any CLI install.

**Windows / Linux users**: the CLI auto-installer is macOS-only
today. Drive the app via the HTTP or MCP paths below — they work
uniformly across platforms.

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
# 1. Launch Signals & Sorcery (the app must be running — the CLI is a thin
#    wrapper around a local HTTP server that only exists while the app is up).
#
# 2. On macOS first launch the app offers to install `sas` to your PATH —
#    approve the admin prompt. If you skipped it, open:
#       Settings → Developer Tools → sas CLI → Install
#    Then open a NEW terminal window so your shell picks up the PATH change.

# 3. Verify
sas health
# → { "status": "ok", ... }

# 4. See what you can do
sas list-actions
sas help compose_scene
```

**Can't run `sas`?** The CLI isn't strictly required — everything it
does is a wrapper around `POST http://localhost:7655/api/v1/execute`.
If the CLI install failed or you're on Windows/Linux, use `curl`:

```bash
# Same as `sas health`
curl -s http://localhost:7655/api/v1/health

# Same as `sas list-actions`
curl -s http://localhost:7655/api/v1/actions | jq

# Same as `sas scene_create --name Verse`
curl -s -X POST http://localhost:7655/api/v1/execute \
  -H 'Content-Type: application/json' \
  -d '{"action":"scene_create","params":{"name":"Verse"}}' | jq
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
