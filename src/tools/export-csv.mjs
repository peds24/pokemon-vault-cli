import { getDb, closeDb } from '../lib/db.mjs';
import { writeFileSync } from 'node:fs';

// Escape values safely for CSV
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

const db = getDb();

// Include language column in the export
const rows = db.prepare(`
  SELECT id, name, number, printedTotal, setName, setId, setSeries, releaseDate,
         rarity, artist, supertype, subtypes, smallImage, largeImage, tcgplayerUrl,
         language, createdAt, updatedAt
  FROM cards
  ORDER BY releaseDate ASC
`).all();

if (rows.length === 0) {
  console.log("Vault is empty, nothing to export.");
  closeDb();
  process.exit(0);
}

// Build CSV
const headers = Object.keys(rows[0]);
const csvLines = [toCsvRow(headers)];

for (const row of rows) {
  csvLines.push(toCsvRow(headers.map((h) => row[h])));
}

const csv = csvLines.join('\n') + '\n';

// Save to file
const filename = `vault_export.csv`;
writeFileSync(filename, csv, 'utf8');

console.log(`✅ Exported ${rows.length} cards to ${filename}`);

closeDb();
