# Human Interface Guidelines

Personal guidelines for small, iOS-styled Progressive Web Apps: plain HTML, CSS and JavaScript, hosted on GitHub Pages, used mostly on an iPhone. Show Time and Apollo are the working examples. `starter/` is a blank app that already follows every rule here.

## 0. How to use this

- **Apple's HIG is the base.** <https://developer.apple.com/design/human-interface-guidelines/> applies unless this document says otherwise. This document lists only what a web app changes or adds. It does not repeat Apple.
- **Precedence:** a project's own `CLAUDE.md`, then this HIG, then Apple's. A project that departs from this HIG says so in its `CLAUDE.md`, with the reason.
- **New projects** start by copying `starter/`. A project's `CLAUDE.md` opens with: *Follows the HIG at github.com/135crewdog/hig.*
- **Changing a rule** is a pull request here with the reason. A rule that came from a bug names the bug (see section 7).
- Read "pt" in Apple's HIG as CSS px. They are the same in Safari at `initial-scale=1`.

## 1. Principles

1. **Simple.** Do one job. Use the fewest files, settings, screens and words that do it. When in doubt, leave it out. Apple says it best: "Simplicity isn't minimalism. Include just what's necessary and let the rest fall away."
2. **Future-proof.** Use only standard web platform features, with no framework, no build step and no runtime dependencies. Code written today must still run unchanged in ten years. Data lives in a format the user owns, such as a spreadsheet or a plain JSON export, never only inside the app.
3. **One clock, chosen on purpose.** Every app states in its `CLAUDE.md` which clock it uses. Aviation apps use Zulu (UTC): "today" is the UTC date, never the device's. Dates are `YYYY-MM-DD` strings everywhere a machine reads them.
4. **Offline first.** The app opens and works with no connection. Nothing the user enters is lost to a bad signal.
5. **Apple's eight principles**, briefly:
   - **Purpose:** make it meaningful.
   - **Agency:** stay out of the way, and make every action reversible or confirmed.
   - **Responsibility:** collect only what is needed.
   - **Familiarity:** use known patterns, applied the same way everywhere.
   - **Flexibility:** accessible from the start.
   - **Simplicity:** see above.
   - **Craft:** test on a real phone.
   - **Delight:** make it human.

## 2. Foundations

### Color

Colors are CSS custom properties on `:root`, with one dark block that overrides them. The values come from Apple's iOS system palette. `starter/app/style.css` holds the canonical list.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#f2f2f7` | `#000000` | Page background (grouped background) |
| `--elev` | `#ffffff` | `#1c1c1e` | Cards, header |
| `--border` | `#c6c6c8` | `#38383a` | Card borders, separators |
| `--text` | `#000000` | `#ffffff` | Primary text |
| `--text2` | `#656569` | `#98989d` | Secondary text, section titles |
| `--fill` | `#e5e5ea` | `#48484a` | Inputs, segmented track, secondary buttons |
| `--accent` | `#007aff` | `#0a84ff` | Primary button, active toggle, focus ring |
| `--on-accent` | `#ffffff` | `#ffffff` | Text on the accent |
| `--destructive` | `#ff3b30` | `#ff453a` | Destructive buttons, field errors |
| `--error-text` | `#b3261e` | `#ff453a` | Error text that must be read |
| `--warning`, `-bg`, `-border` | `#8a6400`, `#fff9e6`, `rgba(255,204,0,.5)` | `#ffd60a`, `#3d2e00`, `rgba(255,214,10,.4)` | Caution banner |
| `--error-bg`, `-border` | `#fff0ef`, `rgba(255,59,48,.35)` | `#2d0a08`, `rgba(255,69,58,.4)` | Error banner |

