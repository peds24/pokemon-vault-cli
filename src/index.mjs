import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { searchCards } from './lib/pokemontcg.mjs';
import { pickFields, toCsv, saveCsv } from './lib/csv.mjs';

async function main() {
  const rl = createInterface({ input, output });

  try {
    const name = (await rl.question('Card name (e.g., Charizard): ')).trim();
    const setNumber = (await rl.question('Set number (#/#), e.g., 4/102: ')).trim();
    const year = (await rl.question('Year (YYYY), e.g., 1999: ')).trim();

    console.log('\nSearching…');
    const results = await searchCards({ name, setNumber, year });

    if (!results.length) {
      console.log('No results found. Try adjusting name, set number, or year.');
      return;
    }

    console.log('\nMatches:');
    results.forEach((c, i) => {
      const id = c.id ?? '';
      const nm = c.name ?? '';
      const setName = c.set?.name ?? '';
      const number = c.number ?? '';
      const pTotal = c.set?.printedTotal ?? '';
      const rDate = c.set?.releaseDate ?? '';
      const rarity = c.rarity ?? '';
      console.log(
        `${i + 1}. ${nm} — ${setName} — ${number}/${pTotal} — ${rDate}${rarity ? ' — ' + rarity : ''} (${id})`
      );
    });

    let choice;
    while (true) {
      const raw = await rl.question('\nSelect a card (1-5): ');
      const n = Number(raw);
      if (Number.isInteger(n) && n >= 1 && n <= results.length) {
        choice = n - 1;
        break;
      }
      console.log(`Please enter a number between 1 and ${results.length}.`);
    }

    const selected = results[choice];
    const shaped = pickFields(selected);
    const csv = toCsv(shaped);
    const fileName = await saveCsv(shaped, csv);

    console.log(`\nSaved: ${fileName}`);
  } catch (err) {
    console.error('\nError:', err?.message || err);
  }
}

main();
