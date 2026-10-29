---
sidebar: auto
---

![sorceress](/sas_sorceress.png)

## Core Features

### 🎵 Contract-Based Composing
Define a musical contract and generate within those constraints:

- Set **key, chords, BPM, and bars** to establish the musical framework
- **Gemini** generates MIDI that respects the contract
- **Lyria** generates audio for texture and atmosphere
- All tracks in a scene share the same contract for coherent compositions

### 🎼 Arrange Mode
Lay your scenes out as a full song, by hand, without leaving the app:

- **Compose on top, arrange at the bottom**: drop scenes onto a horizontal timeline, repeat them, and reorder them
- **Copies and linked copies**: edit one chorus and every linked chorus follows
- **Paint layers bar by bar**, including layers borrowed from other scenes, which keep their own scene's bus
- **Your real mix**: faders, pan and panel bus effects stay live while the song plays; only sound changes re-render

[Arrange Mode guide →](/arrange/)

### 🧩 Extensible Plugin SDK
All built-in panels run on the Plugin SDK. These are on by default:

- **Drums** - Drum-pattern MIDI with a built-in sample-based drum sampler
- **Instruments** - Pitched, polyphonic sample-based instruments
- **Synths** - MIDI generation played through Surge XT or any VST3/AU instrument
- **Bass** - One monophonic bassline from your description
- **Ensemble** - Two to six voices written together, for Strings, Horns or Winds
- **Arpeggiator** - A repeating arp pattern designed from your description
- **Pads** - The scene's chords voiced as sustained pads that rotate across Surge XT patches
- **Loops** - Audio loop and sample browser with time-stretching and effects

Turn these on in the plugins panel when you want them:

