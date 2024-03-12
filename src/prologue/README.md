![prologue](/sas_prologue.png)

## What is Signals & Sorcery?

Signals & Sorcery is a platform for creating, sharing, and consuming machine learning operations.  A developer can write a python function, publish it, host it, and have it consumed from native applications such as Ableton, Figma, and Final Cut Pro.

## Who is this for?

- Application power users who want to extend their applications with self-hosted SOTA AI operations. ex. META releases a new audio generation model and a user wants to use it in their DAW immediately.
- Developers who create Colab/Jupyter notebooks and want to use them in the context of a native application.  ex. A developer creates a new audio stem splitting model and wants to use it in their DAW.

## How does it work?

Signals & Sorcery is composed of three core components. 
- A network discovery server.  Essentially a system that brokers data transfer between the `Crucible Plugins` and the `Elixir AI's`.
- A Python3 pip package `runes-cli`. The package is used to packaging, invoke and publish a python functions as `Elixir AI's`.
- Native plugins called `Crucible Plugins`.  The plugins are essentially a web-forms.  An interface which is generated from the `Elixir AI's` function signature.  In the case of  `Crucible-Audio` the user can drag/drop audio/midi files from the DAW into plugin, which is then transferred to the `Elixirs` compute instance.
