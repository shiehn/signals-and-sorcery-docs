---
sidebar: auto
title: Arrange Mode
description: Compose scenes on top, arrange them into a full song at the bottom. Place, copy and link sections, select and paste clips, paint layers bar by bar, add fades and effects, hear your real mix, and export a mix, a master, stems or an Ableton hand-off.
---

# Arrange Mode

Signals & Sorcery has two rows. **You compose scenes on top and arrange them into a
song at the bottom.** The arrangement is a horizontal timeline: you drop scenes onto
it, repeat them, switch layers on and off bar by bar, copy and paste parts, add fades
and effects, and export the result. It plays your real mix, with your faders, pan and
panel bus effects applied live.

Arranging is **manual and literal**: what you place is what plays. Nothing is added
between sections for you, and nothing is filled in automatically.

Each project has **one arrangement**, saved with the project and built from its
scenes. It needs no account and no connection.

::: tip The short version
1. Compose a few scenes (a verse, a chorus, a breakdown).
2. Press **Arrange** in the bottom row. You get one of each scene, in order, with every layer playing.
3. Drag scenes from the palette to build the song, click or paint layers on and off, and press **Play**.
4. Keep composing. Mix changes are heard instantly; sound changes re-render only the layers you touched.
5. Press **Export…** for a mix, a master, stems or an Ableton hand-off.
:::

---

## How to think about it

Picture a big mixing desk:

- **Every layer of every scene is a channel that runs for the whole song**, each in its own horizontal lane.
- **Arranging is switching channels on and off over time.** Placing the chorus is a stretch of the song where the chorus layers are on.
- **A fade is a gradual switch, and a gain is that channel's level for that stretch.**
- **Each channel always feeds its own scene's panel bus.** A bus compressor only hears what is switched on in that bus, and reverb and delay tails on the bus ring out naturally when the layers feeding it stop.

The rest of this page is that idea, one gesture at a time.

### Words used on this page

| Word | Meaning |
|---|---|
| **Scene** | What you compose on top: a verse, a chorus. In the arranger each scene gets a letter (A, B, C…). |
| **Section** | One placement of a scene on the timeline, like "the second chorus". It is labelled with its scene's name ("Chorus"), numbered when the scene repeats ("Chorus (1)", "Chorus (2)"). The app sometimes calls a section an *instance*. |
| **Layer** | One track. It has a fixed lane that runs the length of the song, grouped under the scene it was composed in. |
| **Clip** | A continuous stretch of bars where a layer plays. Every section boundary is a clip edge, and a piece you paste or duplicate is its own clip. |
| **Guest** | A layer playing inside another scene's section, for example scene A's kick under a section of B. |

---

## The layout

The window has two rows with a divider between them:

- **Top: the composer.** Your scenes, tracks and panels.
- **Bottom: the arranger.** The timeline, with its own header.

Drag the divider to resize the rows. Entering arrange mode gives the arranger the
larger share.

### Folding a row

Either row can fold down to a thin strip when you want the room:

- Press the **chevron** in the row's header (the composer's is at the right end of the
  **Scenes** header; the arranger's is at the far right of its header). The row folds
  to a strip labelled **Composer** or **Arranger**. **Click the strip** to reopen the
  row at its previous size.
- Or **drag the divider** all the way to the edge to fold that row, and drag it back
  out to reopen it.
- Or use the keyboard: **⌘⌥↑** folds the composer (or reopens a folded arranger) and
  **⌘⌥↓** folds the arranger (or reopens a folded composer). On Windows use
  **Ctrl+Alt+↑** and **Ctrl+Alt+↓**.

One row folds at a time. A folded row reopens by itself only when you need it:
pressing **Arrange** or starting the arrangement reopens the arranger, and opening a
section's scene for editing reopens the composer.

### The arranger header

From left to right:

