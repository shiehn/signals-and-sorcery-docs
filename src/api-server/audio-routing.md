---
sidebar: auto
title: Audio Output
---

# Audio Output

Signals & Sorcery plays everything on **one stereo output**: the scene you are
composing, the arrangement and previews. There is nothing to route
by hand. Any output works, from built-in speakers and headphones to a multi-output
audio interface, on macOS (Core Audio) and Windows (WASAPI).

## Where to set it

Open **Settings → Audio In / Out**.

### Output device

The panel shows the current output device and how many channels it has.

- **Follow system output device** (on by default): Signals & Sorcery switches
  automatically when your computer's default output changes, for example when you
  plug in headphones or an interface.
- To use a different device, change the system output (the **Change device in
  System Preferences** link opens the macOS sound settings; on Windows use the
  Sound settings), or turn the checkbox off to stay on the current device.

### Output channels

If your interface has more than one stereo pair, choose the pair under **Output
Channels** (for example **Channels 3-4**). Devices with a single pair show
**Outputs 1-2**.

| Pair | Outputs |
|------|---------|
| 1    | 1-2     |
| 2    | 3-4     |
| 3    | 5-6     |
| etc. | ...     |

If you pick a pair and later switch to a device that doesn't have it, Signals &
Sorcery plays on that device's first pair and uses your pair again when a device
that has it is connected.

### Buffer size

**Buffer Size (latency)** sets how much audio the engine prepares ahead, from 128
to 4096 samples. Larger buffers are safer against clicks and dropouts on busy
projects; smaller ones feel more immediate. If you hear crackles, raise it. A new
buffer size takes effect after **Restart engine now**.

The engine runs at your device's sample rate.

### Input

The same panel sets the input device for recording, a latency calibration, and the
input gain with a level meter.

---

## Master FX (monitor only)

The **Master** strip on the right of the transport bar has a **MASTER FX** toggle.
It opens a chain of monitor-only effects for your listening setup, such as room
correction or headphone virtualization. These effects are **never printed** to
renders, freezes or exports, so your files stay clean.

---

## Streaming

To send Signals & Sorcery to OBS or a similar app, make a virtual audio device your
system output ([BlackHole](https://existential.audio/blackhole/) on macOS,
[VB-Audio Virtual Cable](https://vb-audio.com/Cable/) on Windows) and capture it
in your streaming app. On macOS, a **Multi-Output Device** (Audio MIDI Setup) that
combines BlackHole and your headphones lets you hear the stream too.

Bypass the Master FX while streaming: monitor-only correction is meant for your
room or headphones, not for your audience.

---

## If a device disappears

If the output device is unplugged, Signals & Sorcery falls back to the built-in
output and shows a warning.

---

## Configuration reference

Audio settings are stored with the following keys:

| Key | Values | Description |
|-----|--------|-------------|
| `outputDeviceId` | string | The selected output device |
| `outputPair` | a channel pair (1-based, e.g. outputs 1-2) | The one stereo pair everything plays on |
| `followSystemDefault` | boolean | Follow the system's default output device |
| `inputDeviceId` | string | The input device for recording (empty = none) |

Settings saved by older versions (with separate cue and main outputs) are converted
automatically when the app starts.
