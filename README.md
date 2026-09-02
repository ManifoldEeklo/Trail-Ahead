# Trail-ahead — gravel & off-road route planner

Mostly a static HTML app — routing (BRouter, Valhalla, OSRM, Overpass, NGI
Top10Vector, TOP10NL, the Flemish Tragewegenregister) runs as direct
`fetch()` calls from the browser to those public APIs, no backend involved.

Two small serverless functions were added on top for **anonymous usage
tracking** (app opens, unique devices, routes generated), stored in Upstash
Redis and viewable from the app's own Admin panel.

## What's in this repo

```
├── index.html            the entire app (map, UI, routing logic)
├── api/
│   ├── track.js           records a "visit" or "route" event
│   ├── stats.js            reads back the current counters
│   └── cron-summary.js     optional: once a day, writes a snapshot to GitHub
├── package.json
├── vercel.json             static config + the daily cron schedule
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

- vercel.com → **Add New… → Project** → import the repo you just pushed.
- Framework preset: **Other**.
- Deploy once first — the tracking endpoints will simply error harmlessly
  (caught and ignored by the app) until you connect a database in step 3.

### 3. Connect Upstash Redis (for the usage stats)

Vercel's own **Vercel KV is deprecated** — the currently recommended path
is Upstash Redis via the Vercel Marketplace, which is what `api/track.js`
and `api/stats.js` are built for.

- Your Vercel project → **Storage** tab → **Create Database** → **Upstash →
  Redis** (there's a free tier).
- Connect it to this project. Vercel automatically injects
  `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` as environment
  variables — nothing to type in by hand, no token to manage yourself.
- Redeploy (or it picks it up automatically) — the Admin panel's **Usage
  stats** block will now show real numbers.

### 4. (Optional) Turn on Vercel Web Analytics

The page already ships the plain-HTML tracking snippet (no `@vercel/analytics`
npm package needed for a static site like this one). It only starts sending
data once you flip the switch:

- Your Vercel project → **Analytics** tab → **Enable**.
- That's it — page views start showing up in the dashboard on the next visit.

### 5. (Optional) Daily snapshot to a GitHub file

`api/cron-summary.js` runs once a day (see the `crons` entry in
`vercel.json`) and appends `{date, visitsTotal, uniqueDevices, routesTotal}`
to `stats/daily.json` in this repo — a simple historical log, without the
commit-per-visit problem a naive "log straight to GitHub" approach would have.

This step needs a **GitHub Personal Access Token** with permission to write
to this repo:

- GitHub → Settings → Developer settings → Personal access tokens → generate
  one scoped to just this repo, **Contents: read and write**.
- In your Vercel project → **Settings → Environment Variables**, add:

| Name | Value |
|---|---|
| `GITHUB_TOKEN` | the token you just generated |
| `GITHUB_REPO` | `your-username/your-repo` |
| `GITHUB_STATS_PATH` | *(optional, defaults to `stats/daily.json`)* |
| `GITHUB_BRANCH` | *(optional, defaults to `main`)* |

If you skip this step entirely, the app still works fine — you just won't
get the daily GitHub snapshot; the live numbers in the Admin panel keep
working off Redis regardless.

## Mobile

Detects touch/narrow screens and switches the sidebar into a slide-in
drawer (☰ button in the header). On phones the menu opens by default after
the splash screen; generating a route collapses it automatically so the map
fills the screen. **Generate**, **Clear**, and **.gpx** live in the map's
own bottom bar, not inside the drawer, so they're always reachable.

## Known limitations, stated plainly

- **The admin password (`Admin123`) is a plain string inside `index.html`.**
  UI convenience only, not real security — readable by anyone in the page
  source. Same is true of `/api/stats` itself: it's not access-controlled,
  so anyone who knows the URL can read the counters. Fine for a personal
  project's usage numbers; not something to put real secrets behind.
- **Device counting uses `localStorage`.** Clearing browser data makes a
  returning visitor look "new" again — a known, accepted trade-off of not
  requiring accounts or real device fingerprinting.
- **External routing APIs** (BRouter, Valhalla, Overpass, the various
  government geodata services) are outside this app's control and can go
  down or change shape; the app is built to degrade gracefully rather than
  break when that happens, but can't guarantee their uptime.
