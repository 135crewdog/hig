# HIG repository

This repository holds the user's personal Human Interface Guidelines (`HIG.md`) and a blank app that follows them (`starter/`).

- `HIG.md` lists only what differs from or adds to Apple's HIG. Don't copy Apple's text in; link to it.
- Every rule in `HIG.md` that came from a bug names the bug in section 7.
- `starter/` must follow every rule in `HIG.md`. A change to a rule that the starter shows changes the starter in the same pull request. `node --test` and `node tests/browser/smoke.js` in `starter/` must pass, and CI runs both.
- Propose a change and agree it with the user before writing it. A pull request waits for the user's review; never merge one unasked.