- **One accent per app.** `--accent` defaults to iOS blue. An app may set its own; Apollo uses red `#e06666` with dark text. Use it as Apple says: on primary actions and the selected state, not as decoration. At most one or two accent-filled buttons per screen.
- **Secondary text is `#656569` in light mode, not Apple's `#8e8e93`.** Apple's gray fails 4.5:1 on white. Apollo darkened it after an audit, and readability wins over matching.
- **Never one color for two meanings.** Status colors are their own tokens. Never rely on color alone: pair it with text, such as an `OVERDUE` badge.
- **Aviation convention:** amber means caution and red means warning.

### Dark mode and theme

- Every app has **Light, Dark and Auto** in Settings → Appearance. Auto is the default and follows the system, including a change while the app is open.
  - **This departs from Apple**, which advises against an in-app appearance setting. It is kept on purpose: a crew member may want dark in a cockpit while the phone stays light.
- **Mechanism:** a `data-theme` attribute on `<html>`, plus a `system-dark` class kept in step with `prefers-color-scheme` by `matchMedia`. One dark block in the CSS serves both Dark and Auto-at-night.
- `<meta name="theme-color">` is set from `--elev` after every theme change, so the status bar matches the header.
- Set `color-scheme: light` or `dark` with the tokens, so native controls (date pickers, checkboxes, scrollbars) match.
- Stored theme values are lowercase: `light`, `dark`, `auto`.

### Typography

- **Font stack:** `-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif`, with `-webkit-font-smoothing: antialiased`.
  - Don't embed SF Pro, as Apple's license forbids it. The stack gives SF on Apple devices.
  - Don't set `letter-spacing` on body text; the system font tracks itself.
- **Set `text-size-adjust: 100%` on `html`.** Without it, Safari enlarges some text in landscape and not the rest.
- **Sizes** follow Apple's iOS text styles at the default Large size:

  | Style | px / weight | Used for |
  |---|---|---|
  | Large Title | 34 / 700, `letter-spacing: -0.5px` | Header title |
  | Headline | 17 / 600 | Nav title (Settings), buttons |
  | Body | 17 / 400 | Inputs, settings rows, body text |
  | Subhead | 15 / 600 | List row primary text |
  | Footnote | 13 / 400 | Section titles (uppercase), labels, hints, secondary lines, badges |

- **Minimum 13px for anything a user must read.** Apple's floor is 11; ours is higher.
- **Numbers** that line up (dates, counts, times) use `font-variant-numeric: tabular-nums`, not a monospace font.
- **Weights:** 400, 600, 700. Never Light or Thin.

### Layout

- **The app is an ordinary web page, not an app shell.** The browser owns the viewport, scrolling, the status bar, the home indicator, the keyboard and zoom.
  - Never size anything to the viewport height (`vh`, `dvh`, `height: 100%` chains, `position: fixed; inset: 0`) or to `env(safe-area-inset-*)`.
  - The page background is the app background (`body { background: var(--bg) }`), so nothing shows behind the app.
- **One column, `max-width: 720px`, centered.** A portrait phone fills it; a landscape phone, an iPad or a desktop centers it. There are no breakpoints. Content that needs to adapt uses `flex-wrap` or `min()`, not device sizes.
- **Spacing is on a 4px grid, mostly 8px multiples:**
  - Header: 16px vertical, 20px horizontal.
  - Panel padding: 20px.
  - Between sections: 24px.
  - Section title to card: 8px.
  - Card padding: 16px.
  - Between fields: 16px.
  - Between buttons in a row: 12px.
- **Radii:**
  - Cards, inputs, banners and toggles: 10px.
  - Full-width buttons: 12px.
  - Segmented control: 9px outside, 7px inside.
  - Round icon buttons: 50%.
- **Borders:** 1px `--border` on cards, the header bottom and inputs.
- **Shadows:** only the selected segment (`0 1px 3px`) and the toast.
- **Sticky, not fixed.** The only thing that sticks is a save bar, with `position: sticky; bottom: 0` at the end of the section it serves. The header scrolls away with the page.

