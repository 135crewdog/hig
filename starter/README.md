# Starter

A blank PWA that follows the [HIG](https://135crewdog.github.io/hig/), with Broad scope. It has two tabs (Entry, List), Settings with a theme, Clear local data and a feedback link, a date field that opens the native picker, a toast, offline support and tests. Try it at https://135crewdog.github.io/hig/starter/.

## Start a new project from it

1. Copy everything in `starter/`, including `.github/`, into the new repository's root.
2. Run `grep -ri starter .` and replace every hit with the app's name: the title and header, `apple-mobile-web-app-title`, the manifest's name and description, `APP` in `sw.js`, `STORAGE` in `app.js`, the disclaimer, the feedback link's subject, this README and `CLAUDE.md`. `APP` must be unique on `135crewdog.github.io`, because it scopes cache cleanup. Point the feedback link at whoever should receive feedback.
3. Draw `app/icon.svg`, then run `node render-icons.js` to make the PNGs (it needs Playwright; see Tests).
4. Set the accent: `--accent` and `--on-accent` in `app/style.css`, in all three color blocks (light, dark, and Auto at night).
5. Fill in `CLAUDE.md`, starting with its scope (Broad or Focused). Delete the Entry and List screens and build the real ones.
6. In the new repository on GitHub: Settings → Pages → Source: GitHub Actions.

## Tests

```
node --test                      # unit tests
node tests/browser/smoke.js      # browser smoke test; needs Playwright
node tests/browser/smoke.js out  # the same, saving a screenshot of each screen in out/
```

To install Playwright without adding it to the repository: `npm install --no-save --no-package-lock playwright@1.56.1 && npx playwright install chromium`.

## Before merging a pull request

The smoke test runs in Chromium. Open the change on an iPhone too (and, for a Broad app, an Android phone and a desktop browser): Safari draws native controls, the status bar and the date picker its own way, and only the device shows them. The pull request says what it was checked on.

## Every change to `app/`

Bump `APP_VERSION` in `app.js` and `VERSION` in `sw.js` to the same `YYYY.MM.DD.N`. A unit test fails if they differ, or if the service worker's file list doesn't match the files in `app/`.
