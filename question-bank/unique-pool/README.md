# Unique question pool — build progress

The unique pool is separate from the legacy 10,000-placement dataset. It contains source questions only; every question is intended to be assigned to exactly one paper.

## Progress

- [x] First 100 unique source questions added: `batches/unique-0001-0100.json`
- [ ] Remaining 9,900 unique questions
- [ ] Editorial review of factual accuracy, distractors, Marathi equivalence and concept-level uniqueness
- [ ] Build final 100-paper manifest after all 10,000 questions are ready

## First 100 questions

This first set follows the agreed per-paper blueprint: History 10, Geography 8, Economy 16, Current Affairs 16, Polity 15, General Science 15, Maths 12 and Reasoning 8. The 16 current-affairs records contain source URLs and as-of dates.

The file is a first content installment, not the completed 1,000-question batch or the final 10,000-question bank. The original 10,000-placement dataset remains legacy data and must not be used as evidence of global uniqueness.

## Required schema

Each source question has a unique ID and concept key, bilingual prompt, four English options, four Marathi options, answer index, bilingual explanation, and source/date fields for current affairs. A final pool-level validation must reject duplicate concepts and duplicate question wording across all 10,000 questions.