### Accessibility

- **Tap targets are at least 44×44px**, with no exceptions in new work. A control may look smaller, but its hit area may not be.
- **Text contrast is at least 4.5:1** in both themes. 3:1 is acceptable only for text 18px and up, or bold.
- **Zoom is never blocked.** The viewport meta is exactly `width=device-width, initial-scale=1`. Never `maximum-scale` or `user-scalable=no`.
- **Visible focus:** `:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px }`.
- **Reduced motion:** under `@media (prefers-reduced-motion: reduce)`, transitions are removed.
- **Semantic HTML first:** `<button>` for actions, `<label for>` on every input, `<h1>` for the title. Then ARIA where HTML has nothing:
  - `role="tablist"`/`"tab"` with `aria-selected` and arrow keys on a segmented control
  - `aria-pressed` on toggle buttons
  - `aria-label` on icon buttons and steppers
  - `role="status"` on toasts and `role="alert"` on banners
  - `aria-describedby` from a field to its error.
- **Gestures always have a visible alternative.** A swipe between tabs mirrors the segmented control.
- **Avoid timed messages for anything the user must act on.** A toast confirms; a banner that stays explains a problem.

### Writing

- **Sentence case everywhere:** buttons, labels, hints, toasts, empty states, settings.
  - Section titles are written in sentence case and uppercased by CSS.
  - Proper nouns keep their capitals: Zulu, Task ID, Sim.
  - A status flag may be capitals on purpose (`OVERDUE`).
- **Buttons start with a verb:** "Save 2 rows", "Sync now", "Clear local data". No "OK" where a verb fits, never "Yes/No", and "Cancel" is always "Cancel".
- **Errors are instructions** that end with a period: "Enter the mission number.", not "Invalid mission number".
  - Say what to do next: "No connection. Rows are saved on this device and will sync later."
  - No "oops", no blame, and no "we".
- **Count correctly:** "1 row", "2 rows".
- **Device-neutral verbs:** "choose" or "select", not "click". "Tap" is fine in an app that is only for phones.
- **Dates a human reads are `DD-Mmm-YY`** (`07-Oct-26`), and times are `HHmm` with `Z` or `L` (`1405Z`). Machine dates are `YYYY-MM-DD`.
- **Be short.** Read it aloud. If a sentence can lose a word, it does.

### Icons

- **The app icon** is simple shapes or a single word on a solid or gradient background. It is full-bleed, square and opaque; iOS rounds the corners.
  - One SVG source.
  - PNGs at 192 and 512 rendered from it.
  - `apple-touch-icon` is the 192 PNG.
- **In-app icons** are emoji or small inline SVGs. No icon fonts, no SF Symbols artwork (license), and no icon library. Follow Apple's metaphors: ⚙ settings, + add, − remove, × close, ✓ done.

## 3. Components

Each one is in `starter/app/style.css`. Specs are given where they matter.

