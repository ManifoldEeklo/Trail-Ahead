# Trail-ahead — gravel & off-road route planner

Single static HTML app. No backend, no build step, no environment
variables required — the whole routing pipeline (BRouter, Valhalla, OSRM,
Overpass, NGI Top10Vector, TOP10NL, the Flemish Tragewegenregister) runs as
direct fetch() calls from the browser to those public APIs.

## What's in this repo

```
├── index.html      the entire app (map, UI, routing logic)
├── package.json    just metadata + a local-preview script
├── vercel.json     minimal static-site config (cleanUrls)
└── .gitignore
```

## Deploy

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Trail-ahead"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

### 2. Import into Vercel

- vercel.com → **Add New… → Project** → import the GitHub repo you just pushed.
- Framework preset: **Other** (no build step — Vercel will serve `index.html` as-is).
- Click **Deploy**. That's it — no environment variables to set, nothing else to configure.

Alternatively, from the CLI: `npx vercel` from inside this folder.

### Local preview

```bash
npm run dev
```
(just runs `npx serve .` — any static file server works equally well)

## Mobile

The app detects touch/narrow screens (`pointer: coarse` or width ≤900px) and
switches the sidebar into a slide-in drawer, toggled with the ☰ button in the
header. The map fills the screen by default on phones/tablets; the
**Generate**, **Clear**, and **Download .GPX** buttons live in the map's own
bottom bar, not inside the drawer, so they stay reachable whether the drawer
is open or closed.

## Known limitations, stated plainly

- **The admin password (`Admin123`) is a plain string inside `index.html`.**
  It's a UI convenience gate for hiding a couple of optional features
  (Waypoints, Street View, Top10Vector weighting sliders, radius limit,
  explanation text) from casual users — it is **not real security**. Anyone
  can read it directly from the page source, on GitHub, or in the browser.
  If you need actual access control, that requires a real backend (see the
  note below).
- **External API reliability isn't guaranteed.** BRouter, Valhalla,
  Overpass, and the various Belgian/Dutch government geodata services are
  all free public services outside this app's control. The app is built to
  fail gracefully (falls back to plain road routing, or tells you honestly
  when a data source came up short) rather than break, but it can't
  guarantee those services stay up or keep the same API shape forever.
- **No server-side rendering, no analytics, no tracking** — it's a plain
  static file. If you want usage analytics, that's a separate addition
  (e.g. Vercel Analytics, which can be turned on for any Vercel project
  without touching this code).

## If you later want the routing logic hidden server-side

This version intentionally keeps everything client-side for simplicity —
the whole point of tonight's deploy was "get this live with zero moving
parts." If down the line you want the actual routing algorithm to run on a
server (so it isn't visible in the browser's dev tools), that's a genuinely
different architecture — a separate `api/` + `lib/` structure with Vercel
serverless functions was scoped out earlier in this project's history and
can be revisited then.
