# Matchday Ledger

A free daily soccer game that teaches business finance. One match a day, the same for everyone, about 3 minutes. You're the chairman of Harbour Rovers: right answers are goals, wrong answers are goals for the other side.

## Run it

```bash
npm install
npm run dev        # local dev server
npm test           # content + answer checks + game logic
npm run build      # static site in dist/
```

## Adding or editing matches

Every match is one JSON file in `content/matches/` (`NN-topic.json`). No code changes needed. `content/season.json` holds the club name and the date of matchday 1.

Each question has: `prompt`, 4 `options`, `answer` (0-3), `hint`, `working` (one step per line), `whyNot` (one note per option, `null` at the correct answer), `kind` (`calc` or `concept`) and, for `calc` questions, a `calc` block with the numbers and formula.

`npm test` fails if:

- a `calc` formula doesn't produce the correct option, or a wrong option also matches
- any written sum like `$30 - $12 = $18` in the working, hints or why-nots is wrong (rounded results must say "about")
- any figure in the explanations can't be traced to the question, an option, a checked sum or a declared rule of thumb (`benchmarks`)
- a match is missing a hint, a why-not, a term, or has an em dash, or names a real club, league or player

Writing rules: plain English, short sentences, no em dashes, round numbers a 16-year-old could do on a napkin. Multiply is written ` x `, divide ` / `.

## How it works

- `src/lib/schedule.ts`: matchday from the player's local date. Switches at local midnight.
- `src/lib/results.ts`: streak, W-D-L record, saved progress. Only the first finish of the daily match counts. Replays never count.
- `src/lib/storage.ts`: localStorage wrapped so it never throws (falls back to memory).
- `src/lib/share.ts`: spoiler-free share text.
- `src/lib/analytics.ts`: Vercel Web Analytics. Completion rate = `/daily/full-time` views / `/daily/kick-off` views (sent as page views so it works on the free plan).
- `src/config.ts`: the public site address used in the share text and Open Graph tags.
- `scripts/make-images.mjs`: regenerates `public/og.png` and the app icons.

## Version 2 hooks

- **Sign-in and synced streaks:** swap the `KeyValueStore` in `src/lib/storage.ts` for one that syncs to a server. `SaveData` is already a single versioned JSON blob keyed by date.
- **Daily leaderboard (Supabase):** `DailyResult` (date, match, goals, hints) is the row to submit.
- **Practice mode:** each `calc` question has `vars` and a `formula`, evaluated by `src/lib/calc.ts`. Randomise the vars, recompute the answer.
- **Club packs:** a pack is `season.json` + a folder of matches (`src/lib/types.ts` `Pack`). Load a different folder for a different business.
