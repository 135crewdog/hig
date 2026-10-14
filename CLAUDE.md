# HIG repository

This repository holds the user's personal Human Interface Guidelines and a blank app that follows them (`starter/`). Both are published to https://135crewdog.github.io/hig/ by `pages.yml`.

- `index.html` is the HIG; there is no other copy. It is built like the Apollo guide: each rule in one or two plain sentences, with the detail and the why in a `<details>` "More" block beneath.
- The bottom line is "use the operating system's and browser's defaults". Every app declares a scope, Broad or Focused, which decides whose defaults.
- The HIG lists only what differs from or adds to Apple's HIG. Don't copy Apple's text in; link to it.
- Every rule that came from a bug names the bug under "Lessons learned".
- `starter/` is Broad and must follow every rule in the HIG. A change to a rule that the starter shows changes the starter in the same pull request. `node --test` and `node tests/browser/smoke.js` in `starter/` must pass, and CI runs both.
- Propose a change and agree it with the user before writing it. A pull request waits for the user's review; never merge one unasked.
