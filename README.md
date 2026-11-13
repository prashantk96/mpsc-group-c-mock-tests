# MPSC Group C Mock Test Portal

A responsive static practice-test website built with HTML, CSS and vanilla JavaScript.

## Included
- 100 mock-test slots, each with a 60-minute timer and 100 questions.
- Bilingual question display (English + Marathi).
- Answer selection, question palette, mark-for-review, clear response.
- Automatic submission on timeout.
- +1 correct, -0.25 incorrect, 0 unattempted.
- Answer review with explanations.
- Local browser history and score dashboard.
- GitHub Pages deployment workflow.

## Important content note
This starter release contains a 100-question bilingual practice bank. The 100 paper slots create different deterministic question orders from this bank; they are not 10,000 independently researched questions. Expand `BANK` in `app.js` to add more validated questions. Verify facts and the current official MPSC notification before exam use. Current-affairs questions are intentionally not fabricated or dated beyond verified source material.

## Run locally
Open `index.html` in a modern browser, or serve this folder with any static file server.

## Publish on GitHub Pages
1. Create a public GitHub repository, e.g. `mpsc-group-c-mock-tests`.
2. Upload `index.html`, `app.js`, `style.css`, `README.md`, and `.github/workflows/pages.yml`.
3. In repository Settings → Pages, choose GitHub Actions as the build/deployment source.
4. Push to the `main` branch. GitHub Actions will publish the site.
5. Your URL will be `https://YOUR-USERNAME.github.io/mpsc-group-c-mock-tests/`.

Progress is stored in browser LocalStorage on the device/browser used for the test. It is not synced across devices.
