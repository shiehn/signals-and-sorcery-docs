---
sidebar: auto
---

![runes_cli](/sas_runes_cli.png)

# Runes CLI

## What is it?
The `RUNES CLI` is a command line tool for building, running and publishing Elixirs to the Vault. 

## Requirements:
- ensure Python >= 3.x is installed
```python
python --version
```

- ensure Pip is installed
```python
pip list
```

- ensure [Docker](https://www.docker.com/) is installed
```python
which docker
```

- (if you plan to run GPU dependent functions) ensure [Nvidia Docker Extention](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html) is installed

### Installation:

```python
sudo pip install -U runes-cli
```

### Usage:

```python
runes
```

## Usage Examples:

#### As a developer use the runes-cli to:

- build your CoLab/Jupyter notebook (`.ipynb` file) into an Elixir
- publish your build Elixir to the Vault

#### As an end-user use the runes-cli to:

- search for & install Elixirs listed in the Vault
- run Elixirs on your local machine or a remote server

<iframe width="100%" height="400px" src="https://www.youtube.com/embed/K65jKKUyAvQ?si=-4e-xfKmKqjKR4BI" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>




