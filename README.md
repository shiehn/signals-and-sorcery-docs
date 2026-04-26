# Signals & Sorcery Documentation

VuePress source for [signalsandsorcery.com](https://signalsandsorcery.com).

## Local development

```bash
npm install
npm run dev      # local preview at http://localhost:8080
npm run build    # local build verification (output: src/.vuepress/dist/, not deployed)
```

## Deployment

**CI auto-deploys on push to `main`.** Do not run `npm run deploy` manually — that script is legacy and bypasses CI. Just commit to `main` and the site will update.

For details on how releases (download link bumps, version updates) are handled, see [`DEPLOYMENT.md`](DEPLOYMENT.md).
