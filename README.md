# HIG

Personal Human Interface Guidelines for simple, future-proof Progressive Web Apps. They are built on [Apple's HIG](https://developer.apple.com/design/human-interface-guidelines/) and drawn from two working apps, [Show Time](https://github.com/135crewdog/showtime) and [Apollo](https://github.com/135crewdog/apollo).

- **Read it at https://135crewdog.github.io/hig/.** `index.html` is the HIG; there is no other copy.
- **Try the starter at https://135crewdog.github.io/hig/starter/.** [starter/](starter/) is a blank app that already follows the HIG. A new project starts by copying it.

A project adopts the HIG with one line at the top of its `CLAUDE.md`:

> Follows the HIG at https://135crewdog.github.io/hig/.

`pages.yml` publishes `index.html`, `hig.css` and `starter/app/` (as `starter/`) on every push to main, once the starter's tests pass. One-time setup: Settings → Pages → Source: GitHub Actions.
