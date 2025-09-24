import { getDb } from '../lib/db.mjs';

const term = process.argv[2]?.toLowerCase() ?? '';
const db = getDb();

let rows;
if (term) {
  rows = db.prepare(`
    SELECT id, name, number, setName, releaseDate, rarity, language
    FROM cards
    WHERE lower(name) LIKE ?
    ORDER BY releaseDate ASC
    LIMIT 50
  `).all(`%${term}%`);
} else {
  rows = db.prepare(`
    SELECT id, name, number, setName, releaseDate, rarity, language
    FROM cards
    ORDER BY releaseDate ASC
    LIMIT 50
  `).all();
}

if (rows.length === 0) {
  console.log(term ? `No cards found for "${term}".` : "Vault is empty.");
} else {
  console.log(term ? `Cards matching "${term}":` : "Your Vault:");
  rows.forEach((row, i) => {
    console.log(
      `${i + 1}. [${row.language}] ${row.name} — ${row.setName} — ${row.number} — ${row.releaseDate} — ${row.rarity}`
    );
  });
}
