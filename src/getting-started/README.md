---
sidebar: auto
---

![getting-started](/sas_getting_started.png)

# Getting Started (end-user web app workflow)
## How do I use it?

1. Go to [Crucible Web](https://dawnet.tools)
2. Copy or generate a new Token
3. Launch a Google Colab. With the generated Token
4. Open & use the `Connected Rune` in the Crucible Web app


# Getting Started (end-user music workflow)
## How do I use it?
 
<video width="100%" controls>
  <source src="https://storage.googleapis.com/docs-assets/getting-started-video.mov">
  Your browser does not support the video tag.
</video>
  
1. Download the plugin installer. Run it. 
2. Open [https://www.ableton.com/](Ableton).  Find the plugin in Ableton's plugin menu: `Plugin-Ins -> SignalsAndSorcery -> DAWNet.vst3`.  (If you don't see the plugin go to `options -> preferences -> "Use VST3 plugin system folder" -> rescan`)
![Step 1&2](https://storage.googleapis.com/docs-assets/gettingstarted2.png)
   
3. Open the plugin.  The home view of the plugin lists remade Google Colabs.  Click on a Colab to open it. 
4. From the plugin copy the "token" from top right of DAWNet VST interface.
![Step 3&4](https://storage.googleapis.com/docs-assets/gettingsstarted4.png)
   
5. Paste the "token" into Colab.  Find the token variable (called something similar to `dawnet_token`).  Set the value.
   ![Step 5](https://storage.googleapis.com/docs-assets/gettingstarted5.png)
   
6. At this point the Plugin and the Colab server should have `found` each other via the underlying web-socket server.
7. If a Python function was registered it will be translated into a web form/interface in the plugin.  Files, e.x Audio & MIDI files can be dragged from the host DAW's timeline into the plugin.  The plugin will handle transferring files and other input params over the network to the remote compute.    
   ![Step 7](https://storage.googleapis.com/docs-assets/gettingstarted7.png)
   

## Workflow example

In this video I demonstrate how to use a [Crucible plugin](/crucible-plugins) to perform `audio style transfer` powered by Meta's [MusicGen](https://ai.meta.com/resources/models-and-libraries/audiocraft/) project.

<video width="100%" controls>
  <source src="https://storage.googleapis.com/docs-assets/style-tranfer-demo.mov">
  Your browser does not support the video tag.
</video>


![getting-started](/sas_patch_bay.png)


# Getting Started (developing an AI Rune)

## Create a Rune
1. Launch the Rune template in either a Google Colab or as a Jyuptyer notebook.
2. Write your function in the notebook. See the [Rune](/runes/) section for more details.
3. Test your function by connecting it to a Crucible plugin.  See the [Crucible](/crucible-plugins/) section for more details

## Publish a Rune to the Vault
1. Install the [RUNES CLI](/runes-cli/)
2. Build your `.ipynb` file into an Rune using the `runes-cli`
3. Publish your Rune to the Vault using the `runes-cli`