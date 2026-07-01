---
sidebar: auto
title: Custom Sounds — Bring Your Own
---

![custom-sounds](/sas_vault.png)

# Custom Sounds — Bring Your Own

Signals & Sorcery ships with curated sample packs and **Surge XT** as the default
synth, but you are never limited to what comes in the box. You can bring your own
sounds in two ways:

1. **[Import your own sample libraries](#import-your-own-sample-libraries)** —
   drop your commercial or homemade drum kits and instrument samples
   (Splice / Loopmasters-style WAV folders) into the **drum** and **instrument**
   generators, so generation and shuffle draw from *your* sounds.
2. **[Load your own instrument plugins](#load-your-own-instrument-plugins-vst3-au)** —
   put any **VST3 or AudioUnit** instrument on a synth track in place of Surge XT.

::: tip Which one do I want?
- Have a folder of **WAV samples** (one-shots or single hits)? → **Import a sample library.**
- Have a **synth or sampler plugin** installed on your Mac (Diva, Serum, Kontakt, an AU instrument, …)? → **Load it as an instrument plugin.**
:::

---

## Import your own sample libraries

The **drum** and **instrument** generators play sample-based kits. By default they
use the packs S&S provides, but you can import your own WAV libraries and they will
sit **alongside** the factory sounds (or replace them, for drums). Your imported
sounds are then picked up automatically by generation, shuffle, and the sound
browser — no per-track wiring needed.

Your imports are kept **completely separate** from the packs S&S ships: they live in
their own folder, are never overwritten by app updates or pack re-installs, and can
be backed up as a single archive.

### What you can import today

| | Drums | Instruments (pitched) |
|---|---|---|
| **Sound type** | One-shot hits (kick, snare, hat, …) | Single samples mapped across the keyboard |
| **Mapped to** | 24 drum roles | 32 instrument categories |
| **File format** | **WAV only** | **WAV only** |
| **Per sample** | One file = one hit | One file is repitched across all keys from a detected root note |

::: warning WAV only (for now)
Only `.wav` files are imported. Other audio (mp3, aiff, flac, ogg, m4a…) is detected
and **skipped** — the import screen tells you exactly how many files were skipped.
Convert them to WAV first if you want them included. Multi-zone / velocity-layered
formats (SFZ, DecentSampler) and looped instruments are not supported yet — pitched
imports are single-sample.
:::

### Before you start

- **Organize your samples into sub-folders by type.** The importer maps *one folder*
  to *one role/category*. A layout like `My Kit/Kicks/…`, `My Kit/Snares/…`,
  `My Kit/Hats/…` imports cleanly, because each sub-folder becomes a role.
- **Make sure the files are WAV.** Anything else is skipped.
- Your original files are **copied** on import, so you can move or delete the
  originals afterward without breaking anything.

### Step-by-step: import a drum kit

1. Open the import wizard from any of these places:
   - **Settings → Sample Library → "Import Drums…"**, or
   - the **"Import Samples"** button in the **Drum** generator panel header, or
   - the **"…or import your own drum samples"** link shown when no drum pack is installed.
2. A folder picker opens — select the folder that contains your kit and click **"Scan"**.
3. On the **review** screen:
   - Give the import a **Pack name** (a suggestion is pre-filled).
   - Leave **"Skip duplicates"** on to avoid re-importing files you already have.
   - In the **"Their folder → Import as"** table, check the role the wizard guessed
     for each of your folders. Each row has a dropdown — correct any wrong guesses,
     or choose **"— skip —"** to leave a folder out. (The wizard *learns* your
     corrections and reuses them next time.)
   - A yellow banner lists any non-WAV files that can't be imported.
4. Click **"Import N"** (N = the number of files that will be imported).
5. When it finishes, choose how the kit should be used:
   - **"Alongside the factory pack"** (default) — your sounds are added to the
     existing pool.
   - **"Use only my imported samples"** — disables the built-in drum pack so only
     your kit is used. This requires an **app restart** ("Restart now").

### Step-by-step: import an instrument library

The flow is identical, started from **Settings → Sample Library → "Import Instruments…"**
or the **"Import Samples"** button in the **Instrument** generator panel. Two differences:

- You map your folders onto **instrument categories** (pianos, pads, strings, brass, …)
  instead of drum roles.
- An optional **"Analyze pitch"** checkbox (off by default) detects each sample's root
  note when the filename and embedded metadata don't already specify one. S&S reads the
  root note from the WAV's metadata or a note in the filename (e.g. `Grand_C3.wav`) first;
  turn this on for samples that have neither.

Each imported instrument is a **single sample stretched across the whole keyboard** from
its root note — great for one-shot textures, pads, and simple keys.

### How your imported sounds get used

Once imported, your samples become **additional options in the same role/category pools**
the generators already use. You don't pick them by hand:

- **Generate** and the **🎲 shuffle** button draw from the combined pool (factory + yours).
- The more samples you have in a role, the more variety shuffle gives you.

### Managing your imported packs

Everything lives under **Settings → Sample Library**:

- **Imported Packs** lists each pack with its kind, file count, and size.
- **"Remove"** deletes a pack. Before it does, S&S runs a usage check and warns you
  if any tracks depend on it — e.g. *"3 tracks across 2 projects use this pack — 3 will
  fall silent."* — and asks you to confirm with **"Remove anyway"**. (Removal is
  whole-pack.)
- **"Back Up My Samples…"** zips your *entire* imported library into one archive, and
  **"Restore…"** merges a backup back in (skipping packs you already have). This is the
  easy way to move a painstaking import to another machine.

### Where your files live

Imported samples are **copied** into:

```
~/Library/Application Support/signals-and-sorcery/user-samples/
```

This folder is yours alone — app updates, pack downloads, and library scans never
touch it. Because everything is copied here, **deleting your original sample files is
safe**; the app keeps its own copy. (A track whose sample later goes missing simply
falls silent — it never crashes the app.)

---

## Load your own instrument plugins (VST3/AU)

On a **synth track**, the default instrument is **Surge XT**, but you can swap in any
**VST3** or **AudioUnit (AU)** instrument plugin installed on your Mac — a soft synth,
a sampler like Kontakt, a Rompler, anything that makes sound from MIDI. Gemini still
generates the MIDI; your plugin makes the sound.

### 1. Install the plugin (once)

Install your plugin the normal way for macOS so it lands in a standard location:

- **VST3** → `~/Library/Audio/Plug-Ins/VST3` (or `/Library/Audio/Plug-Ins/VST3`)
- **AudioUnit** → `~/Library/Audio/Plug-Ins/Components` (or `/Library/Audio/Plug-Ins/Components`)

S&S scans these standard system folders automatically — it does not read from custom
plugin directories.

::: tip After installing a new plugin, restart Signals & Sorcery
S&S scans for plugins when it starts up and caches the results. A plugin you install
while the app is already running may not appear in the list right away — **restart the
app** to pick it up reliably.
:::

### 2. Pick it on a synth track

1. On a synth track row, click the **▾ "Sound"** button (the chevron at the right of the
   row's button strip).
2. In the drawer, open the **"Pick"** tab.
3. You'll see a searchable grid of instruments. The first cell is always
   **"Surge XT / Default"**; every other cell is one of your installed VST3/AU
   instruments, labeled with its name, maker, and format (VST3 or AU).
   - Use the **"Search instruments…"** box to filter.
   - The **"Refresh"** button re-reads the scanned list. (If a freshly installed plugin
     still doesn't show, restart the app — see the tip above.)
4. Click an instrument to load it onto the track. Your generated MIDI is preserved — only
   the sound changes.

### 3. Choose presets in the plugin's own UI

After you pick a custom instrument, the drawer offers **"Open Plugin Editor"** — this
opens the **plugin's native window**, where you can browse its presets/patches exactly
as you would in any DAW. Use **"← Back"** to return.

### Your choice sticks

The instrument you pick **and the preset/patch you dial in** are saved with the track.
They are restored when you reopen the scene, save and reload the project, or import a
`.sasproj` file — per track. You don't have to set it up again each session.

### Notes & troubleshooting

- **macOS:** AU instruments are macOS-only; VST3 works the same on any supported platform.
  VST2 is not supported.
- **A plugin ships both VST3 and AU?** It appears as two separate entries. Prefer the
  **VST3** entry — preset save/restore is most reliable with VST3.
- **A new plugin doesn't appear?** Restart the app so it re-scans. The first scan after
  launch can take 20+ seconds for large plugin collections.
- **Track shows "MISSING" / an amber warning?** The project references an instrument that
  isn't installed on this Mac. Install that plugin (then restart), or pick a different
  instrument for the track.
- **The "Shuffle" button is greyed out** on a custom-instrument track — that's expected.
  Sound shuffle ("re-roll the sound") only works with the default Surge XT. To change a
  custom instrument's sound, open its plugin editor and choose a different preset.

---

## Next steps

- [Getting Started](/getting-started/) — install S&S and learn the core workflow.
- [Features](/api-server/) — the full capability overview.
- [Tutorials](/tutorials/) — video walkthroughs, including a samples demo.
- [Plugin SDK](/plugin-sdk/) — build your own generator plugins (a different kind of
  "custom" — extending the app itself rather than its sounds).
