---
head:
  - - meta
    - name: description
      content: Signals & Sorcery integrates with Ableton Live. Send any scene into Live's Session view as audio + MIDI clips at the right tempo, or hand off a whole arranged song to Live's Arrangement view as stems with a locator per section. The companion extension installs itself.
  - - meta
    - name: keywords
      content: Ableton, Ableton Live, Ableton integration, export to Ableton, Ableton Session view, Ableton Arrangement view, Ableton extension, MIDI to Ableton, stems to Ableton, generative music Ableton, Signals and Sorcery Ableton
---

# Ableton Live Integration

Signals & Sorcery sends your work **straight into Ableton Live**, two ways:

| | Scene export | Song hand-off |
|---|---|---|
| **What** | One scene, or every scene in the project | Your whole [arranged song](/arrange/) |
| **Lands in** | Live's **Session view**, one row per scene | Live's **Arrangement view**, the full song |
| **You get** | Per layer: an **audio** clip, plus a **MIDI** clip for MIDI layers | **Stems** of the finished mix, plus a **locator** at every section |
| **The sound** | Each layer on its own; level and pan set on Live's mixer | Exactly your S&S mix, bus effects included; the stems sum to the Mix |
| **In Live** | Right-click a scene → **Import S&S scene…** | Right-click a scene → **Import S&S mix…** |

No file wrangling and nothing to install by hand.

## Requirements

- **Ableton Live 12 Suite**, **beta build 12.4.5 or later**; Ableton Extensions
  run only in the Suite beta. [Join the Ableton beta »](https://www.ableton.com/en/beta/)
- The **S&S Ableton extension 1.4.0** or later for song hand-offs. S&S installs
  and updates it for you (see below).
- macOS (the integration is macOS-first today).

## Setup: nothing to install by hand

S&S ships the Ableton extension and **installs it for you.** The first time you
run S&S with Ableton present, it places the extension into Live's extensions
folder automatically, and it updates it when a newer version ships with the app.

::: tip First time only
If Ableton was already running, **quit and reopen it once** so Live loads the
extension. You can confirm it under **Live → Settings → Extensions**.
:::

## Send scenes to Session view

### What you get

Each scene appears as a **row of clips** in Session view:

| S&S layer | In Ableton |
|---|---|
| Drums / Instruments / Synths / Bass / Ensemble / Arpeggiator / Pads | a rendered **audio** clip **and** a **MIDI** clip (no instrument; drop your own) |
| Loops / Stems | a rendered **audio** clip |

The audio is each layer's own sound, rendered at an even level and centred. Your
S&S fader and pan are set on Live's track volume and pan, so the balance matches
your mix; panel bus effects are not included. The MIDI is the raw notes, so you
can re-voice any part with your own instruments and racks.

### Use it

1. In **Signals & Sorcery**, click **Export to Ableton** on a scene (the ▦ button
   on the scene), or choose **Project menu → Export to Ableton…** to send every
   scene in the project at once. A progress bar shows the render; you never pick
   a save location.
2. In **Ableton**, switch to **Session view**, **right-click a scene** (the launch
   buttons in the rightmost column) and choose **Import S&S scene…**
3. If you've exported more than one scene, a **"Choose scenes to import"** window
   appears; tick the scenes you want (your newest export is pre-selected) and
   confirm. A single scene imports straight away, no picker.
4. Each chosen scene materializes as its own **Session row**: tempo set, audio +
   MIDI clips ready to play, with each track's level and pan taken from your S&S
   mix.

Re-importing is **additive**: scenes are appended as new rows, so an earlier
import is never overwritten. Export the same scene again and it re-renders in
place, ready to import fresh.

## Hand off a song to Arrangement view

When your song is arranged in [Arrange mode](/arrange/), you can hand the whole
thing to Live as stems that already sound exactly like your S&S mix.

1. In **Signals & Sorcery**, press **Export…** in the arrangement pane, tick
   **Ableton hand-off**, and press export. (See
   [Exporting your song](/arrange/#exporting-your-song) for the other options.)
2. In **Ableton**, **right-click a scene** in Session view and choose
   **Import S&S mix…** Live imports your newest hand-off.
3. The song lands in **Arrangement view**:
   - the tempo is set first;
   - one audio track per stem (one per panel, plus any layer that isn't on a
     panel bus), each clip the full length of the song, unwarped;
   - every track at **0 dB and centred**: your faders, pan and bus effects are
     already in the audio, so leave the Live mixer flat to hear your S&S mix;
   - a **locator** at the start of every section, named after it;
   - if you also exported **Editable stems**, each one arrives **muted** and named
     "… · pre-bus", ready to swap in when you want to redo a panel's bus effects
     in Live.

Exporting the same song again replaces its hand-off, and each import adds new
tracks in Live, so delete an old import in Live if you re-import.

## Where your exports live

You normally never need these paths, but if you want to find, open, or clean up
your exports, **Signals & Sorcery → Settings → File Locations** lists them all
(read-only, each with an **Open** button):

- **Export Folder**: where S&S stages scenes and song hand-offs for Live to import.
- **Extension Install Folder**: where the S&S extension is installed.
- **Clear Exports**: a one-click button that deletes the staged bundles (scenes
  and song hand-offs) once you've imported them into Live. It doesn't touch the
  song exports you saved to your own folder.

The same panel also shows your sample, loop, SurgeXT preset, and app-data folders.

## Troubleshooting

- **No "Import S&S scene…" or "Import S&S mix…" in the menu?** Restart Ableton once
  (the extension loads at launch), and confirm you're on **Live 12 Suite beta
  12.4.5+**.
- **"No S&S bundle found"?** Click **Export to Ableton** in S&S first, then run the
  import in Live.
- **"No S&S mix bundle found"?** Export the song from Arrange mode with **Ableton
  hand-off** ticked first, then run **Import S&S mix…** in Live.
- **Right-click where?** On a **scene** in Session view (the launch buttons in the
  rightmost column), not on an empty clip slot. This is also where **Import S&S
  mix…** lives, even though the song lands in Arrangement view.
- **Picker shows an old scene?** Every scene export you haven't cleared stays
  available to import. Tick only the scenes you want, or clear old bundles from
  **Settings → File Locations → Clear Exports**.
- **Imported something twice?** Imports add new rows or tracks rather than
  replacing old ones; delete the extras in Live by hand.
