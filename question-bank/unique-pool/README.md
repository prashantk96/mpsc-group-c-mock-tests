# Unique question pool — build progress

The unique pool is separate from the legacy 10,000-placement dataset. It contains source questions only; every question is intended to be assigned to exactly one paper.

## Progress

- [x] Questions 1–100 added: `batches/unique-0001-0100.json`
- [x] Draft questions 101–200 added: `batches/unique-0101-0200.json`
- [ ] Remaining 9,800 unique questions
- [ ] Editorial review of factual accuracy, distractors, Marathi equivalence and concept-level uniqueness
- [ ] Build final 100-paper manifest after all 10,000 questions are ready

## First 200 questions

Each 100-question paper follows the agreed blueprint: History 10, Geography 8, Economy 16, Current Affairs 16, Polity 15, General Science 15, Maths 12 and Reasoning 8. The 16 current-affairs records contain source URLs and as-of dates.

These are draft review installments, not a completed 1,000-question batch or the final 10,000-question bank. Questions 101–200 are marked as draft content and should be reviewed for factual accuracy, answer keys, Marathi wording and exam suitability before approval. The original 10,000-placement dataset remains legacy data and must not be used as evidence of global uniqueness.

## Required schema

Each source question has a unique ID and concept key, bilingual prompt, four English options, four Marathi options, answer index, bilingual explanation, and source/date fields for current affairs. A final pool-level validation must reject duplicate concepts and duplicate question wording across all 10,000 questions.
