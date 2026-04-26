# Documentation Deployment Guide

> **Deployment is handled by CI.** Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds VuePress and publishes the site at [signalsandsorcery.com](https://signalsandsorcery.com). **Do NOT run `npm run deploy`** — that script is legacy and bypasses CI.

This guide covers how the docs source is structured and how new app releases update the download links on the site.

## Architecture Overview

The documentation system uses two Git repositories:

1. **signals-and-sorcery-docs/** (this repo) — VuePress source files. **The single source of truth.**
   - Contains markdown documentation in `src/`
   - Static assets, including `downloads.json`, in `src/.vuepress/public/`
   - Build configuration in `src/.vuepress/`
   - **Push to `main` here → GitHub Actions builds and deploys the site**

2. **dawnet-docs-gh-pages/** — Built HTML output, served by GitHub Pages
   - Written exclusively by the `Deploy Docs` GitHub Action via deploy key
   - **Never edit files here directly** — they are overwritten on the next deploy
   - **Never push from a script directly** — the release pipeline pushes to `signals-and-sorcery-docs` source only

## Download Link System

### How It Works

Download links are **hardcoded directly in markdown**, NOT dynamically loaded via JavaScript.

**Location:** `src/getting-started/README.md`

```markdown
#### 2. Download Signals & Sorcery

Choose the version for your system:

- **[Apple Silicon Mac (M1/M2/M3/M4)](https://storage.googleapis.com/docs-assets/signals-and-sorcery-0_12_0-arm64.dmg)** - Download for Apple Silicon Macs (v0.12.0)
- **Intel Mac** - Coming soon

**Note:** The app is signed and notarized by Apple for security.
```

### Why Hardcoded Links?

- **Reliable:** No client-side JavaScript that can fail to load
- **SEO-friendly:** Links visible to search engines and crawlers
- **Simple:** Direct markdown links, no complex fetching logic
- **Fast:** No additional HTTP requests on page load
- **Auto-updated:** The release script uses regex to automatically update these links

### About `downloads.json`

`downloads.json` lives at `src/.vuepress/public/downloads.json` and is published to the site root by the VuePress build. It is **not** used by the website for display — the hardcoded markdown links are. It exists as an API surface for the desktop app (version checks, release history, file sizes).

The release script writes this file in source. CI publishes it on the next deploy. The release script also uploads a copy to `gs://docs-assets/downloads.json` so the desktop app can fetch a stable URL without going through the docs site.

### Avoid Dynamic Loading for Display

❌ **DO NOT** use this pattern for the main download link:
```html
<div id="download-links"><p>Loading download links...</p></div>
```
With JavaScript fetching `downloads.json` — this approach is unreliable in the VuePress build system and not needed since the release script auto-updates the markdown.

## Releasing a New App Version

The release process is **fully automated** via the release script in `sas-assistant`. Run:

```bash
cd /Users/stevehiehn/sas-platform/sas-assistant

# For minor version bump (0.12.0 → 0.13.0)
npm run release

# Or specify version type
npm run release:major  # 0.12.0 → 1.0.0
npm run release:minor  # 0.12.0 → 0.13.0
npm run release:patch  # 0.12.0 → 0.12.1
```

**What the release script does automatically:**

1. Runs tests
2. Bumps version in `sas-assistant/package.json`
3. Builds the DMG (arm64 + x64)
4. Uploads DMGs to Google Cloud Storage (`gs://docs-assets/`)
5. Updates `src/.vuepress/public/downloads.json` in the docs source with the new release entry
6. **Updates hardcoded download links** in `src/README.md`, `src/getting-started/README.md`, and `src/guild/README.md` via regex
7. Commits and pushes the docs source changes — the `Deploy Docs` GitHub Action then builds VuePress and publishes to `dawnet-docs-gh-pages`
8. Creates a git tag in the assistant repo
9. Optionally creates a GitHub release

**Release script location:** `sas-assistant/scripts/release.js`

The script automatically finds and updates download links using this regex:
```javascript
/https:\/\/storage\.googleapis\.com\/docs-assets\/signals-and-sorcery-\d+_\d+_\d+-arm64\.dmg/g
```

After the release script finishes, the docs site will update automatically once CI runs. No manual `gh-pages` branch operations are required.

## Updating Documentation Content

When you just want to edit docs (no app release involved):

```bash
cd /Users/stevehiehn/sas-platform/signals-and-sorcery-docs

# 1. Edit markdown files in src/
# 2. Optionally preview locally
npm run dev

# 3. Commit and push to main — CI deploys
git add src/
git commit -m "Update documentation"
git push origin main
```

That's it. No `npm run deploy`, no `gh-pages` branch checkouts, no manual merges.

## Repository Layout

```
signals-and-sorcery-docs/
├── src/
│   ├── .vuepress/
│   │   ├── config.js          # VuePress configuration
│   │   ├── enhanceApp.js      # Client-side enhancements (AVOID for download links)
│   │   └── public/            # Static assets (images, etc.)
│   ├── getting-started/
│   │   └── README.md          # ⭐ DOWNLOAD LINKS LIVE HERE
│   ├── prologue/
│   │   └── README.md          # Overview page
│   └── [other sections]/
├── package.json               # npm scripts
└── DEPLOYMENT.md              # This file
```

## Build Scripts

From `package.json`:

- `npm run dev` — Start local dev server (http://localhost:8080)
- `npm run build` — Build site locally (verification only; CI does the real build)

## Common Issues

### Changes don't appear on live site

1. **Did CI run?** Check the CI status for your push to `main`. If CI failed, fix the build error and push again.
2. **GitHub Pages cache** — Wait 2–3 minutes after CI completes, then hard refresh (Cmd+Shift+R).
3. **Did you actually push to `main`?** CI only deploys from the `main` branch.

### Old version number still showing after a release

The release script edits `src/getting-started/README.md`. If the version on the live site looks wrong:
1. Check that the release script committed the markdown change
2. Confirm CI ran successfully on that commit
3. Edit `src/getting-started/README.md` manually if needed and push to `main`

## Testing Locally Before Pushing

```bash
cd signals-and-sorcery-docs
npm run dev
# Visit http://localhost:8080 and verify the page renders correctly
```

## GitHub Pages Configuration

- **Repository:** shiehn/dawnet-docs-gh-pages
- **Source:** Deploy from `gh-pages` branch (managed by CI)
- **Custom domain:** signalsandsorcery.com
- **CNAME file:** Contains `signalsandsorcery.com`

## Quick Reference: Release Checklist

Most of this is automated by the release script — listed here for visibility:

- [ ] DMG uploaded to Google Cloud Storage (script handles)
- [ ] Download link URL updated in `src/getting-started/README.md` (script handles)
- [ ] Source committed and pushed to `main` (script handles)
- [ ] CI deploys the site
- [ ] Verify live site shows new version

---

**Reminder:** Never run `npm run deploy`. Push to `main` and CI handles the rest.
