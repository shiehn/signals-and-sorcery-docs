---
sidebar: auto
title: Status & async jobs
---

# Status & async jobs

Every state-mutating tool in Signals & Sorcery now runs as an **async job**.
The HTTP call returns immediately with a `jobId`; the work continues in the
background; you (or your agent) poll or long-poll for the result. This page
covers the full contract (the endpoints, the CLI verbs, the MCP tools, and
the SSE event stream) plus how to read the structured status envelopes.

## Why async

Long-running tools (`compose_scene`, `make_beat`, `render_to_performance`,
`sas_split_stems`, `export_audio`, `dsl_generate_midi`, …) routinely take
30 – 120 s. Pre-async, agents waited on a single HTTP socket and got killed
by 30 s subprocess timeouts while the workflow finished invisibly on the
server. The agent then acted on stale state.

The async wrapper is a single fix:

1. The tool returns `{ jobId, status, operation }` in **under a second**.
2. The workflow keeps running.
3. The caller polls (`sas job wait <id>` / `GET /jobs/:id/wait`) or
   subscribes (SSE) for terminal state.
4. Downstream tools that depend on the work block on the `jobId` first.

The contract is identical across CLI, HTTP, MCP, and the in-app chat-plugin.

## The agent recovery rule

> **If any tool response carries `changes.jobId`, you MUST call
> `wait_for_job` (or `sas job wait`) before invoking any tool that depends
> on that result.**

The async tool's response also includes a `nextSteps` array whose first
entry is the `wait_for_job` call pre-substituted with the job id; agents
that follow `nextSteps` are async-correct by construction.

## Quick start

```bash
# 1. Liveness check: does the API server respond?
sas health
# → { "status": "ok", "timestamp": "2026-05-13T…" }

# 2. Kick off async work. The tool returns a jobId immediately.
JOB=$(sas make beat --vibe "punchy 4-bar techno" --json \
  | jq -r '.data.changes.jobId')
echo "Job: $JOB"

# 3. Block until the job reaches a terminal state.
sas job wait "$JOB" --timeout 120
# Exits 0 on completed, 5 on failed, 4 on timeout.

# 4. Or peek without blocking.
sas job status "$JOB"

# 5. Or list everything running.
sas job list --status running
```

## CLI surface

The `sas` CLI has two relevant command families: one-shot health
(`sas health`, `sas status`) and the `sas job` family for async jobs.

### `sas health`: is the API up?

```bash
sas health
# { "status": "ok", "timestamp": "2026-05-13T13:24:55.000Z" }
```

