# YITEC Academy

Seminar slides for the YITEC team. The home page lists every lecture; each lecture is a [Slidev](https://sli.dev) deck.

## Commands

```sh
pnpm install
pnpm slides 01      # edit lecture 01 live (matches the folder name prefix)
pnpm dev            # edit the home page live
pnpm build          # build the home page and every non-planned lecture into dist/
pnpm preview        # serve dist/ to click through the whole site
```

## Add a lecture

1. Create `lectures/<slug>/slides.md`. Copy the headmatter from `lectures/01-what-an-agent-is/slides.md`
   (it loads the shared `yitec-academy` add-on and uses hash routing so slide links work on any static host).
2. Add the lecture to `lectures.json` with a `status`:
   - `planned`: listed on the home page, not built or linked
   - `draft`: built and linked as "Open draft"
   - `ready`: built and linked as "Open slides"

## Layout

- `lectures.json`: courses and lectures shown on the home page
- `index.html`, `src/`: home page
- `slidev-addon/`: shared slide styles, the `<YaMark />` logo component, and the corner logo on every slide
- `brand/`: the YITEC mark traced to SVG, and the academy logo (`brand/academy/final/`)
