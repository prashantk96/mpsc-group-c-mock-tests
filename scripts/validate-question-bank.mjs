#!/usr/bin/env node
/**
 * Validate the 10,000-question MPSC Group C bank.
 * Usage: node scripts/validate-question-bank.mjs [path-to-questions.json]
 *
 * Semantic duplicate control: every question must have a globally unique
 * conceptKey. Authors must use the same conceptKey when two questions test
 * the same fact, method, formula, or reasoning pattern, even if wording differs.
 */
import fs from "node:fs";

const file = process.argv[2] || "question-bank/questions.json";
const expected = {
  History: 1000,
  Geography: 800,
  Economy: 1600,
  "Current Affairs": 1600,
  Polity: 1500,
  "General Science": 1500,
  Maths: 1200,
  Reasoning: 800,
};
const sequence = [
  ["History", 10], ["Geography", 8], ["Economy", 16],
  ["Current Affairs", 16], ["Polity", 15],
  ["General Science", 15], ["Maths", 12], ["Reasoning", 8],
];
const fail = [];
const norm = (s) => String(s ?? "")
  .normalize("NFKC").toLocaleLowerCase()
  .replace(/[‘’'"​]/g, "")
  .replace(/[^\p{L}\p{N}]+/gu, " ").trim().replace(/\s+/g, " ");

if (!fs.existsSync(file)) {
  console.error(`Question bank not found: ${file}`);
  console.error("Create the JSON file using the schema in question-bank/README.md.");
  process.exit(1);
}

let bank;
try { bank = JSON.parse(fs.readFileSync(file, "utf8")); }
catch (e) { console.error("Invalid JSON:", e.message); process.exit(1); }

if (!Array.isArray(bank)) {
  console.error("The question bank root must be a JSON array.");
  process.exit(1);
}
if (bank.length !== 10000) fail.push(`Expected 10,000 questions; found ${bank.length}.`);

const ids = new Set();
const conceptKeys = new Map();
const english = new Map();
const marathi = new Map();
const counts = Object.fromEntries(Object.keys(expected).map(k => [k, 0]));
const papers = new Map();

for (const [i, q] of bank.entries()) {
  const where = `item ${i + 1}`;
  if (!q || typeof q !== "object") { fail.push(`${where}: not an object.`); continue; }
  if (!Number.isInteger(q.id)) fail.push(`${where}: id must be an integer.`);
  else if (ids.has(q.id)) fail.push(`${where}: duplicate id ${q.id}.`);
  else ids.add(q.id);

  for (const key of ["subject", "en", "mr", "explanationEn", "explanationMr", "conceptKey"]) {
    if (typeof q[key] !== "string" || !q[key].trim()) fail.push(`${where}: missing/empty ${key}.`);
  }
  if (!Array.isArray(q.options) || q.options.length !== 4 || q.options.some(x => typeof x !== "string" || !x.trim())) {
    fail.push(`${where}: options must contain exactly four non-empty strings.`);
  }
  if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) fail.push(`${where}: answer must be 0–3.`);

  if (expected[q.subject] === undefined) fail.push(`${where}: unknown subject "${q.subject}".`);
  else counts[q.subject]++;

  const ck = norm(q.conceptKey);
  if (ck) {
    if (conceptKeys.has(ck)) fail.push(`${where}: semantic duplicate conceptKey also used at item ${conceptKeys.get(ck)} (${q.conceptKey}).`);
    else conceptKeys.set(ck, i + 1);
  }
  for (const [field, map, label] of [["en", english, "English"], ["mr", marathi, "Marathi"]]) {
    const key = norm(q[field]);
    if (key) {
      if (map.has(key)) fail.push(`${where}: duplicate normalized ${label} question also used at item ${map.get(key)}.`);
      else map.set(key, i + 1);
    }
  }

  if (!Number.isInteger(q.paperNo) || q.paperNo < 1 || q.paperNo > 100) fail.push(`${where}: paperNo must be 1–100.`);
  if (!Number.isInteger(q.questionNo) || q.questionNo < 1 || q.questionNo > 100) fail.push(`${where}: questionNo must be 1–100.`);
  if (Number.isInteger(q.paperNo) && Number.isInteger(q.questionNo)) {
    const key = `${q.paperNo}:${q.questionNo}`;
    if (papers.has(key)) fail.push(`${where}: duplicate slot ${key}.`);
    else papers.set(key, q.subject);
    const expectedSubject = sequence.find(([s, n], idx) => {
      const start = sequence.slice(0, idx).reduce((a, x) => a + x[1], 0) + 1;
      return q.questionNo >= start && q.questionNo < start + n;
    })?.[0];
    if (expectedSubject && q.subject !== expectedSubject) {
      fail.push(`${where}: slot ${key} should be ${expectedSubject}, not ${q.subject}.`);
    }
  }
}

for (const [subject, total] of Object.entries(expected)) {
  if (counts[subject] !== total) fail.push(`${subject}: expected ${total}, found ${counts[subject]}.`);
}
if (papers.size !== 10000) fail.push(`Expected 10,000 paper/question slots; found ${papers.size}.`);
for (let p = 1; p <= 100; p++) {
  for (let q = 1; q <= 100; q++) {
    if (!papers.has(`${p}:${q}`)) fail.push(`Missing paper/question slot ${p}:${q}.`);
  }
}

if (fail.length) {
  console.error(`Validation failed with ${fail.length} issue(s):`);
  for (const issue of fail.slice(0, 100)) console.error(" - " + issue);
  if (fail.length > 100) console.error(` ... and ${fail.length - 100} more.`);
  process.exit(1);
}
console.log("PASS: 10,000 bilingual questions; required subject distribution; unique IDs, English/Marathi wording, and globally unique concept keys; complete 100 × 100 paper slots.");
