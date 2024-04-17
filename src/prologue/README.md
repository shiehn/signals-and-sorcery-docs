---
sidebar: auto
---

![prologue](/sas_prologue.png)

## What is Signals & Sorcery?

Signals & Sorcery is a platform for creating, sharing, and consuming machine learning operations.  A developer can write a python function, publish it, host it, and have it consumed from native applications such as Ableton, Figma, and Chrome Extensions.

## Who is this for?

- Application power users who want to extend their applications with self-hosted SOTA AI operations. ex. META releases a new audio generation model and a user wants to use it in their DAW immediately.
- Developers creating Colab/Jupyter notebooks who want to use them in the context of a native application.  ex. A developer creates a new audio stem splitting model and wants to use it in int the context of their DAW.

## How does it work?

Signals & Sorcery is composed of three core components. 
- A network discovery server.  Essentially a system that brokers data transfer between the `Crucible Plugins` and the `Rune AI's`.
- A Python3 pip package `runes-cli`. The package is used to package, invoke and publish a python functions as `Rune AI's`.
- Native plugins called `Crucible Plugins`.  The plugins are essentially embedded web-forms.  When a Rune is connected to a `curcible-plugin` an interface this is generated from the `Rune AI's` function signature. The user can call the Runes function and pass data to-and-fro from the plugin to the Rune. In the case of  `Crucible-Audio` the user can drag/drop audio/midi files from the DAW into plugin, which is then transferred to the `Runes` compute instance.