| Component | Spec |
|---|---|
| **Header** | `--elev` with a bottom border. The 34px title is on the left (the app name on the main screen). The settings gear is on the right: a 44px circle on `--fill`, `aria-label="Settings"`. |
| **Settings header** | The centered 17/600 title "Settings". **Done is on the right** (trailing, as Apple does), 17/600 in `--accent`. A 60px spacer sits on the left. |
| **Segmented control** | Under the header, on `--elev` with a bottom border. The track is `--fill`. Buttons are equal width, 13px, at least 44px tall. The selected button is `--elev`, 600 weight, with a small shadow. At most 4 segments. The switch is instant and scrolls to the top, with no slide. A horizontal swipe on the content does the same (horizontal must dominate: `dy ≤ 0.75·dx`, 50px threshold). |
| **Section** | A 13px uppercase `--text2` title, letter-spacing 0.5px, over a card. |
| **Card** | `--elev`, 10px radius, 1px border, 16px padding. A list card has horizontal padding only, with rows separated by 1px borders and none on the last. Groups are separate cards with a 12px gap and no heading if the heading would mean nothing to the user. |
| **List row** | The name at 15/600 over a secondary line at 13 `--text2`. Trailing elements (badge, stepper) are right-aligned. The row is at least 44px tall. |
| **Input** | 17px (16px or less makes iOS zoom the page), padding 12/16, `--fill`, 1px border, 10px radius, at least 46px tall. The label is above it, 13px `--text2`. An error is a `--destructive` border plus an inline message. Set `inputmode`, `autocomplete`, `autocapitalize` and `spellcheck` for what the field holds. |
| **Date field** | A native `<input type="date">` (its value is always `YYYY-MM-DD`), made invisible over a label showing `DD-Mmm-YY`. Focus shows on the label via `:focus-within`. |
| **Button** | Full width, padding 16, 12px radius, 17/600. The kinds are primary (`--accent`), secondary (`--fill`) and destructive outline (transparent with a `--destructive` border and text). Disabled is `opacity: .5`. Buttons in a row are equal width, gap 12. An action that takes time changes its label ("Syncing…") and is disabled until done. |
| **Toggle group** | Two to four mutually exclusive buttons in a row, gap 8, 10px radius, 17/600, `aria-pressed`. The selected one is `--accent` with `--on-accent` text. |
| **Stepper** | − count + on a `--fill` pill. The buttons are 44×44 with `aria-label` "Add one ⟨name⟩" and "Remove one ⟨name⟩". The count is 17/700, tabular. Zero is `--text2` at 400. A row with a nonzero count turns the pill `--accent`. |
| **Search** | `type="search"` styled like every input. It sits inline above the list it filters, filters as you type, and is trimmed and case-insensitive on every field shown in the row. No special clear button. |
| **Badge** | A 13/600 tabular pill with an 8px radius. It is `--fill` and `--text2` by default, or a status color with dark text. |
| **Banner** | Warning or error tokens, 10px radius, 13/500, `role="alert"`. It sits at the top of the screen it concerns and stays until the cause is gone. |
| **Toast** | A one-line confirmation of something that just worked ("2 rows saved"). It is fixed at the bottom center, inverted colors, 14px, `role="status"`, and gone after 2.5s. Never use one for an error that needs action. |
| **Empty state** | Centered italic `--text2` with padding 40px. It says what to do next ("No config yet. Open Settings, enter …"). |
| **Confirm** | Only for an action that destroys data the user can't recover. Use `confirm()` with text that says what will and won't be touched. `alert()` is never used. |
| **Version line** | At the bottom of Settings, centered 13px `--text2`: "Version 2026.10.14.1". If there is a backend, its version too, so a stale one is visible. |

## 4. Patterns

- **Screens:**
  - a main view with up to four tabs on a segmented control
  - Settings as its own screen, opened by the gear and closed by Done
  - no other navigation stack, no modals, no sheets.
- **First run:** if the app can't work until something is set (a URL, a token), it opens on Settings until it is. There is no tutorial. A help page is linked from Settings → Help.
- **Settings sections, in this order:**
  1. Whatever the app needs (Connection).
  2. Appearance.
  3. Data (Clear local data, which confirms first).
  4. Help (Guide, Send feedback).
  5. The version line.

  Settings holds rarely changed options only. A filter or a mode belongs on its own screen.
- **Defaults are prefilled:** today's date, the last-used choice. An untouched default date moves on when the app is reopened on a new day.
- **Feedback matches the weight of the event:**
  - field error: inline, next to the field
  - screen problem: banner
  - success: toast
  - destroying data: confirm.
- **Offline-first saving:**
  - A save goes into a local queue at once, as one batch with a fresh `batchId` (`crypto.randomUUID()`), and is shown as saved.
  - Sync sends batches in order and removes each one only when the server acknowledges its `batchId`.
  - The server ignores a `batchId` it has seen, so a retry never duplicates.
  - Sync runs on load, after a save, on `online`, on `visibilitychange` when there is something to do, and from Sync now.
