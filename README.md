# dawnet-docs
DAWNet Plugin Documentation

# DEV
npm run dev

# BUILD
npm run build

# SERVE

`npm install -g http-server`

cd src/.vuepress/dist && sudo nohup http-server dist/ -p 80 -a 0.0.0.0 &


# DEPLOY

```bash
npm run build
npm run deploy
```

### Troubleshooting ./dawnet-docs-gh-pages
```
git reset --hard
git fetch origin
git reset --hard origin/main
```