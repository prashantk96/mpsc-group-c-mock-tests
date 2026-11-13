# MPSC Group C Mock Test Portal

A responsive bilingual (English/Marathi) online practice portal for MPSC Group C prelims.

## Test format
- 100 mock tests × 100 questions = 10,000 paper-question records.
- 60-minute timer, +1 for correct and −0.25 for incorrect answers.
- Subject sequence per paper: History (10), Geography (8), Economy (16), Current Affairs (16), Polity (15), General Science (15), Maths (12), Reasoning (8).
- No repeated question wording or concept within an individual paper. Questions may recur in different papers, as requested.
- The site loads the question data from `question-bank/questions.json` and its batch files; questions are no longer embedded in `app.js`.

## Important question-bank note
The current 10,000 records are assigned from **154 distinct source questions**. The same source question may appear in more than one paper, but never twice in the same paper. This meets the agreed cross-paper reuse rule; it does **not** mean the bank contains 10,000 independently researched question concepts. The Maths pool covers 30 different topic-specific questions, and Reasoning has 24 source questions. More independently authored and reviewed source questions are still needed to greatly increase across-paper variety.

Current-affairs records include an official source URL and an as-of date. Refresh them regularly. The subject counts are a practice blueprint, not a permanently guaranteed MPSC quota; verify the latest official notification.

## Files
- `question-bank/questions.json` — manifest for all question batches.
- `question-bank/batches/` — 10 JSON files, 1,000 paper-question records each.
- `scripts/validate-question-bank.mjs` — checks all 10,000 records and per-paper duplication rules.

## Run and deploy
Open the portal through GitHub Pages or a local web server. GitHub Pages deploys through `.github/workflows/pages.yml`.

Progress is stored in browser LocalStorage and is not synced across devices.