- **Storage can fail.** `save()` returns true or false. When a write fails, the user's input stays on screen and the UI says so. Never report "saved" for something that wasn't.
- **Late replies are dropped.** A generation counter is bumped by Clear or by a connection change, and any reply from an earlier generation is ignored.
- **One editing tab.** If two tabs could both write the same queue, a heartbeat lock in `localStorage` lets one edit; the others read. `storage` events keep the tabs in step.
- **Connection handoff:** a link with the URL and token in the fragment (`#url=…&token=…`), which the server never sees. The app saves it and strips it with `history.replaceState`.
- **POST to Apps Script** uses `Content-Type: text/plain` to avoid a CORS preflight.

## 5. Engineering

### Stack and files

- **HTML, CSS and JavaScript only.** No framework, no build step, no runtime dependencies, no CDN scripts, no npm packages in the app. Dev tools (Playwright) are installed in CI with `--no-save` and never committed.
- **Layout:**

  ```
  CLAUDE.md            the spec: what the app does, every rule, decisions, what's parked
  README.md            for developers: tests, hosting, version bumps
  app/                 index.html, app.js, style.css, sw.js, manifest.webmanifest, icon.svg, icon-192.png, icon-512.png
  tests/app.test.js    node --test, the pure helpers
  tests/browser/smoke.js   Playwright, drives the real page
  .github/workflows/   test.yml, pages.yml
  ```

- **`app.js` has three parts:**
  1. Pure helpers at the top, with no DOM.
  2. Everything that touches the page inside `if (typeof document !== 'undefined')`.
  3. `module.exports` of the helpers at the bottom, so Node tests import the same code the app runs.

  Never copy logic into a test.
- **Logic lives in one place.** If a backend computes something (due dates, status colors), the app displays it and does not recompute it.
- **Plain ES5-style JavaScript** (`var`, `function`) runs everywhere with no transpiling. `'use strict'`. Small functions with one-line doc comments.
- **Style:**
  - Comments say why, not what.
  - Don't add a feature, setting or file without asking.
  - Workarounds are removed once their cause is gone.

### Head and manifest

```html
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#ffffff">
<meta name="apple-mobile-web-app-title" content="Name">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="icon-192.png">
```

- **The manifest:**
  - `manifest.webmanifest`, with `"start_url": "./"` and `"scope": "./"`. Relative paths are required for a GitHub Pages subpath.
  - `"display": "standalone"`.
  - No `orientation` lock.
  - `background_color` matching `--bg`.
  - 192 and 512 PNGs with `"purpose": "any maskable"`, plus the SVG.
- **Don't add `apple-mobile-web-app-capable` or a status-bar-style meta.** The manifest covers it.

### Service worker

- **Network first for every same-origin GET**, with `fetch(req, { cache: 'no-cache' })`, storing each good response. The cached copy is the offline fallback. A new page and its new script therefore arrive together.
- **Don't intercept** cross-origin requests (APIs) or non-GET requests.
- **Offline navigation** to the app's own path falls back to the cached shell. Any other uncached page gets a plain "Offline" response, never the app.
- **Cache names are `<app>-<VERSION>`.** On activate, delete only caches that start with `<app>-`. Every app on `135crewdog.github.io` shares one cache storage.
- **The precache list matches the shipped files exactly.** `cache.addAll` fails as a whole if one file 404s.
- Call `skipWaiting()` and `clients.claim()`.

### Versions

- **Date-based: `YYYY.MM.DD.N`** (`2026.10.14.1`).
- It lives in two places, `APP_VERSION` in `app.js` and `VERSION` in `sw.js`, and **both are bumped on every change under `app/`.** A test fails if they differ.
- Settings shows it.

### Storage