- **Stems** - Audio from text prompts, with optional stem splitting
- **Chat** - An assistant that builds and edits your scene from plain-language requests
- **Recorder** - Loop-aware microphone recording
- **Animate** - Movement over time: pumper, autopan, tremolo, trance gate, filter sweeps, risers, ducking and more
- **Mix Assets** - A palette of hits, risers and shots
- **Text2Voice** - Paste some text and hear it sung over your scene
- **Freesound** - Sounds from freesound.org that match the scene's key and BPM
- **Synth V** - Vocals sung through Synthesizer V Studio 2 Pro (needs Synth V and an installed voice): describe a section and get the words, the melody and the harmonies, from a backing choir to a vowel pad (see [Step by step](#step-by-step))

Upcoming plugin integrations: **Splice**, **ElevenLabs**, **live coding**, and **agentic prompting**.

### 🎤 Singing with Synth V

The **Synth V** panel sings through Synthesizer V Studio 2 Pro. Say what a section
should sing about, and Signals & Sorcery chooses how it is sung, writes the words,
composes a melody and harmonies that follow your scene's chords, and opens the take
in Synth V. Once you bounce it there, each voice lands on its own lane, where mixing,
effects, freeze and export work like on any audio track.

Think of it as an instrument as much as a singer. Out of the box it sings as a
**backing choir**: a few voices in block harmony on long held notes. It can also be
a lead, a chant, a narrator, a vowel pad or a vocal arpeggiator, and the
[Experiment](#experiment) dials take the voices somewhere no singer goes.

The panel is off by default. Turn it on in the plugins panel; it needs Synthesizer V
Studio 2 Pro and an installed voice.

#### Step by step

The panel shows one thing to do at a time. A step you have finished folds into a
single line: click the line to open that step again, and Esc takes you back to where
you are. ⌘Enter (Ctrl+Enter on Windows) runs the main button from anywhere in the panel.

1. **Describe.** One box asks *What should the voices sing about, and how?* One or two
   lines is plenty ("a lonely keeper, the ship that never came"). Press
   **✍ Write song**: it chooses the vocal setup, writes the words, composes the melody,
   fits the words to that melody syllable by syllable, and sings. Already have words?
   Click **I already have words** and type or paste them; the melody is composed for
   them as written.
2. **Hear it.** The [vocal setup](#the-vocal-setup) line, the words on the melody, and
   **Sing**. Sing opens the take in Synth V (and starts Synth V if it is not running).
3. **Refine.** Once there is a take, the **lyric sheet** shows the melody bar by bar,
   each syllable under its note with its stress. Per line you can lock it, edit it by
   hand, rewrite it alone with a note ("rhyme with fire"), or fit the melody to the
   line when it is a syllable or two off. Type in the hint box to rewrite the verse's
   unlocked lines on the same melody. **♪ New music** writes a new melody (it asks
   whether to adapt the words you have or keep them as they are), and
   **✍ Rewrite words** writes new words on the same melody. After any change the main
   button reads **↻ Re-render**. Every change is kept as a version: **Undo**, or pick
   one from the list. **as text** shows the plain words instead of the sheet. The
   [Experiment](#experiment) row is here too.
4. **Continue.** More verses: **+ Next verse** writes the next verse on the same
   melody, with new rhymes and the story moving on. See
   [Lyrics per verse](#lyrics-per-verse).
5. **Synth V.** The round trip: **Open in Synth V**, **Sync from Synth V** (reads back
   what you saved there: note edits, voices and new tracks), **Save + Sync**,
   **Import bounce**, the earlier bounces, **Auto-import** (each stem lands on its
   lane the moment Synth V bounces it) and **Reference mix in Synth V** (your scene
   bounced into the take, so you edit the singing against the beat). The
   **Bounce to Files** click in Synth V is yours: one per take.

Punctuation is phrasing: a comma, a line break or a full stop ends a phrase, and each
phrase is sung with a breath after it.

#### Lyric context

Above the steps, one line holds the **lyric context**: the documents behind the whole
song, such as a story, the world it happens in, or style notes. It reads like
*Lyric context: 3 docs · story bible ready · ~58k tokens*. Click **edit** (or
**add documents**) to manage them: paste a document, or give a link to a web page or a
shared Google Doc and press **Fetch & add** (the app asks you once per site). You can
rename, replace, fetch again or remove each document. The lyric context belongs to the
project, so every Synth V panel in every scene writes from it, and it travels with
the project file.

A short lyric context is sent whole with every write. A long one is read once into a
**story bible**: the people and how they speak, the places, the rules of the world,
the motifs and the tone, plus a line for each part of your documents. Each write then
uses the bible and the few passages that matter for that section. Reading a long
context costs a model call, so the panel asks first: *Build a story bible?* shows the
size and the cost, with **Build story bible** or **Not now** (a short digest and the
matching passages instead). Your answer holds until a document changes, and you can
build the bible later from the lyric context. A document can be up to 200,000
characters, with up to 24 documents and 300,000 characters in all.

#### The vocal setup

How a section is sung is one line, for example
*Backing choir · simple · Choral · 3 voices · unison · AABB · held · ~0.9 syl/s · felt pulse ~70 (half-time) · C4-C5 · compose*.
It is proposed from your description; hover the line for the reason. Click **edit** to
open the drawer. Anything you set there is pinned (📌) and kept, and the rest follows
the description: **↻ propose** proposes again around your pins, and **unpin all** hands
everything back.

- **Role**: what the voice is in the section. **Backing choir** is the default: three or four voices in block harmony on long held notes that move with the chords, singing a few repeatable words. **Lead** sings a tune whose words carry the section, **chant** recites over a drone, and **narrator** is speech-like, one or two voices. Two roles are instruments: a **vowel pad** holds the chords on vowels alone (ah, oh, oo by default; change them under **Vowels**), and a **hocket** is a vocal arpeggiator, one syllable per note dealt across four to six voices on a fast grid. A new role needs ♪ New music.
- **Melody**: **simple** by default (a few pitches per phrase, moving by step within a fifth, a short idea repeated) or **ornate**.
- **Pace**: how densely the words sit, in syllables a second whatever the tempo: **held** (one syllable per note, like a choir), **slow**, **medium**, **fast** or **triplet**.
- **Felt pulse**: the beat a listener taps, read from the scene's drums every time. A snare or clap on beat 3 only reads as half-time, on 2 and 4 as straight, on every off-beat as double-time. Audio drum loops and samples count as well as MIDI drums; while the song is playing, the audio cannot be measured, so the MIDI drums decide for now. Hover it to see which tracks were read, or pin it to choose yourself.
- **Range**: the band the lead sings in. The default is **C4-C5**; pick a voice from soprano to bass, or **Custom…**.
- And **Preset**, **Harmony**, **Voices** (at least one harmony voice unless you ask for a solo), **Delivery**, **Rhyme**, and the melody source: **Compose melody**, or sing the notes of a MIDI track in the scene.

#### Experiment

The **Experiment** row in the Refine step holds extreme voice dials, for playing the
vocal synth as an instrument rather than a stand-in for a singer:

- **Formant**: the size of the body, from giants to chipmunks.
- **Strain**: from slack to pushing hard.
- **Air**: breath in the voice, up to a whisper.
- **Wobble**: vibrato, from slow and deep (seasick) to a fast buzz; the centre leaves the voice as it is.
- **Glide**: how long each note takes to reach its pitch, up to long swoops.
- **Drift**: a random walk around the pitch.

Each dial has a **shape**: steady, rising, falling, waves (set the length under
**Waves**, in bars) or random. **Spread** makes the voices differ from each other,
**Tuning** nudges every note to quarter tones or to just intonation against the chord,
and **rap** gives every note Synth V's rap timing. The presets are **Giants**,
**Chipmunks**, **Whisper**, **Seasick**, **Wander**, **Quarter tones** and **Rap**.
**Dice** rolls random extremes and shows the seed, so a happy accident sings the same
way again; **Keep** keeps the roll and **Reset** goes back to neutral.

Press **Mangle** to sing with the dials: a new take opens in Synth V, and the one
before it stays under the earlier bounces. The words, the melody and the vocal setup
are untouched, and with every dial at neutral the take is written exactly as before.

#### Lyrics per verse

Write the words as verses: leave a **blank line** between them, or start each with a
line such as `[Verse 2]` (header lines are never sung). **Sing** then makes **one take
per verse, all on the same melody**, in one Synth V project and one bounce: each
verse's words on its own lanes, named **V1 Lead**, **V2 Lead** and so on (harmonies
included). The verse tabs above the sheet pick the verse you are working on;
**✍ Rewrite words** and the hint box change only that verse.

The takes form a set of alternatives, so in [Arrange mode](/arrange/#takes) **each
section sings its own verse** by its position: the first placement of the scene sings
verse 1, the second sings verse 2, with nothing to set. The verse tabs say which
placement each verse plays on, and warn when a verse has no placement yet. Right-click
a section and open **Take ▸** to pin a different verse.

- The verses times the voices, plus the scene's other Synth V lanes, must fit in 16 lanes. If they don't, Sing refuses before anything is created and gives the numbers: "3 verses × 6 voices = 18 lanes, but this scene has room for 16: use fewer verses or voices."
- One verse is a single take, and its lanes carry no V1, V2 prefix.

#### Song lyrics

Once the scene is placed in the arrangement, its words belong to the song. Each verse
tab is one placement of the scene, labelled by its section, and the arrangement's
[Lyrics tab](/arrange/#lyrics) shows and edits the same words. A **Song:** line shows
the song's description. The first time the song takes a scene over, the verses you
wrote in the panel move into the song's empty sections; sections that already have
words are left alone, so nothing is overwritten. A scene that is not in the song keeps
its words in the panel.

### 🎧 Audio Output

- **One stereo output** for everything: built-in audio, headphones or any interface
- Follows your system output device, or stays on the one you choose
- Pick the channel pair on multi-output interfaces, and set the buffer size
- **Master FX** for your monitoring (room correction, headphone virtualization), never printed to exports

[Audio Output guide →](./audio-routing.md)

### 🎹 Instrument Support

- **Surge XT** ships as the default synth with bundled presets
- **Any VST3/AU instrument** can be loaded per track via the instrument selector
- The synth generator picks appropriate Surge XT patches based on sound descriptions
- Custom instruments preserve their state across scenes and project save/load

[How to load your own VST3/AU instruments →](/custom-sounds/#load-your-own-instrument-plugins-vst3-au)

### ❄ Freeze

Free up CPU by turning a track's instrument and effects into audio:

- **The track ❄** on a track row renders that track to a stem and plays it instead of the live instrument. Your mixer (volume, pan, mute, solo) stays live. Click it again to unfreeze.
- **The scene ❄** in the scene list freezes every track in that scene, and **Freeze ALL** (the ❄ in the Scenes title bar) freezes the whole project. While a batch runs, their counts tick up one track at a time (0/7, 1/7 … 7/7).
- Tracks with an instrument (MIDI tracks) can freeze; audio tracks such as loops and stems can't.
- Change a frozen track's sound and it unfreezes itself so you hear the edit; a note tells you why. Unfreezing brings back the instrument and effects exactly as they were, including each plugin's Dry/Wet setting.
- Changed an instrument inside its own plugin window? The app can't see that, so use **↻ Force re-render stem** in the track's drawer.
- Playback stops while a stem renders.

### 🗂️ Bring Your Own Sounds

- **Import your own sample libraries**: drop your WAV drum kits and instrument
  samples into the drum and instrument generators; they sit alongside (or replace)
  the factory packs and feed generation and shuffle automatically
- **Load your own instrument plugins**: put any VST3/AU synth or sampler on a synth track
- Imports are kept separate from shipped packs, copied safely, and easy to back up

[Custom Sounds guide →](/custom-sounds/)

### 🔄 Scene-Based Composition

Organize your music into scenes:
- Group tracks into logical units that share a contract
- Duplicate scenes to try variations
- Arrange scenes into a full song in [Arrange mode](/arrange/)
