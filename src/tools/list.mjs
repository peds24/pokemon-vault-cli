import { getDb } from '../lib/db.mjs';

const db = getDb();

const rows = db.prepare(`
  SELECT id, name, number, setName, releaseDate, rarity
  FROM cards
  ORDER BY releaseDate ASC
  LIMIT 20
`).all();

if (rows.length === 0) {
  console.log("Vault is empty.");
} else {
  console.log("Your Vault:");
  rows.forEach((row, i) => {
    console.log(
      `${i + 1}. ${row.name} — ${row.setName} — ${row.number} — ${row.releaseDate} — ${row.rarity}`
    );
  });
}