- Use `localStorage` with dotted keys: `<app>.settings`, `<app>.data`, `<app>.queue`.
- Every read is wrapped in try/catch with a fallback. Every write returns success.
- Never store anything the user can't afford to lose only on the device: sync it to where the user owns it.
- **Secrets:** `localStorage` is plain text. Keep tokens low-value and specific to one app, and never commit them.

### Tests and CI

- **`node --test`** covers the pure helpers.
  - Spec tables from `CLAUDE.md` are copied verbatim into tests.
  - **Never change an expected value to make a test pass**; ask.
  - Freeze or inject the clock, and derive dated expectations from the rules, never from the day the test was written.
- **The smoke test** (`tests/browser/smoke.js`, Playwright with Chromium) loads the real page at a phone size (390×844) and drives the main paths. It fails on any page error. With a directory argument, it saves screenshots for the guide.
- **`test.yml`** runs both on every push and pull request.
- **`pages.yml`** publishes `app/` to GitHub Pages from `main`, only after `test.yml` passes.

## 6. Process

- **`CLAUDE.md` is the spec.** It holds what the app does, every rule, the decisions and their reasons. Code that disagrees with it is wrong.
- **Propose before building.** Agree a solution with the user, then build it.
- **A pull request waits for the user's review.** Never merge one unasked.
- **Ask before adding anything not in the spec.** Ideas discussed and not adopted go under **Parked** in `CLAUDE.md`, so they aren't re-proposed or built by accident.
- **Audits** go into a file with a severity per finding and a recorded decision for each one.

## 7. Lessons learned

Each rule above that came from a real bug is listed here with where it came from.

| Rule | Learned from |
|---|---|
| No app shell; never size to the viewport or safe area | Apollo: on an installed iOS copy, `100vh` came up short and showed a band of page under the app |
| Network-first for every file | Apollo: cache-first assets paired a new page with an old script, so the search field had no handler |
| Scope cache cleanup to the app's own prefix | Show Time's worker deletes every other cache on `135crewdog.github.io`, Apollo's included |
| The precache list matches the shipped files | Show Time: deleted icons still in the list made the new worker fail to install, so old icons stayed |
| Relative `start_url`, `scope` and worker path | Show Time: an absolute `start_url` gave a 404 when launched from the iOS home screen |
| Bump the version in every place, every time, and test it | Show Time: a stale cache name meant users never got updates; version strings drifted across three files |
| `text-size-adjust: 100%` | Apollo: Safari enlarged some text in landscape and left badges small |
| Inputs at 17px | iOS zooms the page into any field under 16px |
| Don't special-case native controls | Apollo: three PRs chasing a search clear button that Safari never draws on a web page |
| The app doesn't redo the backend's math | Apollo: the 30/60/90 bands lived in three places and drifted |
| Tests never depend on today's date | Show Time: a Zulu test broke in summer when local time moved to EDT |
| Tests import the real code | Show Time: `test.html` carried its own copy of `calculate()` that drifted from production |
| Deploy only after the tests pass | Apollo audit: Pages deployed untested code |
| `save()` returns success; queue by `batchId`; drop late replies; one editing tab | Apollo audit: two tabs could lose rows, a failed write said "saved", and a late reply refilled cleared data |
| Never hand-sort a view a script owns | Apollo: a sort racing a refresh duplicated eleven rows and lost eleven |
| No `alert()`; in-app feedback | Show Time: clipboard errors moved to a themed banner |
| Fewer elements: drop labels that mean nothing to the user | Apollo dropped Task-ID group headings; Show Time added day-offset labels, then removed them, twice |
| Copy in the format the destination renders | Show Time: Mattermost renders Markdown tables, not HTML |
| Darker secondary gray | Apollo audit: Apple's `#8e8e93` fails 4.5:1 on white |
| Remove a workaround when its cause is gone | Apollo: a "self-heal" script for an old worker outlived its purpose |
