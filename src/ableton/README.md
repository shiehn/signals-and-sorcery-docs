---
head:
  - - meta
    - name: description
      content: Signals & Sorcery integrates with Ableton Live — export any generated scene straight into Live's Session view as audio + MIDI clips at the right tempo. One click in S&S, one right-click in Live. The companion extension installs itself.
  - - meta
    - name: keywords
      content: Ableton, Ableton Live, Ableton integration, export to Ableton, Ableton Session view, Ableton extension, MIDI to Ableton, generative music Ableton, Signals and Sorcery Ableton
---

# Ableton Live Integration

Signals & Sorcery exports any scene you generate **straight into Ableton Live's
Session view** — each layer arrives as audio **and** editable MIDI, at the right
tempo. **One click in S&S, one right-click in Live.** No file wrangling, no
choosing folders, nothing to install by hand.

## What you get

When you send a scene, it appears as a **row of clips** in Session view:

| S&S layer | In Ableton |
|---|---|
| Drums / Instruments / Synths | a rendered **audio** clip **and** a **MIDI** clip (no instrument — drop your own) |
| Loops / Stems | a rendered **audio** clip |

The audio is S&S's exact sound (mix-ready); the MIDI is the raw notes, so you can
re-voice any part with your own instruments and racks. Export a single scene, or
your whole project as one Session row per scene.

## Requirements

- **Ableton Live 12 Suite**, **beta build 12.4.5 or later** — Ableton Extensions
  run only in the Suite beta. [Join the Ableton beta »](https://www.ableton.com/en/beta/)
- macOS (the integration is macOS-first today).

## Setup — nothing to install by hand

S&S ships the Ableton extension and **installs it for you.** The first time you
run S&S with Ableton present, it places the *Import S&S scene* extension into
Live's extensions folder automatically — no files to copy, no folders to pick.

::: tip First time only
If Ableton was already running, **quit and reopen it once** so Live loads the
extension. You can confirm it under **Live → Settings → Extensions**.
:::

## Use it

1. In **Signals & Sorcery**, generate or open a scene, then click **Export to
   Ableton** — the ▦ button on a scene, or **Project menu → Export to Ableton…**
2. In **Ableton**, switch to **Session view**, **right-click a scene** (the launch
   buttons in the rightmost column) and choose **Import S&S scene…**
3. Your scene materializes — tempo set, one row of clips, audio + MIDI ready to play.

You never pick a save location: S&S hands the scene directly to the extension,
which imports your most recent export.

## Troubleshooting

- **No "Import S&S scene…" in the menu?** Restart Ableton once (the extension
  loads at launch), and confirm you're on **Live 12 Suite beta 12.4.5+**.
- **"No S&S bundle found"?** Click **Export to Ableton** in S&S first, then run the
  import in Live.
- **Right-click where?** On a **scene** in Session view (the launch buttons in the
  rightmost column) — not on an empty clip slot.
