# Pokémon Vault CLI

A command-line tool for searching Pokémon cards with the [Pokémon TCG API](https://pokemontcg.io/), saving them to a local SQLite vault, and exporting your collection to CSV.  

---

## Quickstart Example

```bash
# Start the CLI
npm start
```

Example session:

```
Card name (e.g., Charizard): Charizard
Set number (#/#), e.g., 4/102: 4/102
Year (YYYY), e.g., 1999: 1999
Language (eng/jpn) [eng]: eng

Searching…

Matches:
1. Charizard — Base Set — 4/102 — 1999/01/09 — Rare Holo (base1-4)

Select a card (1-5): 1

Saved card "Charizard" (id: base1-4). Total in vault: 1

Search another card? (y/n): n

Goodbye
```

Then, check your vault:

```bash
npm run vault
```

Output:
```
Your Vault:
1. [eng] Charizard — Base Set — 4/102 — 1999/01/09 — Rare Holo
```

Export to CSV:

```bash
npm run export
```

Creates `vault_export.csv` with one row per card.

---

## Features
- Search cards by **name**, **set number (#/#)**, **year**, and **language** (`eng`/`jpn`)  
- Save selected cards into a **local SQLite database** (`vault.db`)  
- Loop search (keep adding until you choose exit)  
- View your vault and filter by name  
- Export your vault to CSV (full dump or append-only mode)  
- Clear your vault with a single command  

---

## Setup

### 1. Clone and install
```bash
git clone https://github.com/yourname/pokemon-vault-cli.git
cd pokemon-vault-cli
npm install
```

### 2. Get an API key
Create a free key at [dev.pokemontcg.io](https://dev.pokemontcg.io/).  

### 3. Create `.env`
In the project root:
```ini
POKEMONTCG_API_KEY=your_api_key_here
```

### 4. `.gitignore`
Your `.env` and database are ignored by default:
```
.env
vault.db
```

---

## Usage

### Start the CLI
```bash
npm start
```

---

## Vault Management

List your vault:
```bash
npm run vault
```

Filter by name:
```bash
npm run vault charizard
```

---

## Export to CSV

Full export (overwrites file):
```bash
npm run export
```

Append-only export (only new cards):
```bash
npm run export:append
```

---

## Clear the Vault

Delete all saved cards:
```bash
npm run clear
```

---

## Project Structure
```
src/
  index.mjs           # Main CLI flow
  lib/
    pokemontcg.mjs    # API calls to PokémonTCG
    shape.mjs         # Normalize card object fields
    db.mjs            # SQLite helpers
  tools/
    list.mjs          # List vault contents
    export-csv.mjs    # Full export
    export-append-csv.mjs # Append-only export
    clear.mjs         # Clear vault
```

---

## Roadmap (Future Ideas)
- Support multiple databases (e.g., Postgres/Supabase)  
- Add secondary API for Japanese sets  
- Pretty-print CLI with colors  
- Stats command (total per set, per rarity, etc.)  
