import Database from 'better-sqlite3';

let db;

/** Open (or create) the local DB and ensure schema exists. */
export function getDb() {
  if (!db) {
    db = new Database('vault.db', { fileMustExist: false });
    db.pragma('journal_mode = WAL');
    initSchema(db);
  }
  return db;
}

function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS cards (
      id TEXT PRIMARY KEY,
      name TEXT,
      number TEXT,
      printedTotal INTEGER,
      setName TEXT,
      setId TEXT,
      setSeries TEXT,
      releaseDate TEXT,
      rarity TEXT,
      artist TEXT,
      supertype TEXT,
      subtypes TEXT,
      smallImage TEXT,
      largeImage TEXT,
      tcgplayerUrl TEXT,
      createdAt TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      updatedAt TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
    );
    CREATE INDEX IF NOT EXISTS idx_cards_set ON cards(setName, setSeries);
    CREATE INDEX IF NOT EXISTS idx_cards_release ON cards(releaseDate);
  `);
}

/** Insert or replace a card object by id (id is the API card id). */
export function upsertCard(cardObj) {
  const db = getDb();
  const stmt = db.prepare(`
  INSERT INTO cards (
    id, name, number, printedTotal, setName, setId, setSeries, releaseDate,
    rarity, artist, supertype, subtypes, smallImage, largeImage, tcgplayerUrl,
    createdAt, updatedAt
  ) VALUES (
    @id, @name, @number, @printedTotal, @setName, @setId, @setSeries, @releaseDate,
    @rarity, @artist, @supertype, @subtypes, @smallImage, @largeImage, @tcgplayerUrl,
    strftime('%Y-%m-%dT%H:%M:%fZ','now'),
    strftime('%Y-%m-%dT%H:%M:%fZ','now')
  )
  ON CONFLICT(id) DO UPDATE SET
    name=excluded.name,
    number=excluded.number,
    printedTotal=excluded.printedTotal,
    setName=excluded.setName,
    setId=excluded.setId,
    setSeries=excluded.setSeries,
    releaseDate=excluded.releaseDate,
    rarity=excluded.rarity,
    artist=excluded.artist,
    supertype=excluded.supertype,
    subtypes=excluded.subtypes,
    smallImage=excluded.smallImage,
    largeImage=excluded.largeImage,
    tcgplayerUrl=excluded.tcgplayerUrl,
    updatedAt=strftime('%Y-%m-%dT%H:%M:%fZ','now');
`);

  const info = stmt.run(cardObj);
  return info; // { changes, lastInsertRowid }
}

/** Optional helper to count cards (for a friendly summary). */
export function countCards() {
  const db = getDb();
  const row = db.prepare(`SELECT COUNT(*) AS n FROM cards`).get();
  return row?.n ?? 0;
}
