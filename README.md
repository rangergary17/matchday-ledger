# Matchday Ledger

A free daily soccer game that teaches business finance. One match a day, the same for everyone, about 3 minutes. You're the chairman of Harbour Rovers: right answers are goals, wrong answers are goals for the other side.

## The game

- **Match:** team talk, 3 multiple-choice chances, then a penalty where you type the answer (a miss is saved, so draws can happen). Commentary, a pitch strip, goal moments, optional crowd sound and phone buzz.
- **Chairman's call:** after each match, use the day's idea on your own club. Choices change cash, crowd, profit per fan and fixed costs for the rest of the season. Some land a few matchdays later.
- **Club:** every matchday earns `fans x profit per fan - fixed costs`. Board confidence, targets and a news feed.
- **League:** you plus the 30 opponents. Other results are simulated from a fixed seed, so everyone sees the same table.
- **Chairman card:** six skill ratings (Profit, Pricing, Cash, Growth, Planning, Investing) from 40 to 99. Shareable as an image.
- **Training ground:** spaced repetition. Topics come back as typed drills with fresh numbers: a day later if you struggled, a week later if you nailed it.
- **Catch up:** missed matchdays still count for the league and club, not for the streak.

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

Each match also has a `penalty` (a template: `vars` with a base value and a range, a `prompt` with `{placeholders}`, an `answer` formula, `working`, and `traps` for common mistakes) and a `call` (2-3 options with `effects` on the club, a `result` explanation, and an optional `later` consequence), plus a `skill`.

`npm test` fails if:

- a penalty's working doesn't add up, on its base numbers or on 25 random draws, or a trap could be mistaken for the answer
- a Chairman's call's "best" option isn't actually best for the club over 20 matchdays in the real simulation

- a `calc` formula doesn't produce the correct option, or a wrong option also matches
- any written sum like `$30 - $12 = $18` in the working, hints or why-nots is wrong (rounded results must say "about")
- any figure in the explanations can't be traced to the question, an option, a checked sum or a declared rule of thumb (`benchmarks`)
- a match is missing a hint, a why-not, a term, or has an em dash, or names a real club, league or player

Writing rules: plain English, short sentences, no em dashes, round numbers a 16-year-old could do on a napkin. Multiply is written ` x `, divide ` / `.

## How it works

- `src/lib/schedule.ts`: matchday from the player's local date. Switches at local midnight.
- `src/lib/save.ts`: one versioned save blob. Club, table and ratings are all worked out from the match records, never stored separately.
- `src/lib/club.ts`, `league.ts`, `skills.ts`, `drills.ts`, `template.ts`: the simulation, table, ratings, spaced repetition and templated questions.
- `src/lib/storage.ts`: localStorage wrapped so it never throws (falls back to memory).
- `src/lib/share.ts`: spoiler-free share text.
- `src/lib/analytics.ts`: Vercel Web Analytics. Completion rate = `/daily/full-time` views / `/daily/kick-off` views (sent as page views so it works on the free plan).
- `src/config.ts`: the public site address used in the share text and Open Graph tags.
- `scripts/make-images.mjs`: regenerates `public/og.png` and the app icons.

## Version 2 hooks

- **Sign-in and synced streaks:** swap the `KeyValueStore` in `src/lib/storage.ts` for one that syncs to a server. `SaveData` is already a single versioned JSON blob keyed by date.
- **Daily leaderboard (Supabase):** `DailyResult` (date, match, goals, hints) is the row to submit.
- **Practice mode:** already in as the training ground (penalty templates with fresh numbers).
- **Club packs:** a pack is `season.json` + a folder of matches (`src/lib/types.ts` `Pack`). Load a different folder for a different business.
