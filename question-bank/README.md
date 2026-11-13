# MPSC Group C — 10,000 paper-question records

This folder contains 100 complete mock papers × 100 questions = 10,000 JSON records.

## Important distinction
The current batch set is built from **154 distinct source MCQs**. Questions may recur across different papers, as the project requirement permits, but each individual paper has no repeated question wording or concept. Therefore, 10,000 here means 10,000 paper-question placements, **not 10,000 independently researched concepts**. Do not describe this first release as 10,000 unique facts. Expand the source question pool with reviewed new concepts to improve across-paper variety.

## Format
- `questions.json` is a compact manifest listing batch files, paper ranges and record counts.
- `batches/papers-001-010.json` through `batches/papers-091-100.json` each contain ten papers (1,000 records).
- Every record has a globally unique `id`, `paperNo`, `questionNo`, `subject`, `topic`, `difficulty`, `conceptKey`, English and Marathi prompts, four options, the zero-based answer index and bilingual explanations.
- Current Affairs records also carry `source` and `asOfDate` fields.

## Subject distribution per paper
1. History — 10
2. Geography — 8
3. Economy — 16
4. Current Affairs — 16
5. Polity — 15
6. General Science — 15
7. Maths — 12
8. Reasoning — 8

The 20 aptitude questions at the end are split into 12 Maths and 8 Reasoning for this practice portal. The distribution is a practice blueprint, not a permanent official MPSC quota.

## Validate
Run:

```bash
node scripts/validate-question-bank.mjs question-bank/questions.json
```

The validator reads the manifest and all ten batches, then checks all 10,000 slots, global IDs, subject sequence and counts, four-option structure, current-affairs sources/dates, and repeated concept or wording within each paper. Reuse across papers is allowed.
