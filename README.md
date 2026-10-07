# SG Broadcast Graphics

First visual prototype for **Shailesh Gaur's live broadcast graphics system**.

## V1 — Live Ticker

A lightweight, OBS-ready browser-source ticker prototype:

- transparent page background
- Shailesh Gaur brand lockup
- live indicator
- continuous scrolling headline
- live clock
- responsive layout
- no backend required

### Run locally

Because this is a static prototype, any local static server works.

For example:

```bash
python3 -m http.server 4173
```

Then open:

```
http://localhost:4173
```

For OBS, add the local page as a **Browser Source** and enable transparency.

## Current prototype assumptions

This iteration intentionally uses placeholder headlines, typography and brand treatment. The goal is to establish the visual direction and motion first; final content, logo assets, colors and broadcast requirements can be refined after review with Shailesh Gaur.

## Roadmap

- [ ] Finalize visual identity after creator review
- [ ] Editable headline/data input
- [ ] Breaking-news variant
- [ ] Lower-third system
- [ ] Additional broadcast states
- [ ] OBS production setup/documentation
