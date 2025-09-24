import { writeFile } from 'node:fs/promises';

export function pickFields(card) {
  // Normalize fields to a flat shape for CSV/export
  return {
    id: card.id ?? '',
    name: card.name ?? '',
    number: card.number ?? '',
    printedTotal: card.set?.printedTotal ?? '',
    setName: card.set?.name ?? '',
    setId: card.set?.id ?? '',
    setSeries: card.set?.series ?? '',
    releaseDate: card.set?.releaseDate ?? '',
    rarity: card.rarity ?? '',
    artist: card.artist ?? '',
    supertype: card.supertype ?? '',
    subtypes: Array.isArray(card.subtypes) ? card.subtypes.join('|') : '',
    smallImage: card.images?.small ?? '',
    largeImage: card.images?.large ?? '',
    tcgplayerUrl: card.tcgplayer?.url ?? '',
  };
}

function toCsvRow(values) {
  // Quote fields with commas/quotes/newlines; escape inner quotes
  return values
    .map((v) => {
      const s = String(v ?? '');
      const needsQuotes = /[",\n]/.test(s);
      const escaped = s.replaceAll('"', '""');
      return needsQuotes ? `"${escaped}"` : escaped;
    })
    .join(',');
}

export function toCsv(obj) {
  const headers = Object.keys(obj);
  const row = headers.map((h) => obj[h]);
  return toCsvRow(headers) + '\n' + toCsvRow(row) + '\n';
}

export async function saveCsv(obj, csvString) {
  const base = obj.id || `${obj.name || 'card'}_${obj.number || 'selection'}`;
  const safe = base.replace(/[^\w.-]+/g, '_');
  const fileName = `card_${safe}.csv`;
  await writeFile(fileName, csvString, 'utf8');
  return fileName;
}
