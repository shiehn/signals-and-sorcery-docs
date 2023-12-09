---
sidebar: auto
---

# DAWNet Remotes

## What is are they?
DAWNet remotes are python scripts that are registered with the DAWNet discovery server.  They are triggered remotely by the DAWNet plugin.  They can be run locally, on a remote server, or in Google Colabs.  They can be used to execute arbitrary code, or to wrap existing projects. 

## How do I use them?

1. Install the [DAWNet plugin](/getting-started/#installation).
2. Generate & Copy a "token" from the DAWNet VST interface (top bar).
3. Choose a colab below and follow the link. 
4. Open the colab in Google Colab by clicking the "Open in Colab" button.
5. Paste the "token" into Colab.  Find the token variable (called something similar to `dawnet_token`).  Set the value.
6. At this point the Plugin and the Colab server should have `found` each other via the underlying web-socket server.
7. Fill in values & files in the colab form.  Click "Run" in the colab form.
 
## Google Colabs (TODO)

>Name: **Demucs Stemify**<br/>
Description: A wrapper for the OS Demucs Stemifier.  Send an audio file and get stems back.<br/>
Link: [DAWNet Demucs](https://github.com/shiehn/dawnet-remotes/blob/main/DAWNet_Remote_Demucs.ipynb)

>Name: **MusicLM**<br/>
Description: A wrapper for Googles MusicLM project<br/>
Link: (TODO)

>Name: **MusicGen**<br/>
Description: A wrapper for Meta's MusicGen project.  Send a text description and get back audio.<br/>
Link: [MusicGen](https://github.com/shiehn/dawnet-remotes/blob/main/DAWNet_Remote_MusicGen.ipynb)

## Virtual Machine / GPU (TODO)

(TODO) explain setting up a gpu somewhere ...

## Local GPU (TODO)

(TODO) explain local gpu ...

## How do I make my own?
Creating your own remote is easy.  Just copy and modify the [DAWNet Remote Template](https://github.com/shiehn/dawnet-remotes/blob/main/DAWNet_Remote_template.ipynb).  You  will see a  commented section indicating where to write your custom code.  You can write any Python3 code you wish.  

::: danger
NOTE: The system does not guarantee any security.  Do not expose sensitive data in your remotes.
:::