Hits `GET /api/v1/health`. Exits `0` on success, `3` on connection
refused (the app isn't running), `2` on any other error.

If `sas health` fails with *"Connection refused — is the Signals & Sorcery
app running?"*, launch the app and retry. The CLI is a thin HTTP client; it
needs the in-app API server (`localhost:7655`) to be listening.

### `sas status`: layered service health

```bash
sas status
#   ✓ api          version=v1
#   ✓ engine       reachable=true, bpm=120
#   ✓ database     migrations=ok, project_bound=true
#   ✓ auth         token=present
```

A multi-service health check (API, engine, database, auth). Exits `0` if
every service reports `ok: true`, `2` otherwise, `3` on connection refused.

Use `--json` to get the raw envelope for scripting:

```bash
sas status --json | jq '.data.engine.bpm'
```

### `sas job …`: manage running jobs

```bash
sas job list                          # every job, newest first
sas job list --status running         # filter by status
sas job list --status failed          # …
sas job status <jobId>                # one job's full state
sas job wait <jobId> [--timeout 300]  # long-poll until terminal
sas job cancel <jobId>                # cancel a running job
```

| Subcommand | HTTP equivalent | Notes |
|---|---|---|
| `sas job list` | `GET /api/v1/jobs[?status=…]` | Newest-first JobState array |
| `sas job status <id>` | `GET /api/v1/jobs/:id` | One job; `404` if unknown |
| `sas job wait <id>` | `GET /api/v1/jobs/:id/wait?timeout=<ms>` | Long-poll; returns when terminal |
| `sas job cancel <id>` | `POST /api/v1/jobs/:id/cancel` | `404` if unknown or already terminal |

Status values: `queued`, `running`, `completed`, `failed`, `cancelled`.

Filtering accepts any of those literal strings: `--status queued`,
`--status running`, `--status completed`, `--status failed`,
`--status cancelled`.

### Exit codes (job-aware)

The CLI's exit-code contract is async-aware so `set -e` scripts react
correctly to in-flight work:

| Code | Meaning |
|---|---|
| `0` | Success |
| `1` | Plan validation failed (`sas validate` only) |
| `2` | Argument parsing, tool failure, or generic non-zero |
| `3` | Connection refused (the app isn't running) |
| `4` | Timeout (typically `sas job wait` hit its `--timeout` before terminal) |
| `5` | Job terminated with `status: 'failed'` |

```bash
sas job wait "$JOB" --timeout 120
case $? in
  0) echo "Job completed" ;;
  4) echo "Still running after 120s. Keep waiting?" ;;
  5) echo "Job failed. Inspect with: sas job status $JOB" ;;
esac
```

## HTTP endpoints

Every CLI verb is a thin wrapper over a stable HTTP route on
`http://localhost:7655/api/v1`. Hit them directly from Python, curl, or any
HTTP client.

### `GET /api/v1/health`: liveness

```bash
curl -s http://localhost:7655/api/v1/health
# { "success": true, "data": { "status": "ok", "timestamp": "…" } }
```

The simplest "is the server up?" probe. Returns immediately, no engine
RPC.

### `GET /api/v1/jobs`: list jobs

```bash
curl -s 'http://localhost:7655/api/v1/jobs'
curl -s 'http://localhost:7655/api/v1/jobs?status=running'
```

Returns `{ success: true, data: JobState[] }` newest-first.

### `GET /api/v1/jobs/:id`: one job

```bash
curl -s "http://localhost:7655/api/v1/jobs/$JOB"
# { "success": true, "data": { id, operation, status, progress, … } }
```

Returns `404` if the job id is unknown (e.g. expired from in-memory store).

### `GET /api/v1/jobs/:id/wait?timeout=<ms>`: long-poll

```bash
curl -s "http://localhost:7655/api/v1/jobs/$JOB/wait?timeout=60000"
```

Blocks server-side until the job reaches `completed` / `failed` /
`cancelled`, then returns its final state. If `timeout` elapses first, the
server returns HTTP `408` with the in-progress snapshot. Default timeout:
300 000 ms (5 min).

### `POST /api/v1/jobs/:id/cancel`: cancel

```bash
curl -s -X POST "http://localhost:7655/api/v1/jobs/$JOB/cancel"
# { "success": true, "data": { "cancelled": true } }
```

Transitions the job to `cancelled` only if it hasn't reached a terminal
state. `404` otherwise.

### `POST /api/v1/execute`: invoke a tool

```bash
curl -s -X POST http://localhost:7655/api/v1/execute \
  -H 'Content-Type: application/json' \
  -d '{"action":"make_beat","params":{"vibe":"chill lo-fi"}}'
```

Returns an `OperationResult` envelope. When the tool is async-wrapped,
the response includes `changes.jobId`; call `wait_for_job` (or
`/jobs/:id/wait`) before assuming the work is done.

## SSE event stream

Subscribe to a live event feed via `GET /api/v1/events/stream`:

```bash
sas events stream
# event: mutation
# data: { "action": "make_beat", "result": {…}, "timestamp": … }
# event: jobProgress
# data: { "jobId": "…", "percent": 42, "message": "Generating drums…" }
# event: jobComplete
# data: { "jobId": "…", "result": {…} }
# event: jobFailed
# data: { "jobId": "…", "error": "…" }
# event: domainEvent
# data: { "type": "scene:created", "sceneId": "…" }
```

| SSE event | Payload | When |
|---|---|---|
| `mutation` | `{ action, result, timestamp }` | Any `/execute` call (success or failure) |
| `jobProgress` | `{ jobId, percent, message? }` | A wrapped tool called `reportProgress(pct, msg)` |
| `jobComplete` | `{ jobId, result }` | Async job reached `completed` |
| `jobFailed` | `{ jobId, error, remediation? }` | Async job reached `failed` |
| `domainEvent` | Typed business event (e.g. `scene:created`) | State changed in the engine or DB |

Use SSE when you want real-time progress without polling: a GUI progress
bar, a Slack notification on failure, a live dashboard. Use polling (`sas
job wait`) when you just want the final answer.

Subscribe with curl or `sas events stream`; filter with `grep`:

```bash
sas events stream | grep -E 'jobProgress|jobComplete|jobFailed'
sas events stream --filter jobProgress
```

## The job envelope

Every `JobState` returned by the endpoints has this shape:

```jsonc
{
  "id": "job_01HN…",            // uuid
  "operation": "make_beat",      // tool name
  "status": "running",           // queued|running|completed|failed|cancelled
  "progress": 42,                // 0-100, optional
  "progressMessage": "Generating drums…",
  "startedAt": "2026-05-13T13:24:55.000Z",
  "completedAt": null,           // ISO string once terminal
  "error": null,                 // error string when status='failed'
  "metadata": {                  // tool-supplied correlation hints
    "projectId": "…",
    "sceneId": "…"
  },
  "dependsOn": null,             // optional jobId array
  "result": null,                // workflow output, present when 'completed'
  "elapsedMs": 12345
}
```

`result` carries the original tool's `changes`/`data` payload, the same
shape it would have returned synchronously pre-async. Read it from
`sas job wait`, `sas job status`, or the `jobComplete` SSE event.

### Job dependencies (`dependsOn`)

A job may declare `dependsOn: [otherJobId, …]`. It stays in `queued` state
until every dependency reaches `completed`. If a dependency `fails` or is
`cancelled`, the dependent job auto-fails with a cascade reason. This is
how composite tools (e.g. `generate_scene_midi_bulk`) coordinate per-track
generation without exposing the orchestration to callers.

## MCP: `wait_for_job` and the async tools

MCP clients see the same async contract via a registered tool named
**`wait_for_job`** (reachable through the meta-tool `sas_run`, since it's
not one of the six top-level MCP primitives):

```jsonc
// MCP tool call
{
  "tool": "sas_run",
  "params": {
    "action": "wait_for_job",
    "params": { "jobId": "job_01HN…", "timeoutSeconds": 60 }
  }
}
```

`wait_for_job` polls the JobManager every 250 ms and returns when the job
reaches terminal state, or after `timeoutSeconds` (default 25, capped at
60). On timeout it returns `success: true` with `status: 'running'` and
`stillWaiting: true`. That's **not an error**; the agent retries.

Among the six default MCP primitives, **`sas_apply_plan`** is the one that
returns an async `jobId`. Other primitives (`sas_inspect`,
`sas_create_plan`, `sas_validate_plan`, `sas_render_preview`,
`sas_undo_checkpoint`) are fast enough to stay synchronous. Tools reached
via `sas_run` follow the wrapped-tool contract below.

## Which tools are async-wrapped

Wrap status (May 2026):

| Category | Wrapped tools |
|---|---|
| **Scene composition** | `scene_create`, `create_project`, `compose_contract`, `make_beat` |
| **MIDI generation** | `dsl_generate_midi`, `dsl_generate_drums`, `generate_scene_midi_bulk` |
| **Revision** | `revise_track`, `revise_scene` |
| **FX** | `dsl_set_track_fx`, `dsl_load_fx_chain`, `dsl_shuffle_preset` |
| **Rendering & export** | `render_to_performance`, `export_audio` |
| **Audio analysis** | `sas_analyze_audio`, `sas_split_stems` |
| **Sample library** | `scan_audio_directory`, `import_samples_by_criteria` |
| **Planning** | `sas_apply_plan` |

Synchronous tools (read-only or sub-second) include `sas_inspect_*`,
`sas_create_plan`, `sas_validate_plan`, `summarize_project`,
`dsl_list_tracks`, `dsl_track_mute`, `dsl_play`, etc. They return the
result directly, no `jobId`.

If you're unsure whether a tool is async, look at its response: if
`changes.jobId` is present, treat it as async.

## Worked example: Python

```python
import requests, time

API = "http://localhost:7655"

def execute(action, **params):
    r = requests.post(f"{API}/api/v1/execute",
                      json={"action": action, "params": params})
    r.raise_for_status()
    return r.json()["data"]

def wait(job_id, timeout_ms=120_000):
    """Long-poll until terminal."""
    r = requests.get(f"{API}/api/v1/jobs/{job_id}/wait",
                     params={"timeout": timeout_ms},
                     timeout=(timeout_ms + 5000) / 1000)
    return r.json()["data"]

# 1. Kick off async work.
res = execute("make_beat", vibe="chill lo-fi", sceneName="Verse")
job_id = res["changes"]["jobId"]
print(f"Job: {job_id}")

# 2. Block until terminal.
final = wait(job_id, timeout_ms=120_000)
if final["status"] == "completed":
    print(f"Done in {final['elapsedMs']}ms")
    print("Result:", final["result"])
elif final["status"] == "failed":
    print("FAILED:", final["error"])
elif final.get("stillWaiting"):
    print("Still running, re-poll")
```

## Worked example: bash

```bash
#!/usr/bin/env bash
set -euo pipefail

# Compose a scene asynchronously, render it, wait again.
SCENE=$(sas compose_scene \
  --description "moody dub techno" \
  --scene-name "Intro" \
  --bar-length 8 \
  --json '{"tracks":[
    {"name":"Bass","role":"bass","prompt":"deep sub"},
    {"name":"Drums","role":"drums","prompt":"laid back 90 BPM"}
  ]}' \
  --json)

# compose_scene returns a jobId; block before downstream calls.
JOB=$(echo "$SCENE" | jq -r '.data.changes.jobId')
sas job wait "$JOB" --timeout 180

# Now safe to render. render_to_performance is also async.
RENDER=$(sas render_to_performance --json)
RJOB=$(echo "$RENDER" | jq -r '.data.changes.jobId')
sas job wait "$RJOB" --timeout 60

echo "Composed and rendered."
```

## Troubleshooting

**`sas job wait` returns immediately with exit 4 ("timeout")**
The CLI's `--timeout` is in **seconds**, not milliseconds. `--timeout 60`
means wait 60 s, not 60 ms.

**`/api/v1/jobs/:id` returns 404 for a job I just kicked off**
Jobs live in-memory inside the app process. Completed jobs are
garbage-collected after ~1 h, and **all jobs are lost on app restart**. If
you need persistent results, capture them from `sas job wait` while the
app is alive.

**A job is stuck in `queued` forever**
It's waiting on a `dependsOn` that hasn't completed. Inspect with
`sas job status <id>` and look at `dependsOn`; chase those job ids with
`sas job list` to see which dependency is blocking.

**My downstream tool fails saying "track not found" but the upstream job's
`changes` showed a `trackId`**
You skipped `wait_for_job`. The upstream call returned a `jobId`; the
track wasn't created until later. Always block on the `jobId` before
running a tool that depends on the work.

**`sas events stream` keeps disconnecting**
SSE connections drop on app restart and through some reverse-proxy
configurations. The stream is fire-and-forget; restart the subscriber on
disconnect. The polling endpoints (`/jobs/:id`, `/jobs/:id/wait`) are the
durable option when reliability matters.

## See also

- [CLI reference](./cli-reference.md): every `sas` verb in detail.
- [For agents](./for-agents.md): integration patterns for Claude Code,
  Cursor, Claude Desktop, and custom MCP clients.
- [Plan-as-artifact loop](./plan-loop.md): the recommended six-verb
  pattern: `inspect → plan → validate → apply → preview → undo`. `apply`
  is async-wrapped, so plan execution follows the same `wait_for_job`
  rule.
