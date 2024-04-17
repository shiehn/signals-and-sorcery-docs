---
sidebar: auto
---

![Sorceress Two](/sas_sorceress_two.png)

# Glossary Of Terms

## Crucible Plugins

[Crucible plugins](/crucible-plugins) are a series of native plugins that expose the Rune AI's functionality in domain specific application. ex:
- Crucible-Sound for Ableton
- Crucible-Image for Figma (coming soon)
- Crucible-Web for Web Browsers (coming soon)
- Crucible-Video for Final Cut Pro (coming soon)

## Docker

- [Docker](https://www.docker.com/) is a platform that enables developers to package, distribute, and run applications in isolated environments.  Signals & Sorcery uses Docker to package and distribute AI Elixirs.
- Images: Blueprint templates used to create one or more containers.
- Containers: executable software packages that include everything needed to run a piece of software

## Rune AI's

- Runes are a collection of machine learning operations that can be run on remote compute instances.  They are packaged and distributed as Docker containers.
- When run, they automatically connect to the Signals & Sorcery server.
- Users can run Runes from the Crucible plugins.

## GPU & CPU

- CPU: Central Processing Unit.  The main processor in a computer.  Almost all computers have a CPU.
- GPU: Graphics Processing Unit.  A specialized processor user for graphics and machine learning.  Not all computers have a GPU.  *NOTE: Many Elixirs require a GPU to run.*

## Guild

- Signals & Sorcery community [forums](/guild).  A place to ask questions, share ideas, and get help.

## Runes CLI

The [Runes CLI](/runes-cli) is a python command-line-interface used to manage [Rune AI's](/runes) on MAC, LINUX and desktops and servers

![glossary](/sas_glossary.png)

## Vault

The [Vault](/vault) is an [Rune AI's](/runes) registry.  It is a place to store and share Elixirs with other users.

## Virtual Machines

A virtual machine or VM in this context is a remote server usually running on a public cloud like Amazon Web Services, Google Cloud, or Microsoft Azure.  Running Elixirs on VMs is an ideal setup for long-running setups.  *NOTE: Many Elixirs require a GPU to run.*