import { getDb, closeDb } from '../lib/db.mjs';
import { existsSync, readFileSync, appendFileSync, writeFileSync } from 'node:fs';
import { EOL } from 'node:os';

// Keep a fixed column order so files are consistent across runs
const HEADERS = [
  'id', 'name', 'number', 'printedTotal', 'setName', 'setId', 'setSeries', 'releaseDate',
  'rarity', 'artist', 'supertype', 'subtypes', 'smallImage', 'largeImage', 'tcgplayerUrl',
  'language', 'createdAt', 'updatedAt'
];

function toCsvRow(values) {
  return values
    .map((v) => {
      const s = String(v ?? '');
      const needsQuotes = /[",\n]/.test(s);
      const escaped = s.replaceAll('"', '""');
      return needsQuotes ? `"${escaped}"` : escaped;
    })
    .join(',');
}

/** Parse existing CSV just enough to collect the set of IDs.
 *  Assumes first column is `id`, and that `id` does not contain commas/newlines. */
function collectExistingIds(csvPath) {
  if (!existsSync(csvPath)) return new Set();
  const txt = readFileSync(csvPath, 'utf8');
  const lines = txt.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return new Set();

  // If header present and matches, skip it
  let start = 0;
  const headerLine = lines[0];
  const normalizedHeader = headerLine.replace(/\r/g, '');
  if (normalizedHeader === toCsvRow(HEADERS)) {
    start = 1;
  }

  const ids = new Set();
  for (let i = start; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    // First field before the first comma (ids never contain commas in our export)
    const firstComma = line.indexOf(',');
    const id = firstComma === -1 ? line : line.slice(0, firstComma);
    // Remove surrounding quotes if any
    const clean = id.startsWith('"') && id.endsWith('"')
      ? id.slice(1, -1).replace(/""/g, '"')
      : id;
    if (clean) ids.add(clean);
  }
  return ids;
}

function rowFromRecord(rec) {
  return toCsvRow(HEADERS.map((h) => rec[h]));
}

const OUTFILE = 'vault_export.csv';
const db = getDb();

// Load all rows from DB
const rows = db.prepare(`
  SELECT ${HEADERS.join(', ')}
  FROM cards
  ORDER BY createdAt ASC
`).all();

if (!rows.length) {
  console.log('Vault is empty, nothing to export.');
  closeDb();
  process.exit(0);
}

// Ensure file exists with header
if (!existsSync(OUTFILE)) {
  writeFileSync(OUTFILE, toCsvRow(HEADERS) + EOL, 'utf8');
}

// Collect IDs already present in the CSV
const seen = collectExistingIds(OUTFILE);

// Append only new ones
let appended = 0;
for (const rec of rows) {
  if (!seen.has(rec.id)) {
    appendFileSync(OUTFILE, rowFromRecord(rec) + EOL, 'utf8');
    appended++;
  }
}

console.log(
  appended === 0
    ? '✅ CSV is already up to date. No new rows to append.'
    : `✅ Appended ${appended} new ${appended === 1 ? 'row' : 'rows'} to ${OUTFILE}`
);

closeDb();