- **Arrangement** and **Cloud** tabs (see [The Cloud tab](#the-cloud-tab));
- **Arrange** / **Arranging**: switches arrange mode on and off;
- **Play** / **Stop**, and the position;
- **⧉** and what is on the clipboard, after you copy something;
- a small progress indicator while the arranger prepares audio (see [Preparing](#preparing-and-rendering));
- the stem status: **● arrangement up to date**, or a **Render stale (N)** / **Render pending (N)** button;
- the **sync badge** (see [Cloud sync and your phone](#cloud-sync-and-your-phone));
- **◆ Save** when one section is selected (see [Saved sections](#saved-sections));
- **↶** and **↷** for undo and redo;
- **Export…** (see [Exporting your song](#exporting-your-song));
- the fold chevron.

Notes and errors appear in a bar under the header, each with a **Copy** button.

### Inside the arranger

- **The palette** (top): one chip per scene, your saved sections (marked ◆), and the effects palette.
- **The ruler and section strip:** bar numbers, then one block per section, each with its time range (for example "Chorus · 0:30–1:00"). Hover the ruler for the exact position, like "17.3 · 0:42.6" (bar 17, beat 3, at 42.6 seconds); while the song plays, the same readout follows the playhead. Click the ruler to move the playhead, or drag across it to set a loop (see [Looping](#looping)).
- **The lanes:** one row per layer, grouped by scene, with each stem's **waveform** drawn in it. The gutter on the left shows the layer's name, its **M** and **S** buttons (see [Mute and solo](#mute-and-solo)), a small status dot for its audio, and a level meter while the song plays.
- **The corner** above the gutter: the tool button, **Select** or **Draw** (see [Select and Draw](#select-and-draw)), and the **⟲ Loop** switch.

Zoom with **⌘ + mouse wheel** (Ctrl on Windows) over the lanes.

---

## Start arranging

Press **Arrange** in the arranger header (or **Start arrangement**, shown the first
time). The first time, the arrangement is created with **every scene once, in
scene order, all layers on**. You rearrange from there.

Entering arrange mode:

- **stops the composition** (compose and arrange never play at the same time);
- **prepares the audio of each layer** in the background (see [Preparing and rendering](#preparing-and-rendering));
- **loads your panel bus effects** into the arrangement.

Press **Play** (or the **Space** bar) whenever you like: background preparation steps
aside when you press Play. Click the ruler to jump.

---

## Sections: drop, move, copy

### Drop a scene

- **Drag a scene chip** from the palette onto the timeline. A marker shows where it will land.
- Or **click the chip** to add it at the end.

**A fresh drop plays every layer of its scene.** You switch layers off from there.

### Select, move, delete

- **Click** a section's block to select it. **Shift-click** selects a range, **⌘-click** adds or removes one, and dragging across empty space in the section strip selects several. **⌘A** selects every section. **Escape** clears the selection.
- **Drag** a section (or a selection of several) left or right to reorder.
- **Delete** or **Backspace** removes the selected sections, and the song closes up. The scene itself is never touched.

### Copy or linked copy

There are two kinds of copy, and the difference matters:

| | How | What you get |
|---|---|---|
| **Copy** | **⌘-drag** a section, or **⌘C** then **⌘V**, or **⌘D** | An independent copy. It starts with the same layers, fades, gains and effects, and from then on editing one never changes the other. |
| **Linked copy** | **Alt/Option-drag** a section, or **⌘C** then **⌥⌘V** | A copy that **shares** its arrangement with the source. It shows a 🔗 badge. Edit one chorus and every linked chorus changes. |

Linked copies are the fast way to keep repeated sections identical. When one of them
needs to be different, select it and press **Make unique** (also in its right-click
menu): it keeps its current arrangement but stops following the others.

### Resize

Drag a section's **right edge**. Lengths are **whole bars** (1 bar minimum).

- **Longer than the scene's loop:** the loop keeps playing **in phase**. 16 bars of a 4-bar scene is four passes; 6 bars is one and a half.
- **Shorter:** the loop is cut at the new length.
- **Linked copies share their length**, so resizing one resizes all of them. Hold **Alt/Option** as you let go to resize just this one (it becomes unique).

### Rename, and the section menu

**Double-click a section's label** (or press **F2**) to rename it; **Enter** saves and an
empty name goes back to the default. **Double-click anywhere else on the section** to
edit its scene in the composer.

**Right-click a section** for its menu: **Rename**, **Edit this scene**, **Loop this
section**, **Make unique** (linked sections), **Fade in section** and **Fade out
section** (see [Fades](#fades-gain-and-the-wave-editor)), **Copy section name**,
**Copy section ID**, and **Delete**.

---

## Layers and clips

Every lane is one layer. Everything below works inside any section.

### Select and Draw

The arranger has two tools. The button in the corner shows which one is on; press
**B** to switch.

**Select** (the default) works like a DAW:

- **Click a playing part** of a lane to select that **clip**, for example the whole 16 bars of the kick in the chorus.
- **Click an empty cell** to set the **insertion point**: a thin line at that bar, where pastes and splits go.
- **Drag** to select a box of bars across one or more lanes.
- **Shift-click** extends the box; **⌘-click** adds or removes a clip.

**Draw** paints layers on and off:

- **Click a cell** to switch that layer on or off for the **whole section**.
- **Drag across bars** to paint them. The brush paints the opposite of the bar you start on, so starting on a playing bar paints bars off. "The bass comes in at bar 5" is just bars 1 to 4 painted off.
- Paint straight across section boundaries in one stroke. It is one undo step.

You can also paint without switching tools: hold **⌘** while you drag in Select.

A layer that is on at the end of one section and at the start of the next **plays
straight through**: one continuous run, with no restart and no cut. Between sections
the default is a **hard cut**; if you want a transition, add fades (below).

### Copy, cut, paste and duplicate

These work on whatever is selected, bars or sections, from the keyboard or the
**Edit** menu:

| Key | Does |
|---|---|
| **⌘C** | Copy |
| **⌘X** | Cut (copy, then delete) |
| **⌘V** | Paste |
| **⌥⌘V** | Paste sections as **linked** copies |
| **⌘D** | Duplicate right after the selection |
| **Delete** | Delete |

How bars paste:

- **Pasted bars land on the same lanes** they came from (tracks never leave their lane), starting at the insertion point. If there is none, they start at the beginning of your selection, or at the playhead's bar.
- **They replace** what those lanes played in those bars, and they **sound identical**: the same loop bars, fades, gain and effects as the original.
- **Into another scene's section**, a pasted layer plays there as a guest, through its own scene's bus.
- **Deleting bars leaves silence**: the song keeps its length. Deleting sections removes them and the song gets shorter.

Sections paste after the selected section. After a paste, what you pasted is selected,
so you can paste again or move on.

What is on the clipboard shows in the header (**⧉** and a short description, like
"Kick (16 bars)"). It stays there while the app is open. If a change also affects
linked copies, a note says so.

### Split and join clips

Splitting a clip lets you select, copy or delete one part of a run on its own. It
doesn't change the sound.

- **⌘E Split**: splits at the insertion point (click a bar first), or at the playhead if it is inside your selection, or at the edges of your selection.
- **⌘J Join**: removes the splits inside your selection. Section starts always stay clip edges.

Both are in the **Edit** menu and in the right-click menu of a clip (**Split at bar N**,
**Join clips**).

### Layers from other scenes (guests)

Every layer of every scene has a lane, and **you can play any layer inside any
section**. Keep scene A's kick running under the next two sections of B, or bring the
chorus pad into the last verse.

- A layer playing in another scene's section is a **guest**. Guest parts are drawn more faintly, with an outline, and hovering one says which scene it comes from.
- A guest **keeps its own lane, its own fader and pan, and its own scene's panel bus**, with that bus's effects. Scene A's kick under B still goes through scene A's drum bus, never scene B's.
- Guests start **off** everywhere. Paint them on, or paste them in, where you want them.
- A guest painted across several sections **keeps its loop running** rather than restarting at each section boundary.
- Click a scene's group header in the gutter to collapse its lanes. A **guests** strip stays visible, so you can still see where that scene's layers visit other sections.

### New tracks

A track you add to a scene **plays in every section of that scene**, because a fresh
drop plays all of its scene's layers. It is highlighted in the gutter with a **new**
badge and two small buttons (both also in the track's right-click menu):

- **Turn off in arranged sections** (the crossed-circle button) switches it off in the sections you have already arranged, so it doesn't barge into parts you finished (fresh drops keep it);
- **✓ Mark reviewed** hides the badge.

Tracks from the **Stems** panel, recordings and voice tracks appear as lanes too.

### Mute and solo

Each track has **M** and **S** buttons beside its name. They work across the whole
arrangement: everywhere the track plays, in its own sections and as a guest.

- **M** mutes the track.
- **S** solos it: while any track is soloed, only soloed tracks sound (and a muted track stays muted). To solo that track **alone**, unsoloing the others in one step, **Alt- or ⌘-click S** on macOS (**Alt- or Ctrl-click** on Windows). On macOS, Ctrl-click opens the menu instead.
- Silenced tracks are drawn dimmed. Changes are instant, with no rendering.
- The arranger's mute and solo are separate from the composer's. A track the composer silences (muted, left out by a solo, or on a panel bus that is muted) stays silent here too, and its row says why, for example **muted in Compose** or **silent in Compose (its bus is muted)**. Its M stays unlit.
- M and S are saved with the arrangement, and each click is one undo step.
- [Exports](#exporting-your-song) follow what you hear.

### The track menu: restore, copy

**Right-click a track's name** for its menu:

- **Copy track ID** and **Copy track name**. Hovering a name also shows its ID, with a copy button. IDs are handy when you work with an agent or the `sas` CLI.
- **Restore** (it shows the track's name, for example **Restore Kick**) clears every arranger edit to that track (bars switched off, clips and splits, gain, fades, gain envelopes, effects, phase), so it plays again in every section of its scene. Mute, solo and your sections are left as they are, and sections you deleted don't come back. It is one undo step, and it is greyed out when there is nothing to restore.
- For a new track: **Turn off in arranged sections** and **Mark reviewed**.

---

## Fades, gain and the wave editor

### Fades

- **Right-click a clip** and choose **Fade in** or **Fade out**, then a length: **1 beat**, **2 beats**, **1 bar**, **2 bars**, **4 bars** or **Custom…** (in beats). The same menu has **Remove fade in**, **Remove fade out** and **Remove fades**.
- **Fade a whole section:** right-click the section and choose **Fade in section** or **Fade out section**. Every layer that starts at the section's first bar fades in (or ends at its last bar fades out). Layers that carry on across that edge keep playing; a note says so.
- **Drag a fade handle:** each clip has small square handles at its top corners. Drag inward to set the fade (it snaps to quarter beats; hold Alt/Option for fine control); drag back to the corner to remove it. There are no handles where a layer carries on into the next section.

Fades sit at the real start and end of a layer's run, and fade curves are drawn over
the waveform.

### The wave editor

**Double-click a clip** (or right-click it and choose **Edit fades & gain…**) to open
the wave editor under the timeline. It shows that clip's waveform and lets you:

- choose the **fade shape** for the fade in and fade out: **Equal power**, **Linear**, **Exponential** or **S-curve**;
- draw a **gain envelope**: click to add a point, drag to move it, press Delete to remove it (up to ±24 dB);
- tick **Normalise view** to see quiet parts clearly (it changes only the picture, not the sound);
- press **Reset** to clear the envelope and fade shapes.

Close it with **×** or **Escape**.

The waveforms in the lanes are drawn at a comfortable height for each stem, so quiet
parts stay visible; that doesn't change what you hear.

### Gain and phase

- **Right-click an empty cell** (or choose **Fade & gain settings…** on a clip) to open the lane settings for that layer in that section: **Fade in (beats)**, **Fade out (beats)**, **Gain (dB)** (up to ±24 dB on top of the fader), **Phase**, and **Back to defaults**.
- For quick level changes, hold **Alt/Option** and turn the **mouse wheel** over a cell: each notch moves that layer's gain in that section by 0.5 dB.

**Phase** decides where a layer's loop is when a section starts:

- **with the instance:** the loop starts at its first bar when the section starts. This is the default for a scene's own layers, so a bass that enters at bar 5 plays loop bar 5, in step with its drums.
- **continue the run:** the loop carries on from where the layer's run began. This is the default for guests, so a kick running across three sections never restarts.
- **default:** use the rule above.

If a run continues into the next section but its loop jumps there, the lane shows a
small ▼ marker; hovering it explains the jump. Resize the first section to a whole
number of loops, or set that layer to **continue the run**, if you don't want it.

Fades, gain envelopes and settings belong to the section, so linked copies share them.

---

## Effects

The **effects palette** under the scene chips holds one-bar (or longer) effects you
place by hand:

| Effect | What it does |
|---|---|
| **Roll ⅛**, **Roll 1/16**, **Accelerating roll** | Drum-roll fills made from the layer |
| **Stutter** | Repeats a slice of the bar (2 to 16 repeats) |
| **Reverse** | Plays the bar backwards |
| **Gap** | Cuts the end of the bar to silence |
| **High-pass sweep**, **Low-pass sweep** | Filter sweeps over one or more bars (start and end frequency, curve) |
| **Tape stop** | Slows the layer to a stop |
| **Bar loop** | Repeats a short window of bars |
| **Crash wash**, **Impact** | A hit with echoes and room, played on top |
| **Mix Assets** (↗ risers, ✦ hits and shots) | Your Mix Assets sounds, placed where you want them |

- **Drag an effect onto a lane cell** to place it on that layer at that bar. Most effects replace the layer's sound for those bars; **Crash wash**, **Impact** and Mix Assets play on top.
- **Drag a Mix Assets sound** onto a bar, or **onto a section's header**: a hit lands on the section's first beat and a riser builds into its end.
- **Click a placed effect** to select it and edit its settings; **drag it** to another bar or section on the same lane; press **Delete** to remove it.
- Placed effects follow the lane's level and fades. Each is **rendered once and cached**, so it plays after its render is ready (see [Render pending](#preparing-and-rendering)).
- In a linked section, an effect applies to every copy.

Nothing is ever placed automatically.

---

## Preparing and rendering

Arrange mode doesn't run your instruments. It plays a **rendered audio stem of each
layer**, which keeps it light: no synths load between sections, however long the song.
The arrangement is always built from your current scenes, tracks and mix, so it can't
drift from the composition.

### What is live, and what needs a render

The stems carry each track's own sound: its notes, its instrument, preset or sample,
and **its own insert effects**. Everything after that is applied live, once:

**Instant, no rendering (the mix):**

- track faders, pan, mute and solo;
- panel bus levels and the **panel bus effects** themselves. A bus plugin has one setting for the composer and the arranger: tweak it in its plugin window on either side and the other follows. The plugin window opens on whichever is playing;
- everything you do in the arranger: layers on and off, copying and pasting, fades, gains, moving, copying and resizing sections.

Mixing is often easiest in arrange mode: move a fader in the composer while the whole
song plays and you hear it straight away.

**Needs a re-render (the sound):**

- the notes, the instrument, preset or sample, and the track's own insert effects;
- the scene's loop length or time signature;
- the project tempo (every layer re-renders).

Tweaks you make inside a plugin's own window count too, even before you save the
project: they are picked up when you enter arrange mode, press Play, or export.

### The header indicators

- **Preparing n/m…** (also "Preparing edges", "Preparing effects" or "Building") means the arranger is rendering what the arrangement needs in the background. It never blocks you: playback and edits carry on, and background preparation steps aside when you press Play. If you press Play while the arrangement is still preparing its audio, playback **starts by itself** when it is ready; a note under the header says so, and the button reads **Starting… (cancel)** until then (click it, or press Space, to cancel).
- **Render stale (N)**: N layers' sounds changed since their last render. Until they re-render, those layers **keep playing their previous render**, so playback never stops for them. Stale layers refresh on their own when you enter arrange mode and whenever the app is idle and stopped; press the button to do it right away.
- **Render pending (N)**: the exact starts and stops of layers that come in or leave mid-loop, and your placed effects, are waiting to render. Until then those edges are close approximations and placed effects are silent.
- **● arrangement up to date**: everything matches.

::: warning Renders happen while stopped
Rendering briefly takes over the audio engine, so it only happens while nothing is
playing. While the song plays, the header says how many layers **will refresh when
stopped**, and they keep playing their old version until you stop.
:::

### Layers start and stop cleanly

When a layer comes in halfway through its loop, it **starts from silence**, with no
leftover reverb or delay from bars you didn't hear. When it stops halfway through, its
**reverb and delay ring out** naturally instead of being cut off. Audio loops let their
effects ring out when they stop too. This is what **Render pending** prepares.

### Status dots

The dot next to each layer's name:

| Dot | Meaning |
|---|---|
| **fresh** | The stem matches the composition. |
| **stale** | The sound changed; the previous render plays until it refreshes. |
| **rendering** | Being rendered now. |
| **missing** | Nothing rendered yet. It renders before the song plays. |

---

## Undo and redo

The arrangement has **its own history**, separate from the composition's undo. Every
action is one step with a name: hover **↶** or **↷** to see what it will undo or redo.

With the arranger focused, **⌘Z** undoes and **⇧⌘Z** redoes (Ctrl on Windows); the
**Edit** menu does the same. Undo in the arrangement never touches your scenes or
tracks.

---

## Saved sections

When a section is arranged just right, save it to reuse:

1. Select one section.
2. Press **◆ Save** in the header, type a name (for example "breakdown") and press **Enter**.

It appears in the palette as a **◆** chip. Drag it onto the timeline to insert a copy,
or hold **Alt/Option** as you drop it to insert a linked copy.

---

## Compose and arrange

### Edit a section's scene

**Double-click a section** (or right-click it and choose **Edit this scene**) to go
straight to its scene in the composer. Arrange mode stops, the composer shows that
scene (and reopens if it was folded), and a line under the arranger header lists which
layers play in that section. Press **Arrange** to come back.

### Compose and arrange never play at once

There is one output, and one of them has it at a time. **Starting the arrangement
stops the composition, and starting a scene in the composer stops the arrangement.**

## Looping

By default the **whole arrangement loops**. The loop markers on the ruler show where
the loop starts and ends.

- **Turn looping on or off:** the **⟲ Loop** switch in the corner above the gutter, or **L**.
- **Loop part of the song:** drag across the ruler, or drag the loop markers (they snap to bars).
- **Loop a section:** double-click it on the ruler, press **⟲** on it, or right-click it and choose **Loop this section**. **⇧L** loops the selected sections.
- **Back to the whole song:** press **⟲** on the looped section again (or right-click it and choose **Loop the whole arrangement**).

Setting a loop turns looping on. The loop stays put while you edit, and it is saved
with the arrangement on this computer; it isn't part of undo, and it never affects
exports. With looping off, playback stops at the end of the song.

---

## Exporting your song

Press **Export…** in the arranger header (in arrange mode, with at least one section).
Everything is **rendered offline** from the arrangement, never recorded live, and the
monitor-only **Master FX** is never included. You don't need to stop or save first.

### What to export

Tick any of:

| Option | What you get |
|---|---|
| **Mix (32-bit float, no processing)** | The reference: your song exactly as it plays, at 32-bit float and your device's sample rate, never normalized, limited or dithered |
| **Master** | A release-ready file: brought to a loudness target, held under a true-peak ceiling by a limiter, and dithered |
| **Stems (one per panel)** | One file per panel bus, plus one per layer that isn't on a panel bus |
| **Editable stems (pre-bus)** | Each bussed layer on its own, before its panel's bus effects |
| **Ableton hand-off** | Stems ready to open in Ableton Live's Arrangement view |

The **Mix** and the **Master** are ticked to start with.

The export **follows what you hear**: tracks muted (or left out by soloing others) in
the arranger or in the composer are not in the Mix and get no stems. The dialog lists
them under **Left out**, so nothing goes missing by surprise. In an Ableton hand-off,
the arranger's muted tracks arrive as muted tracks.

Every file is the song **plus its tail**: bus reverbs and delays ring out for up to
10 seconds after the last bar, trimmed where the sound ends. All files have the same
length, so they line up.

### Master settings

- **Preset:** **Streaming** (−14 LUFS, −1 dBTP, the default, right for most streaming services), **Loud** (−9 LUFS, −1 dBTP) or **Custom** (a **Target LUFS** from −60 to −1 and a **Ceiling dBTP** from −20 to 0).
- **Bit depth:** **24-bit** (the default) or **16-bit**, both with TPDF dither, or **32-bit float** (no dither).
- **Sample rate:** **Device rate** (the default, no resampling), or **44.1 kHz**, **48 kHz** or **96 kHz** for delivery. The master is resampled from the 32-bit Mix at the best quality before mastering. This setting applies to the master only; the Mix and stems stay at the device rate.
- **Stem format** (for stems and the Ableton hand-off): **32-bit float** (recommended) or **24-bit**.

If some layers' stems are out of date, a box (ticked by default) renders them before
the export, so what you export always matches your composition.

### Where the files go

Choose a **Destination** (the default is **~/Music/Signals & Sorcery Exports**). Each
export makes a **new folder** named after the arrangement and the date and time, so an
export never overwrites an earlier one. Inside:

- `<name> - Mix (32f).wav`
- `<name> - Master (Streaming -14 LUFS, 24-bit).wav` (the name records the preset and format)
- `Stems/01 Drums.wav`, `Stems/02 Bass.wav`, … and `Editable stems/…`
- `<name> - export.json`: a record of the export (the settings, every file with its checksum and peak, the loudness report, the stems check, the bus effects used and any warnings)

A progress bar shows each step. **Cancel** stops the export and removes its folder, so
nothing half-written is left behind. When it finishes: **Reveal in Finder**, **Export
again** or **Close**. One export runs at a time.

### Reading the loudness report

When the master is done, the report compares the **Mix (in)** with the **Master (out)**:

| Row | What it tells you |
|---|---|
| **Integrated loudness** (LUFS) | How loud the whole song is on average. Streaming services turn songs down to about −14 LUFS, so a master louder than that gains nothing there. |
| **Loudness range** (LU) | How much the loudness moves between quiet and loud parts. Needs at least 3 seconds of audio. |
| **True peak** (dBTP) | The highest peak, including peaks that appear between samples on playback. The master stays under your ceiling. |
| **Peak-to-loudness** (dB) | The gap between the peaks and the average loudness: bigger means punchier, smaller means more squashed. |
| **Gain reduction** (peak / mean, dB) | How hard the limiter worked, at its most and on average. |

A value that can't be measured shows **—**. If the master was resampled, a line says
from which rate to which.

Warnings, in plain words:

- **Heavy limiting:** reaching the target took more than 6 dB of peak gain reduction, so expect audible limiting. A lower target, or a quieter mix, keeps more punch.
- **Target missed:** the master came out more than 0.2 LU away from the target, because the ceiling caps how loud this material can go.
- **Mono content:** both channels are identical; the file is delivered as stereo.
- Others you may see: the limiter needed a small overall trim to hold the ceiling; the song is shorter than 400 ms (measured without gating); or a few edges or effects failed to render (those play with approximate edges or without the effect).

### Stems that sum to the mix

**Stems (one per panel)** gives one file per panel (Drums, Bass, Pads, Synths and so on).
Each sums that panel's bus across every scene, through its own chain, with faders, pan
and bus effects included. A layer that isn't on a panel bus gets its own stem, named
"Track (Scene)". Added together, the stems **equal the Mix**: the report's
**Stems null test** line shows how closely they match, and passes when the difference is
at or below −60 dB (in practice it is far lower).

**Editable stems (pre-bus)** gives each bussed layer on its own, before its panel's bus
effects (fader and pan included), so you can redo a bus chain elsewhere. They are extra
material and are not part of the null test.

### Ableton hand-off

Tick **Ableton hand-off** to send the song to Live. In Live, right-click a scene and
choose **Import S&S mix…**: the song lands in **Arrangement view** with the tempo set,
one track per stem at **0 dB and centred** (your mix is already in the audio), a
**locator at every section**, and any editable stems **muted** and ready to swap in. It
needs the S&S Ableton extension **1.4.0**, which Signals & Sorcery installs for you. See
[Ableton Integration](/ableton/#hand-off-a-song-to-arrangement-view) for details.

---

## Cloud sync and your phone

Your arrangement lives on your computer and works without a connection. When you are
signed in, it also **syncs to the cloud** in the background, so you can open it on your
phone, keep arranging there, and find your edits back on the desktop.

### Cloud sync

The **sync badge** at the right of the arranger header shows where things stand:
**Synced**, **Syncing…**, **Offline · saved, will sync**, **Local only** (signed
out), **Sync off**, or **Needs attention** with the reason. Click it for:

- **Sync arrangements to the cloud**: on by default when you are signed in. Turn it off and nothing leaves this computer.
- **Sync now**, and any notes. When both devices change the same thing, your newest edit wins, and the other device shows a note with **Undo**.
- **Open on web ↗**, and a **QR code** to scan with your phone: both open this arrangement on the web.
- **From the cloud (not applied)**: versions saved elsewhere that couldn't be merged automatically. **Use this version** applies one, as a single undoable step.

Edits from the web arrive on their own; a note says how many, with **Undo**.

### For the web

Your phone plays the audio your computer prepares. With **Prepare every scene for the
web** on (it is, by default, while sync is on), Signals & Sorcery prepares every scene's
audio in the background: one scene at a time, smallest first, only after you have been
away for a couple of minutes and never while anything plays. It stays within your plan's
storage and waits if your disk is nearly full. The badge shows the progress, like
"For the web: 3 of 12 scenes ready"; **Pause until restart** stops it for now.

### On your phone

Open **[signalsandsorceryapi.com/arranger](https://signalsandsorceryapi.com/arranger/)**
on your phone (or scan the QR code from the sync badge) and sign in with the same
account. Each project has its arrangement, the same one you see on the desktop.

- **Turn your phone sideways.** The timeline needs the width. On iPhone, for the full screen, tap Share, then **Add to Home Screen**, and open the arranger from there.
- **Tap** to select, **long-press** for menus (on a section, a track name, or the lanes), drag one finger to scroll, **pinch** to zoom, and **double-tap** a clip for the wave editor. Long-press, then drag, to select a box of bars.
- **The rail on the right** holds the tools: Select, Draw, Add (the scenes), Paste, Loop and Fit. With something selected it switches to Split, Join, Copy, Paste, Duplicate, Loop this and Delete.
- **Mute and solo** are in a track's menu: tap its name.
- **Play** with **Live**: your arrangement as it is on the phone, edits included, played right there (without your panel bus effects). You can also play the mix your desktop made. On iPhone, the ring/silent switch mutes web audio, so flip it if you hear nothing.
- **History** (🕘) lists earlier versions to restore, next to undo and redo.
- **Scenes appear as your desktop prepares them.** One that isn't ready yet shows greyed out in the scene list.
- **Some things stay on the desktop:** levels (gains and gain envelopes show on the phone, but you change them on the desktop), panel bus effects, reviewing new tracks, and exporting.

Your phone's edits reach the desktop within seconds when both are online, and edits made
offline are kept and sync when you reconnect.

### The Cloud tab

The **Arrangement** tab is the arranger described on this page. The **Cloud** tab holds
the older cloud arranger, which needs you to sign in; it is separate from your
project's arrangement.

::: tip Coming soon
Share links, so anyone can listen to your latest synced mix, are on the way.
:::

---

## Keyboard and mouse

⌘ is Ctrl on Windows, and ⌥ is Alt.

| Action | Gesture |
|---|---|
| Fold or reopen a row | The chevron in its header, or click the strip; ⌘⌥↑ / ⌘⌥↓ |
| Add a scene | Drag its palette chip onto the timeline, or click the chip to add it at the end |
| Select sections | Click; Shift-click for a range; ⌘-click to add; ⌘A for all |
| Move a section | Drag it |
| Copy a section | ⌘-drag, or ⌘C then ⌘V, or ⌘D |
| Linked copy | ⌥-drag, or ⌘C then ⌥⌘V |
| Unlink | **Make unique** (button or right-click) |
| Resize | Drag the section's right edge (hold ⌥ as you let go to resize only this one) |
| Rename a section | Double-click its label, or F2 |
| Edit a section's scene | Double-click the section |
| Section menu | Right-click the section |
| Switch tool | B (Select / Draw), or the corner button |
| Select a clip | Click it (Select tool) |
| Set the insertion point | Click an empty cell |
| Select bars | Drag a box; Shift-click to extend; ⌘-click to add or remove |
| Paint bars on or off | Draw tool, or hold ⌘ while dragging |
| Cut / copy / paste | ⌘X / ⌘C / ⌘V |
| Duplicate | ⌘D |
| Delete | Delete or Backspace |
| Split / join clips | ⌘E / ⌘J |
| Fades | Right-click a clip, or drag its corner handles |
| Wave editor | Double-click a clip |
| Lane settings (gain, fades, phase) | Right-click an empty cell |
| Nudge gain | ⌥ + mouse wheel over a cell |
| Place an effect | Drag it from the effects palette onto a cell |
| Zoom | ⌘ + mouse wheel |
| Play / stop | Space, or the Play button |
| Jump | Click the ruler |
| Loop on or off | L, or **⟲ Loop** in the corner |
| Set a loop | Drag across the ruler, or drag the loop markers |
| Loop a section | Double-click it on the ruler, or ⟲ on the section; ⇧L for the selected sections |
| Mute / solo a track | **M** / **S** beside its name; ⌥- or ⌘-click S to solo it alone (Alt- or Ctrl-click on Windows) |
| Track menu (copy ID, restore) | Right-click the track's name |
| Undo / redo | ⌘Z / ⇧⌘Z, or ↶ ↷ |
| Clear the selection | Escape |
| Collapse a scene's lanes | Click its group header |

---

## Arranging from an agent or a script

Everything on this page is also available to agents and scripts, through the
`arrangement_*` tools and the `sas arrangement` commands. They take plain names ("the
second chorus", "Kick"), and an agent's edit and a gesture in the timeline land in the
same history, so you can undo either from either side. What an agent copies shows on
the clipboard in the header, and an agent's export asks for your approval first. See [Arrangement tools](/automation/for-agents.html#arrangement-tools)
for the tool list, [`sas arrangement`](/automation/cli-reference.html#arrange-a-song-sas-arrangement)
for the commands, and [the worked examples](/automation/examples.html#_15-arrange-a-song-from-your-scenes).
