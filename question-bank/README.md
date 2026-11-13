# MPSC Group C — 10,000-question bank

This folder holds the independently authored bilingual question bank. The target is 100 papers × 100 questions = 10,000 unique questions.

## Required JSON schema

Each array item must use this structure (the sample is illustrative, not an exam question):

```json
{
  "id": 1,
  "paperNo": 1,
  "questionNo": 1,
  "subject": "History",
  "topic": "Social reform movements",
  "difficulty": "medium",
  "conceptKey": "history.social_reform.satyashodhak_founder",
  "en": "English question text",
  "mr": "मराठी प्रश्न",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "optionsMr": ["पर्याय अ", "पर्याय ब", "पर्याय क", "पर्याय ड"],
  "answer": 0,
  "explanationEn": "Explanation in English.",
  "explanationMr": "मराठीत स्पष्टीकरण."
}
```

## Non-negotiable quality rules

- IDs are globally unique integers 1–10000. Each paper has questionNo 1–100.
- Every question has a `conceptKey`. The same question/concept may appear in different papers, but must not repeat within one paper. Rewording the same fact, method, formula, or reasoning pattern does not make it a new question.
- English and Marathi prompts must be equivalent, not literal mistranslations.
- Exactly four plausible options; one unambiguous correct answer.
- The correct answer index is zero-based and applies to both language option arrays.
- Include an explanation in both languages.
- Every paper has exactly 100 questions in the agreed order and counts:
  1. History — 10
  2. Geography — 8
  3. Economy — 16
  4. Current Affairs — 16
  5. Polity — 15
  6. General Science — 15
  7. Maths — 12
  8. Reasoning — 8
- No duplicate English or Marathi question wording; no semantic duplicates (review `conceptKey` manually).
- Maths must vary the underlying skill and method, not merely substitute numbers. Reasoning must vary the actual pattern/logic.
- Current-affairs items must include a source and an `asOfDate` field, and be checked against a reliable dated source before release.

## Files

- `questions.json` — final 10,000-question array (not populated until reviewed batches are ready).
- `batches/` — working batch files, 1,000 questions each.
- `../scripts/validate-question-bank.mjs` — structural, distribution, slot and duplicate-key validator.

## Validate

Run:

```bash
node scripts/validate-question-bank.mjs question-bank/questions.json
```

The validator checks exact normalized duplicates and repeated `conceptKey` values within each paper; repetition across papers is allowed. A script cannot reliably prove semantic uniqueness on its own: each batch must also undergo editorial review before merging. Do not claim the bank is complete until all 10,000 records pass validation and fact-checking.
