# MPSC Group C — 10,000 unique-question bank

The target is **10,000 genuinely distinct MCQs**, not 10,000 copies/placements of a smaller source pool. The bank will be partitioned into 100 papers of 100 questions each, so each question is used in exactly one paper in the initial 100-paper series. Papers may be shuffled for presentation, but a question must never be assigned to multiple papers in this series.

## Required totals

Every paper follows the agreed subject sequence and counts:

1. History — 10
2. Geography — 8
3. Economy — 16
4. Current Affairs — 16
5. Polity — 15
6. General Science — 15
7. Maths — 12
8. Reasoning — 8

Across 100 papers, the required unique source pool is therefore:

| Subject | Unique questions |
|---|---:|
| History | 1,000 |
| Geography | 800 |
| Economy | 1,600 |
| Current Affairs | 1,600 |
| Polity | 1,500 |
| General Science | 1,500 |
| Maths | 1,200 |
| Reasoning | 800 |
| **Total** | **10,000** |

## Required question record

Each record needs:
- Globally unique `id` and `conceptKey`
- `paperNo` and `questionNo` (one permanent placement in the 100-paper series)
- `subject`, `topic`, and `difficulty`
- Distinct, factually correct English and Marathi question text (`en`, `mr`)
- Exactly four English options (`options`) and four Marathi options (`optionsMr`)
- One zero-based correct answer index (`answer`) shared by both option arrays
- Clear English and Marathi explanations (`explanationEn`, `explanationMr`)
- For Current Affairs: reliable `source` URL and ISO `asOfDate`

Example shape:

```json
{
  "id": 1,
  "paperNo": 1,
  "questionNo": 1,
  "subject": "History",
  "topic": "Social reform movements",
  "difficulty": "medium",
  "conceptKey": "history.social_reform.satyashodhak_foundation",
  "en": "Example English question?",
  "mr": "उदाहरणार्थ मराठी प्रश्न?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "optionsMr": ["पर्याय अ", "पर्याय ब", "पर्याय क", "पर्याय ड"],
  "answer": 0,
  "explanationEn": "Why the correct answer is correct.",
  "explanationMr": "योग्य उत्तराचे स्पष्टीकरण."
}
```

## Uniqueness and quality rules

- All 10,000 questions must be unique across the entire bank, not merely within each paper.
- A fact, concept, formula, calculation method, or reasoning pattern cannot be recycled by changing wording, names, or numbers.
- Each question must have one defensible answer and four plausible distractors.
- Marathi prompts, options, and explanations must be complete and equivalent in meaning to English.
- Maths must cover genuinely different skills and methods; avoid superficial number substitutions.
- Reasoning must vary the underlying logic/pattern, not just the values.
- Current-affairs facts must be date-bounded and verified against reliable sources.
- Do not claim the bank is complete until all 10,000 unique records pass the validator and receive editorial/fact review.

## Current repository status

The previously uploaded 10,000 placements were generated from only **154 distinct source questions**. They do not meet the new global-uniqueness requirement and are a legacy draft, not a completed 10,000-question bank. The stricter validator now rejects repeated English/Marathi wording and repeated `conceptKey` values anywhere in the dataset, and requires Marathi options for every question. Replace the legacy batches with reviewed unique questions before publishing the complete bank.

## File layout and validation

- `questions.json` — manifest for the completed bank.
- `batches/` — ten JSON batches of 1,000 unique questions each.
- `../scripts/validate-question-bank.mjs` — validates the full 10,000-question bank.

Run:

```bash
node scripts/validate-question-bank.mjs question-bank/questions.json
```
