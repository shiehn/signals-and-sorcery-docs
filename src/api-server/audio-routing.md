---
sidebar: auto
---

# Audio Routing Modes

Signals & Sorcery supports a performance workflow where the performer can audition and generate privately while the audience hears only approved output. Routing is explicit and predictable on macOS (Core Audio), with no paid dependencies required.

## Concepts

### Buses

- **Cue Bus**: Private monitoring for the performer (headphones)
- **Master Bus**: Public output (PA or stream)
- **Monitor Mix** (optional): What the performer hears when blending Cue + Master

### Channel Pairs

A "channel pair" is a stereo output pair on your audio interface:

| Pair | Outputs |
|------|---------|
| A    | 1-2     |
| B    | 3-4     |
| C    | 5-6     |
| etc. | ...     |

---

## Mode 1: Solo Mode

**One output device, one stereo pair**

### Use Case

A solo user on a laptop with a single stereo output can listen to the composition process (Cue), transition preview, or Master output—but only one at a time.

### Minimum Hardware

- Any Mac with a single stereo output (built-in, USB dongle, etc.)
- Headphones or speakers

### Routing

- SAS uses exactly **one stereo output pair** (e.g., outputs 1-2)
- Select a **Solo Listen Source**: `Cue`, `Transition Preview`, or `Master`
- SAS routes the selected source to the stereo pair
- All other sources are muted

### Settings

| Setting | Description |
|---------|-------------|
| Output Device | CoreAudio device to use |
| Output Pair | Channel pair (default 1-2) |
| Solo Listen Source | Which bus to monitor |

---

## Mode 2: Audience Mode

**Cue to headphones, Master to PA**

### Use Case

Performer generates and auditions privately in headphones while the audience hears only approved Master output on the PA system.

### Hardware Requirements

Audience Mode requires a CoreAudio device with **two independent stereo outputs**:
- One for **Cue (headphones)**
- One for **Master (PA)**

**Recommended:**
- Multi-output USB audio interface with at least **4 outputs** (two stereo pairs)
- DJ controller with built-in audio interface (appears as a CoreAudio device)

### Routing

| Bus | Destination | Example |
|-----|-------------|---------|
| Cue | Headphones pair | Outputs 1-2 |
| Master | PA pair | Outputs 3-4 |

### Device Capability Check

When selecting an output device, SAS detects the number of output channels. If fewer than 4 outputs are available:

::: warning
Audience Mode requires two independent stereo outputs (Cue + Master). Select a device with at least 4 outputs.
:::

### Settings

| Setting | Description |
|---------|-------------|
| Output Device | CoreAudio device |
| Cue Output Pair | Channel pair for headphones |
| Master Output Pair | Channel pair for PA |
| Headphone Blend | Optional mix of Cue + Master |

### Important

- Cue never leaks to Master output
- Master never interrupts Cue auditioning
- Switching scenes/transitions does not cause outputs to swap

---

## Mode 3: Stream Mode

**Cue to headphones, Master to stream capture**

### Use Case

Performer hears preview (Cue) in headphones while stream viewers hear only the Master output on Twitch or other platforms.

### Required Tools (Free)

- **[OBS Studio](https://obsproject.com/)** - Streaming software
- **[BlackHole (2ch)](https://existential.audio/blackhole/)** - Virtual audio capture device

::: tip
BlackHole is only needed for Stream Mode. Solo and Audience modes work without it.
:::

### Recommended Hardware

- USB audio interface (for headphones / cue)
- Optional microphone

### Routing

| Bus | Destination | Path |
|-----|-------------|------|
| Cue | Headphones | Interface outputs 1-2 |
| Master | Stream | BlackHole 2ch → OBS → Twitch |

### Implementation Options

#### Option A: Separate Devices (Simpler Setup)

Select different devices for Cue and Master:

| Bus | Device |
|-----|--------|
| Cue | Physical interface |
| Master | BlackHole 2ch |

#### Option B: Aggregate Device (Recommended)

Create a macOS Aggregate Device combining your physical interface and BlackHole:

1. Open **Audio MIDI Setup** (Applications → Utilities)
2. Click **+** → **Create Aggregate Device**
3. Check both your audio interface and BlackHole 2ch
4. Select the aggregate device in SAS

Then route:
- Cue → Interface channel pair
- Master → BlackHole channel pair

### OBS Setup

1. In OBS: Add **Audio Input Capture** → Select **BlackHole 2ch**
2. Disable monitoring in OBS to avoid echo
3. Add microphone separately if desired

### Settings

| Setting | Description |
|---------|-------------|
| Output Device | Aggregate device or interface |
| Cue Output Pair | Headphones (interface outputs) |
| Master Output Pair | BlackHole channels |

### Important

- Viewers hear only Master
- Cue never reaches stream
- Performer can audition safely without leaking unfinished material

---

## Mode Comparison

| Feature | Solo | Audience | Stream |
|---------|------|----------|--------|
| Minimum outputs | 2 | 4 | 2+ |
| Simultaneous Cue + Master | No | Yes | Yes |
| Virtual driver required | No | No | Yes (BlackHole) |
| Best for | Practice, solo production | Live PA performance | Twitch, YouTube |

---

## Error Handling

### Device Unplugged

If the selected device is unplugged, SAS will:
- Fall back to built-in output
- Switch to Solo Mode
- Display a warning

### Insufficient Outputs

If the selected device doesn't have enough outputs for the chosen mode:
- Audience/Stream mode will be disabled
- User must select a device with more outputs or switch to Solo Mode

---

## Configuration Reference

Audio settings are stored with the following structure:

| Key | Values | Description |
|-----|--------|-------------|
| `mode` | `solo`, `audience`, `stream` | Current routing mode |
| `outputDeviceId` | string | Selected CoreAudio device |
| `soloOutputPair` | number | Channel pair for Solo mode |
| `cueOutputPair` | number | Channel pair for Cue bus |
| `masterOutputPair` | number | Channel pair for Master bus |
| `soloListenSource` | `cue`, `preview`, `master` | Solo mode source selection |
