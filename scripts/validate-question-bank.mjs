#!/usr/bin/env node
/**
 * Validate 100 MPSC papers × 100 questions.
 * Duplicate wording/concepts are prohibited within a paper, but may recur
 * in different papers as requested. IDs remain globally unique.
 *
 * Usage: node scripts/validate-question-bank.mjs [path-to-questions.json]
 */
import fs from "node:fs";
const file = process.argv[2] || "question-bank/questions.json";
const distribution = [
  ["History", 10], ["Geography", 8], ["Economy", 16],
  ["Current Affairs", 16], ["Polity", 15],
  ["General Science", 15], ["Maths", 12], ["Reasoning", 8],
];
const fail = [];
const norm = s => String(s ?? "").normalize("NFKC").toLocaleLowerCase()
  .replace(/[‘’'"​]/g, "").replace(/[^\p{L}\p{N}]+/gu, " ")
  .trim().replace(/\s+/g, " ");
if (!fs.existsSync(file)) {
  console.error(`Question bank not found: ${file}`);
  console.error("See question-bank/README.md for the required schema.");
  process.exit(1);
}
let bank;
try { bank = JSON.parse(fs.readFileSync(file, "utf8")); }
catch (e) { console.error("Invalid JSON:", e.message); process.exit(1); }
if (!Array.isArray(bank)) { console.error("Root must be a JSON array."); process.exit(1); }
if (bank.length !== 10000) fail.push(`Expected 10,000 paper-question records; found ${bank.length}.`);

const ids = new Set();
const slots = new Set();
const perPaper = new Map();
for (const [i, q] of bank.entries()) {
  const at = `record ${i + 1}`;
  if (!q || typeof q !== "object") { fail.push(`${at}: expected object.`); continue; }
  if (!Number.isInteger(q.id)) fail.push(`${at}: id must be integer.`);
  else if (ids.has(q.id)) fail.push(`${at}: duplicate global id ${q.id}.`);
  else ids.add(q.id);
  for (const key of ["subject","en","mr","explanationEn","explanationMr","conceptKey"]) {
    if (typeof q[key] !== "string" || !q[key].trim()) fail.push(`${at}: missing/empty ${key}.`);
  }
  if (!Array.isArray(q.options) || q.options.length !== 4 || q.options.some(x => typeof x !== "string" || !x.trim())) {
    fail.push(`${at}: options must contain four non-empty strings.`);
  }
  if (q.optionsMr !== undefined && (!Array.isArray(q.optionsMr) || q.optionsMr.length !== 4 || q.optionsMr.some(x => typeof x !== "string" || !x.trim()))) {
    fail.push(`${at}: optionsMr, when present, must contain four non-empty Marathi strings.`);
  }
  if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) fail.push(`${at}: answer must be 0–3.`);
  if (!Number.isInteger(q.paperNo) || q.paperNo < 1 || q.paperNo > 100) { fail.push(`${at}: paperNo must be 1–100.`); continue; }
  if (!Number.isInteger(q.questionNo) || q.questionNo < 1 || q.questionNo > 100) { fail.push(`${at}: questionNo must be 1–100.`); continue; }
  const slot = `${q.paperNo}:${q.questionNo}`;
  if (slots.has(slot)) fail.push(`${at}: duplicate slot ${slot}.`);
  slots.add(slot);
  if (!perPaper.has(q.paperNo)) perPaper.set(q.paperNo, { counts: {}, concepts: new Map(), en: new Map(), mr: new Map() });
  const p = perPaper.get(q.paperNo);
  p.counts[q.subject] = (p.counts[q.subject] || 0) + 1;
  const expectedSubject = distribution.find(([subject, count], idx) => {
    const first = distribution.slice(0, idx).reduce((sum, item) => sum + item[1], 0) + 1;
    return q.questionNo >= first && q.questionNo < first + count;
  })?.[0];
  if (expectedSubject && q.subject !== expectedSubject) {
    fail.push(`${at}: paper ${q.paperNo} question ${q.questionNo} must be ${expectedSubject}, not ${q.subject}.`);
  }
  for (const [field, map] of [["conceptKey", p.concepts], ["en", p.en], ["mr", p.mr]]) {
    const key = norm(q[field]);
    if (!key) continue;
    if (map.has(key)) fail.push(`${at}: repeated ${field} within paper ${q.paperNo} (first at question ${map.get(key)}).`);
    else map.set(key, q.questionNo);
  }
  if (q.subject === "Current Affairs" && (!q.source || !q.asOfDate)) {
    fail.push(`${at}: Current Affairs requires source and asOfDate.`);
  }
}
if (slots.size !== 10000) fail.push(`Expected 10,000 unique paper/question slots; found ${slots.size}.`);
for (let paper = 1; paper <= 100; paper++) {
  const p = perPaper.get(paper);
  if (!p) { fail.push(`Paper ${paper} is missing.`); continue; }
  for (const [subject, count] of distribution) {
    if ((p.counts[subject] || 0) !== count) fail.push(`Paper ${paper}: ${subject} expected ${count}, found ${p.counts[subject] || 0}.`);
  }
}
if (fail.length) {
  console.error(`Validation failed: ${fail.length} issue(s).`);
  for (const e of fail.slice(0, 100)) console.error(" - " + e);
  if (fail.length > 100) console.error(` ... and ${fail.length - 100} more.`);
  process.exit(1);
}
console.log("PASS: 100 complete papers, correct subject sequence/distribution, unique IDs, and no repeated question text or concept within any paper.");
