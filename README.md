# MPSC Group C Mock Test Portal

A responsive bilingual (English/Marathi) online practice portal for MPSC Group C prelims.

## Test format
- 100 questions, 60 minutes, +1 for correct and −0.25 for incorrect.
- Subject blocks follow recent-paper analysis in this order: History (10), Geography (10), Economy (15), Current Affairs (15), Polity (15), General Science (15), Quantitative Aptitude (12), Reasoning (8).
- The paper generator draws from each subject pool independently and preserves this section sequence.
- Each paper is checked to contain 100 unique question IDs. Questions may recur across different papers.
- The 12 quantitative aptitude and 8 reasoning questions are separate blocks within the final 20 questions.

## Question bank limitations
The original bank has a limited number of questions in several subjects. The new generator will stop and display an error if the bank has fewer questions than the required count for any subject. Expand and fact-check the bank before treating these papers as fully varied exam-ready tests. Current affairs must be refreshed against official sources.

## Run and deploy
Open `index.html` locally or publish through GitHub Pages using `.github/workflows/pages.yml`.

Progress is stored in browser LocalStorage and is not synced across devices.
