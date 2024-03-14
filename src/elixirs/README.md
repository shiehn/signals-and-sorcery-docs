---
sidebar: auto
---

![elixirs](/sas_elixir.png)

# Elixirs

## What are they?
DAWNet remotes are python scripts that are registered with the DAWNet discovery server.  They are triggered remotely by the DAWNet plugin.  They can be run locally, on a remote server, or in Google Colabs.  They can be used to execute arbitrary code, or to wrap existing projects. 

## How do I use them?

1. Install the [DAWNet plugin](/getting-started/#installation).
2. Generate & Copy a "token" from the DAWNet VST interface (top bar).
3. Choose a colab below and follow the link. 
4. Open the colab in Google Colab by clicking the "Open in Colab" button.
5. Paste the "token" into Colab.  Find the token variable (called something similar to `dawnet_token`).  Set the value.
6. At this point the Plugin and the Colab server should have `found` each other via the underlying web-socket server.
7. Fill in values & files in the colab form.  Click "Run" in the colab form.
 
## Google Colabs

Find premade Elixirs here: [Google CoLabs](/vault/#google-colabs)

# Elixir Client

The Elixir client is a Python3 library that allows you to create and run Elixirs from your local machine.  It is a simple wrapper around the DAWNet API.  It is useful for creating and testing Elixirs locally before deploying them to a remote server.  It is also useful for creating Elixirs that are not intended to be run in a remote server.  For example, you may want to create an Elixir that runs on your local machine, but is triggered by a remote DAWNet plugin.


## How do I make my own?
Creating your own Elixir is easy.  Just copy and modify the [DAWNet Remote Template](https://github.com/shiehn/dawnet-remotes/blob/main/DAWNet_Remote_template.ipynb).  You  will see a commented section indicating where to write your custom code.  You can write any Python3 code you wish.  

::: danger
NOTE: The system does not guarantee any security.  Do not expose sensitive data in your remotes.
:::