---
sidebar: auto
---

![Patch Bay Two](/sas_patch_bay_two.png)

# Crucible Plugins

## Crucible Web

[CrucibleWeb](http://dawnet.tools) is the best place to get started. Connect, test, and execute your Runes in the browser. 

<iframe width="100%" height="400px" src="https://www.youtube.com/embed/K65jKKUyAvQ?si=-4e-xfKmKqjKR4BI" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Crucible Audio

Crucible-Audio is a VST plugin that executes remote python functions.  As an example, a user may want to perform `audio stem splitting` on a remote server.  Using the [DAWNet Client](/client/) they can send data from the DAW to the remote function, and back again.

<video width="100%" controls>
  <source src="https://storage.googleapis.com/docs-assets/dawnet-intro.mov" type="video/mp4">
  Your browser does not support the video tag.
</video>

![crucible-plugins](/sas_crucible.png)

## Installation

[Download](https://storage.googleapis.com/docs-assets/DAWNetInstaller_v0_8_3_universal.zip) the zip package installer.  Run it.  By default, the `.vst3` file should end up at this location: `/Library/Audio/Plug-Ins/VST3`.  Note: some people prefer plugins in their user directory: ` ~/Library/Audio/Plug-Ins/VST3`.  Move it if you wish.

::: warning
NOTE: The plugin is in an active development, pre-alpha state.  It has only been tested on Ableton 11 on MAC M1.
:::

## Usage

- Once the plugin becomes available in the DAW, add it to a track. 
- Next, you will need to connect it to a remote compute instance.  The easy way to get started is to use a pre-made [DAWNet remote](/remotes/) and host it in Google CoLab.
- We can now connect the plugin to the `DAWNet Remote`.  To do this open the plugin and generate/copy a token from the top bar in the GUI.  
- Paste this token in the `DAWNet Remote` and run it.  
- Within a few seconds the plugin and remote should "discover" each other via the discovery server.
- At this point you should see a representation of the remote function and are able to run it

::: tip
To add an audio file to the plugin from Ableton `opt + mouse drag` the file into the plugin
To add an output file from the plugin to Ableton `opt + mouse drag` the icon found in the results view, on the right of the file name.
:::
 
## Crucible Video
(coming soon ...)

## Crucible Design (FIGMA)
(coming soon ...)




