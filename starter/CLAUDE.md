# Starter

<!-- Replace this paragraph: what the app is for, who uses it, in two sentences. -->
A blank app that follows the HIG. Copy it to start a new project.

Follows the HIG at https://135crewdog.github.io/hig/. This file wins where the two disagree, and says why.

**Scope: Broad.** <!-- Broad: many people on many kinds of device. Focused: a small group on one kind of device; name it, e.g. "iPhone, installed to the Home Screen". -->

## The project rules

1. **DEFAULTS.** Use the operating system's and the browser's defaults: native controls, the system font, the device's theme, time zone and date format. Change a default only when the use case needs it, and say so here.
2. **SIMPLE.** Plain HTML/CSS/JS, no framework, no build step, no runtime dependencies. When in doubt, choose fewer files, settings and features.
3. **FUTURE-PROOF.** <!-- What must never need a code change? E.g. "everything about requirements comes from the config tab". -->
4. **CLOCK.** Dates and times are the device's own, in its own time zone. <!-- Or, when the use case needs it: "Every date and time is Zulu (UTC). Today is the UTC date, never the device's." -->

Ask the user before adding anything that is not in this file. Ideas that were discussed and not adopted are listed under "Parked" at the end; do not build them without asking.

**Working rule:** propose a solution and agree it with the user before building it. A pull request waits for the user's review; never merge one unasked.

## Architecture

```
CLAUDE.md                 this file, the spec
README.md                 for developers: tests, hosting, version bumps
app/                      the PWA: index.html, app.js, style.css, sw.js, manifest.webmanifest, icons
tests/app.test.js         node --test: the pure helpers in app.js
tests/browser/smoke.js    drives the app in Chromium; needs Playwright, dev only
.github/workflows/        test.yml runs both; pages.yml runs it, then publishes app/ to GitHub Pages from main
```

## The app

<!-- One paragraph per screen: what it shows, what each control does, what it says. -->

**Storage.** `localStorage` keys `starter.settings` (`{ theme }`) and `starter.entries`.

**Hosting and updates.** `app/` is published to GitHub Pages by `pages.yml` on every push to main that touches it. Bump `VERSION` in `sw.js` and `APP_VERSION` in `app.js` on every change to `app/`, or devices keep the old copy; a unit test fails if they differ.

## Departures from the HIG

<!-- Each one with its reason. "None" is a fine answer. -->
None.

## Gotchas

<!-- Things that bit this project, so they never bite twice. -->

## Parked

<!-- Discussed, not adopted, might come back. Ask before building. -->
