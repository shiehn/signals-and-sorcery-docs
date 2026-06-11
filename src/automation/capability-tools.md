---
sidebar: auto
title: "Capability tools: filesystem & shell"
---

# Capability tools: filesystem & shell

The Signals & Sorcery agent surface includes a small set of **capability
tools** that reach *outside* the music app: they read and write files
on your machine and run external commands like `ffmpeg`. They're how
the in-app chat-plugin agent fulfils requests like:

- *"What files are in my `~/Music` folder?"*
- *"Make a recording checklist at `~/Desktop/checklist.md` with these items."*
- *"Convert this WAV to MP3 with ffmpeg."*
- *"Install ffmpeg."*

Every capability tool is gated by a **per-call consent dialog**. The
agent never accesses your filesystem or runs a shell command without
you explicitly approving each operation in a modal.

## The consent contract

When the agent calls a capability tool, you see a native dialog showing:

- **What the agent wants to do** ("Read directory", "Write file", "Run shell command").
- **A short reason** the agent provided.
- **The exact details**: full path, args list, byte counts, timeout, cwd. Args are shown as a list (`["-i", "in.wav", "out.mp3"]`), never concatenated into a shell string.

You click **Allow** or **Cancel**. Cancel returns a structured failure
to the agent; it can ask you a different way or move on.

**No persistent allowlist in v1.** Every call prompts every time. We
may add an "always allow" toggle later based on real-world friction;
for now, simplicity wins.

## Tools

### `fs_list_directory`

List a directory's contents.

```bash
sas fs list --path ~/Music
sas run fs_list_directory -p path=~/Documents -p depth=2
```

| Input | Notes |
|---|---|
| `path` | Required. `~` and `~/` expand to your home directory. |
| `depth` | Optional integer 1–3, default 1. |
| `maxEntries` | Optional cap, default 1000. |

Returns `{ resolvedPath, entries: [{ name, type, size?, modifiedMs? }], truncated }`.

### `fs_read_file`

Read a text file.

```bash
sas fs read --path ~/Desktop/notes.md
sas run fs_read_file -p path=~/notes.md -p maxBytes=1000000
```

| Input | Notes |
|---|---|
| `path` | Required. Tilde-expanded. |
| `maxBytes` | Optional cap, default 1 MB. Files larger than this are rejected without prompting. |

Returns `{ resolvedPath, size, content }`.

### `fs_search`

Recursive name/glob search.

```bash
sas fs search --root-path ~/Music --name-pattern "*.wav"
sas run fs_search -p rootPath=~/Documents -p namePattern=todo
```

| Input | Notes |
|---|---|
| `rootPath` | Required. Tilde-expanded. |
| `namePattern` | Required. Supports `*` and `?` globs; otherwise case-insensitive substring. |
| `extensions` | Optional `["wav","mp3"]` allowlist. |
| `maxResults` | Optional cap, default 100. |

Returns `{ resolvedRoot, matches: [{ path, size, modifiedMs }], truncated }`.

### `fs_write_file`

Create, overwrite, or append a text file. Atomic write: produces a
`.tmp` sibling then renames.

```bash
sas fs write --path ~/Desktop/todo.md --content "..."
sas run fs_write_file -p path=~/notes.txt -p content="hello" -p mode=append
```

| Input | Notes |
|---|---|
| `path` | Required. Tilde-expanded. Parent directories created if missing. |
| `content` | Required string. (For binary writes, use a different tool.) |
| `mode` | Optional, `"overwrite"` (default) or `"append"`. |

If the target file exists, the consent dialog warns explicitly that the
file will be **overwritten and its current contents lost**, with the
existing file size shown.

Returns `{ resolvedPath, bytesWritten, mode, replacedSize? }`.

### `shell_exec`

Run an external command. Uses `execFile`-style invocation: args are
passed positionally to the OS, never through a shell interpreter.
This means there is **no shell-injection vector**: even if the agent
tries to pass `; rm -rf /` as an arg, it lands as a literal arg to the
named command, which almost certainly errors out.

```bash
sas run shell_exec --json '{"command":"ffmpeg","args":["-version"]}'
sas run shell_exec --json '{"command":"brew","args":["install","ffmpeg"]}'
```

| Input | Notes |
|---|---|
| `command` | Required. Executable name (on `PATH`) or absolute path. |
| `args` | Optional `string[]`. No shell parsing. |
| `cwd` | Optional working directory. Tilde-expanded. |
| `timeoutMs` | Default 30 s; max 10 min. Process killed (`SIGKILL`) on timeout. |
| `maxOutputBytes` | Default 1 MB; stdout/stderr beyond this is truncated and a `truncated: true` flag returned. |

Returns `{ command, args, cwd, exitCode, stdout, stderr, durationMs, truncated }`.

A non-zero exit code is reported with `success: true`; the agent has
the exit code and decides whether to retry. Only timeouts and spawn
failures return `success: false`.

#### Built-in safety: the deny list

A short pre-consent denylist refuses obviously-malicious commands
**before any dialog fires**:

- `rm -rf /` or `rm -rf ~`
- `dd of=/dev/sda` (and any raw block device)
- `mkfs*` (any filesystem reformat tool)
- The classic fork bomb (`:(){ :|:& };:`)

If you ever need to run one of these legitimately, you'll have to do it
outside the chat-plugin.

## Tools the v1 surface deliberately omits

| Not included | Why |
|---|---|
| `fs_delete` | No good undo path without a trash-folder mechanism. The agent doesn't get to delete files in v1. |
| `package_install` (wrapper) | Already covered by `shell_exec("brew", ["install", "X"])`. Keeping a single consent surface is cleaner than two parallel paths. |
| Persistent "always allow" allowlist | v1 design choice: always-prompt. Will revisit based on real friction. |

## How the consent dialog feels

For a read:

```
┌────────────────────────────────────────────────────────────┐
│  Read directory                                            │
│                                                            │
│  The chat-plugin agent wants to list the contents of a     │
│  directory on your machine.                                │
│                                                            │
│    path: /Users/you/Music                                  │
│    depth: 1                                                │
│    maxEntries: 1000                                        │
│                                                            │
│              [ Cancel ]   [ Allow ]   ← default            │
└────────────────────────────────────────────────────────────┘
```

For a shell call, the dialog uses warning styling and **Cancel is the
default button**; accidental `Enter` denies:

```
┌────────────────────────────────────────────────────────────┐
│  ⚠  Run shell command                                       │
│                                                            │
│  The chat-plugin agent wants to run an external command on │
│  your machine.                                             │
│                                                            │
│    command: ffmpeg                                         │
│    args: ["-i","input.wav","output.mp3"]                   │
│    cwd: (current process cwd)                              │
│    timeoutMs: 30000                                        │
│                                                            │
│              [ Cancel ]  ← default     [ Allow ]           │
└────────────────────────────────────────────────────────────┘
```

## Discovery from your agent

The capability tools are part of the default `/api/v1/actions` curated
surface. They're project-scoped, so the chat-plugin's scene-default
view (`?scope=scene`) doesn't list them by default; the chat-plugin
internally queries without a scope filter, so it sees them too.

```bash
# Confirm they're registered
sas list-actions | grep -E 'fs_|shell_exec'
```

If you're writing your own agent integration, just call these like any
other action. The consent dialog will pop on the user's machine; your
agent receives the structured result when they decide.
