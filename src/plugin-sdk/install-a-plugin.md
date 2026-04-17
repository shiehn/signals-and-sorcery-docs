---
sidebar: auto
---

# Install a Plugin

If you just want to **use** an existing plugin (like the built-in Chat or
Texture plugins, or one you found on GitHub), this page is for you. If you
want to **build** a plugin, head to
[Getting Started](./getting-started.md) instead.

## The easy way — in-app "Add Plugin" button

Signals & Sorcery has a built-in installer. You don't need the terminal.

1. Open the app.
2. Go to **Settings → Plugins**.
3. Click **Add Plugin**.
4. Paste a GitHub URL, e.g. `https://github.com/shiehn/sas-texture-plugin`.
5. Click **Install** — the app runs `git clone --depth 1` for you and drops
   the plugin in the right folder.
6. Wait for *"Plugin installed — restart the app to activate"*.
7. **Restart the app.**

The plugin then appears in **Settings → Plugins** under **External** (or
**Built-in** if it shipped with the app). Flip its toggle to enable it —
the app will prompt you to restart one more time for the change to
propagate to the editor.

::: tip Why restart?
The editor's accordion panels are hardcoded at startup. Enabling or
disabling a plugin mid-session updates the registry, but the editor UI
only picks up the change on the next launch. The in-app modal handles the
restart for you.
:::

## The manual way — clone into the plugins folder

Some users prefer to manage plugin source code directly. In that case:

### 1. Find your plugins folder

The path depends on your OS:

| OS      | Plugins folder |
|---------|----------------|
| macOS   | `~/Library/Application Support/signals-and-sorcery/plugins/` |
| Windows | `%APPDATA%\signals-and-sorcery\plugins\` |
| Linux   | `~/.config/signals-and-sorcery/plugins/` |

::: tip Shortcut
In-app, go to **Settings → Plugins → Open Folder**. The app reveals the
correct folder in Finder / Explorer / your file manager without you
having to remember the path.
:::

### 2. Clone the plugin repo

```bash
# macOS example — adjust for your OS
cd ~/Library/Application\ Support/signals-and-sorcery/plugins/
git clone https://github.com/shiehn/sas-texture-plugin.git @signalsandsorcery/texture-plugin
```

Use the plugin's own `id` from its `plugin.json` as the destination folder
name (e.g. `@signalsandsorcery/texture-plugin` — scoped IDs create a
nested directory). If you clone under a different name the host can still
find it, but matching IDs keeps things tidy.

If the repo doesn't ship a pre-built `dist/` folder, you'll also need:

```bash
cd @signalsandsorcery/texture-plugin
npm install
npm run build
```

Most published plugins (including the built-ins) already ship `dist/` —
check the repo's README.

### 3. Restart the app

Plugins are discovered on startup only. After restart, the plugin appears
in **Settings → Plugins**.

## Worked example: install `sas-texture-plugin`

This is the texture-generation plugin that ships disabled by default.
Here's how a user turns it on end-to-end.

1. In the app: **Settings → Plugins**. Find **Texture** under **Built-in**.
   It's there but shown as *disabled*.
2. Click the toggle to enable it.
3. A **Restart Required** modal appears. Click **Restart Now**.
4. The app relaunches. Open **Settings → Plugins** again — Texture is now
   **active**.
5. In the main workstation, the **Texture** accordion section now renders.
   Open it and click **Generate Texture** on a scene with a contract.

::: warning Built-in plugins cannot be removed
You can toggle them off, but the **Remove** button is only available for
external (user-installed) plugins.
:::

## Enable / disable an already-installed plugin

Toggles for every plugin live in **Settings → Plugins**. The app persists
your choice to its DB — if you disable a plugin, it stays disabled across
restarts until you toggle it back on.

The **first** toggle of any session opens a **Restart Required** modal.
Subsequent toggles in the same session show a persistent banner at the
top of the plugins panel instead, so you can toggle multiple plugins
before restarting once. Both the modal and the banner have a
**Restart Now** button that relaunches the app for you.

## Remove an external plugin

External plugins (installed via GitHub URL or manual clone) show a
**Remove** button next to them. Clicking it:

- Deletes the plugin's folder from disk.
- Removes its DB row.
- Requires a restart to fully unload the module from memory.

Built-in plugins have no Remove button — they ship with the app.

## Troubleshooting

**"I installed a plugin and nothing appeared."**
- Did you restart the app? Plugins are only discovered at startup.
- Did the plugin land in the right folder? Confirm via **Open Folder** —
  the directory should contain a `plugin.json` at its root (or one level
  deeper for scoped IDs like `@user/name`).
- Did the plugin's `dist/` build? Look for `dist/index.js` or similar. If
  missing, `cd` into the folder and run `npm install && npm run build`.

**"The plugin shows as 'failed' in Settings → Plugins."**
- Hover over the error message in the plugin row. Common causes:
  - The plugin's `minHostVersion` is newer than your Signals & Sorcery
    version — update the app.
  - The plugin requires a capability (e.g. network access) not declared
    in its `plugin.json`.
  - The plugin's entry module throws during `activate()`. Check the main
    process log (`output.log` if you started with redirect, otherwise the
    Electron DevTools console).

**"The plugin shows as 'incompatible'."**
- Update Signals & Sorcery to a version that satisfies the plugin's
  `minHostVersion`, or install an older version of the plugin.

**"I toggled a plugin off but it's still visible in the editor."**
- The editor picks up plugin state at startup. Use **Restart Now** from
  the modal or the banner at the top of the plugins panel.

**"The plugin's folder name uses `@scope/name` — is that right?"**
- Yes. Scoped IDs create a nested folder: `plugins/@scope/name/`. Both
  scoped and unscoped layouts work; pick whichever matches the plugin's
  `id` in its manifest.

## See also

- [Getting Started](./getting-started.md) — build your own plugin
- [API Reference](../plugin-sdk/README.md#pluginhost-api--complete-method-reference) — what plugins can do
- [Tutorial](./tutorial.md) — build a Euclidean Rhythm plugin step-by-step
