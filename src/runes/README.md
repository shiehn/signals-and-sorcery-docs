---
sidebar: auto
---

![runes](/sas_elixir.png)

# Runes

## What are they?
Runes are special python scripts that can be distributed by the `Signals & Sorcery` registry (aka the [VAULT](/vault)).  Runes discovered and run from within a Crucible plugin.  They can be hosted locally, on a server, or in Google Colabs.  They can be used to execute arbitrary code, or to wrap existing projects. 

## How do I use a Rune?

There are multiple ways to consume Runes.  Lets start with the web plugin.

1. Open the [Crucible Web](https://dawnet.tools/) plugin in a browser.
2. Copy the "token" from the top right of the plugin.
3. Install the Runes CLI. See [Runes-CLI]/runes-cli/ for details.  TLDR: `pip install runes-cli` 
4. Run the runes-cli in a terminal with the key word `runes`.  Select `tokens`, then `add`, then paste the token copied from the plugin.
5. Run a pre-made Rune. From the runes-cli, select `runes (run or manage published runes)` then select an `available rune` from the list. I recommend starting with a rune that does not require a GPU. (look for CPU) Try the `Rune Template` for starter.
6. After the Rune has has started, you can interact with if from the Crucible Web plugin.  Go back to the plugin and select the `Connected Runes` tab.  You should see the Rune you started.  Click on the Rune to interact with it! 

# Elixir Client

The Elixir client is a Python package that enables you to write python functions, package the functions and expose them to Crucible plugins.  It is a simple wrapper around the Signals & Sorcery API.


## How do I create a Rune?
Creating your own Rune is easy.  Just copy and modify the [Rune Template](https://github.com/shiehn/dawnet-remotes/blob/main/DAWNet_Remote_template.ipynb).  You  will see a commented section indicating where to write your custom code.  You can write any Python3 code you wish.  

::: danger
NOTE: The system does not guarantee any security.  Do not expose sensitive data in your remotes.
:::