# Starter

A blank PWA that follows the [HIG](../HIG.md). It has two tabs (Add, List), Settings with a theme and Clear local data, a date field in Zulu, a toast, offline support and tests.

## Start a new project from it

1. Copy everything in `starter/`, including `.github/`, into the new repository's root.
2. Replace `starter` and `Starter` with the app's name in `app/index.html`, `app/manifest.webmanifest`, `app/sw.js` (`APP`), `app/app.js` (`STORAGE`) and `CLAUDE.md`. The `APP` name in `sw.js` must be unique on `135crewdog.github.io`, because it scopes cache cleanup.
3. Draw `app/icon.svg`, then run `node render-icons.js` to make the PNGs.
4. Set the accent: `--accent` and `--on-accent` in `app/style.css`, in both the light and the dark block.
5. Fill in `CLAUDE.md`. Delete the Add and List screens and build the real ones.
6. In the new repository on GitHub: Settings → Pages → Source: GitHub Actions.

## Tests

```
node --test                      # unit tests
node tests/browser/smoke.js      # browser smoke test; needs Playwright
node tests/browser/smoke.js out  # the same, saving a screenshot of each screen in out/
```

To install Playwright without adding it to the repository: `npm install --no-save --no-package-lock playwright@1.56.1 && npx playwright install chromium`.

## Every change to `app/`

Bump `APP_VERSION` in `app.js` and `VERSION` in `sw.js` to the same `YYYY.MM.DD.N`. A unit test fails if they differ, or if the service worker's file list doesn't match the files in `app/`.
