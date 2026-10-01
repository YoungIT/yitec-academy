# YITEC Academy

Seminars for the YITEC team. The home page is a bookshelf of lectures; each lecture is its own site, built with any stack.

## Commands

```sh
pnpm install
pnpm lecture 01     # run lecture 01's dev server (matches the folder name prefix)
pnpm dev            # edit the home page live
pnpm build          # build the home page and every non-planned lecture into dist/
pnpm preview        # serve dist/ to click through the whole site
```

## Deploy

Every push to `main` builds the site and publishes it to GitHub Pages (`.github/workflows/deploy.yml`).
The site is served from `/<repo-name>/`, so the build runs with `BASE_PATH=/<repo-name>/`; locally it defaults to `/`.

## Add a lecture

Each folder in `lectures/` is a pnpm workspace package. Its `package.json` needs two scripts:

- `dev`: a live-editing server (`pnpm lecture <prefix>` runs it)
- `build`: reads the `BASE_PATH` env var (e.g. `/yitec-academy/lectures/<slug>/`) and writes a static site to `lectures/<slug>/dist/`

That is the whole contract. Inside the folder, use any framework and any style.

**A plain Vite site.** Add `index.html` plus whatever CSS and JS you like:

```json
"scripts": {
  "dev": "vite --open",
  "build": "vite build --base ${BASE_PATH:-/}"
},
"devDependencies": { "vite": "^8.3.1" }
```

Then run `pnpm install`, and add the lecture to `lectures.json` with a `status`:
- `planned`: on the shelf, dimmed with a padlock, not built or linked
- `draft`: built and linked as "Open draft"
- `ready`: built and linked as "Open lecture"

Optionally set `color` to pick the lecture's book on the shelf. Each colour is a hand-drawn tome with its own emblem:
`teal` (spiral), `terracotta` (shield), `sage` (leaf), `pink` (star) or `mustard` (flame).
Without it, books cycle through the colours in order. (This replaces the old `spine` CSS-colour field.)

One bookcase holds 9 lectures (3 per shelf). A course with more gets a `1 / 3`-style pager under the bookcase;
with fewer, the rest of each shelf is filled with decorative books and props.

## Layout

- `lectures.json`: courses and lectures shown on the home page
- `index.html`, `src/`: home page; `src/library/` holds the hand-drawn room, bookcases, books, props and card (WebP)
- `lectures/<slug>/`: one workspace package per lecture
- `brand/`: the YITEC mark traced to SVG, the academy logo (`brand/academy/`), the earlier painted logo
  (`logo-fantasy.png`, `logo-fantasy-transparent.png`) and the current hand-drawn logo (`logo-handdrawn.png`,
  transparent; `public/logo.png` and `public/favicon.png` are resized copies)
