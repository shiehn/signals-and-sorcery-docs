## How do I try it?
  
1. Download the plugin installer. Run it.
2. Choose a community [remote](/remote-compute/), AKA Google Colab notebook. Load it in Colab.    
3. Open [https://www.ableton.com/](Ableton).  Find the plugin in Ableton at `Plugin-Ins -> SignalsAndSorcery -> DAWNet.vst3`.  (If you don't see the plugin go to `options -> preferences -> "Use VST3 plugin system folder" -> rescan`)
4. Generate & Copy a "token" from the DAWNet VST interface (top bar).  
5. Paste the "token" into Colab.  Find the token variable (called something similar to `dawnet_token`).  Set the value.
6. At this point the Plugin and the Colab server should have `found` each other via the underlying web-socket server.
7. If a Python function was registered it will be translated into a web form/interface in the plugin.  Files, e.x Audio & MIDI files can be dragged from the host DAW's timeline into the plugin.  The plugin will handle transferring files and other input params over the network to the remote compute.    
