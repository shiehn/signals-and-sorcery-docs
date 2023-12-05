# What is DAWNet?

DAWNet is a way to execute Python code hosted in the cloud.  It's a plugin, a server, and a pip package. &&&&&&&&&&&& It    The code is standard, arbitrary Python3 functions.  The [dawnet-client](/client/) is used to register, call functions, and send data back and forth from the DAW to the remote compute.  

## How does it work?

server .. blah .. blah ...

## How do I try it?
  
1) Download the plugin. Install it.
2) Choose a community `remote`, AKA a Google Colab notebook. Load it in colab.    
3) Generate & Copy a "token" from the DAWNet VST interface (top bar).  
4) Paste the "token" into Colab.  Find the token variable (called something similar to `dawnet_token`).  Set the value.
5) At this point the Plugin and the Colab server should have `found` each other via the underlying web-socket server.
6) If a Python function was registered it will be translated into a web form/interface in the plugin.  Files, e.x Audio & MIDI files can be dragged from the host DAW's timeline into the plugin.  The plugin will transfer the files  

![Mushroom](/mush_one.png)


[Link Text](https://storage.googleapis.com/docs-assets/dawnet-logo.png)