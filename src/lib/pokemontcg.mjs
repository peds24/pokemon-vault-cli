import { fetch } from 'undici';
import 'dotenv/config';

const API_BASE = 'https://api.pokemontcg.io/v2/cards';
const API_KEY = process.env.POKEMONTCG_API_KEY;

function ensureApiKey() {
  if (!API_KEY) {
    throw new Error('Missing POKEMONTCG_API_KEY env var. Set it and run again.');
  }
}

function parseSetNumber(input) {
  // Accept formats like "4/102" (spaces allowed)
  const m = (input || '').match(/^\s*(\d+)\s*\/\s*(\d+)\s*$/);
  if (!m) return { num: null, denom: null };
  return { num: m[1], denom: m[2] };
}

function buildQuery({ name, num, denom }) {
  // Example q: name:"charizard" number:4 set.printedTotal:102
  const safeName = (name || '').replaceAll('"', '\\"').trim();
  const parts = [];
  if (safeName) parts.push(`name:"${safeName}"`);
  if (num) parts.push(`number:${num}`);
  if (denom) parts.push(`set.printedTotal:${denom}`);
  return parts.join(' ');
}

/**
 * searchCards
 * @param {{name:string, setNumber:string, year:string}} params
 * @returns {Promise<Array>}
 */
export async function searchCards({ name, setNumber, year }) {
  ensureApiKey();

  const { num, denom } = parseSetNumber(setNumber);
  const q = buildQuery({ name, num, denom });

  const url = new URL(API_BASE);
  if (q) url.searchParams.set('q', q);
  url.searchParams.set('pageSize', '50');
  url.searchParams.set('orderBy', '-set.releaseDate'); // newest first

  const res = await fetch(url, {
    headers: {
      'X-Api-Key': API_KEY,
      'Accept': 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API error ${res.status}: ${text || res.statusText}`);
  }

  const json = await res.json();
  const all = Array.isArray(json?.data) ? json.data : [];

  // Filter by year if provided (set.releaseDate like "1999/01/09")
  const filtered = year
    ? all.filter((c) => (c.set?.releaseDate || '').startsWith(String(year)))
    : all;

  return filtered.slice(0, 5);
}
