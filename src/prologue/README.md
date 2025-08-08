---
sidebar: auto
---

![prologue](/sas_prologue.png)

## What is Signals & Sorcery?

Signals & Sorcery is an AI-powered desktop application that lets you control REAPER DAW using natural language commands. Simply type what you want to do, and the AI assistant will execute the commands in REAPER - no more searching through menus or memorizing shortcuts!

## Who is this for?

- **Music Producers** who want to speed up their workflow with conversational commands
- **REAPER Users** looking for an intuitive way to control their DAW
- **Audio Engineers** who want AI assistance for mixing and production tasks
- **Beginners** who find DAW interfaces overwhelming and want a simpler way to interact
- **Developers** interested in extending and customizing the open-source codebase

## How does it work?

### Architecture Overview

- **Electron Desktop App**: Native application with React-based chat interface
- **TypeScript MCP Server**: Manages 93 DSL tools for comprehensive REAPER control
- **Smart Router**: Dynamically selects relevant tools to work within LLM provider limits
- **REAPER Bridge**: Lua script that auto-installs as `__startup.lua` for seamless integration
- **Multiple AI Providers**: Supports OpenAI (ChatGPT), Groq, and Claude

### Key Features

- **Natural Language Control**: Type commands like "Add reverb to the vocals" or "Create a drum track"
- **Zero-Friction Setup**: Bridge auto-installs on first launch - just start the app and go
- **Smart Tool Selection**: Router picks the right tools from 93 available operations
- **Multi-Step Operations**: Complex tasks broken down and executed automatically
- **State Validation**: Ensures commands achieve their intended effect
- **Layered Architecture**: (Experimental) Advanced retry mechanisms and error handling




