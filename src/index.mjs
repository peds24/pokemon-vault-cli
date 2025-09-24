import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { searchCards } from './lib/pokemontcg.mjs';
import { shapeCard } from './lib/shape.mjs';
import { upsertCard, countCards, closeDb } from './lib/db.mjs';

async function main() {
  const rl = createInterface({ input, output });

  try {
    while (true) {
      const name = (await rl.question('Card name (e.g., Charizard): ')).trim();
      const setNumber = (await rl.question('Set number (#/#), e.g., 4/102: ')).trim();
      const year = (await rl.question('Year (YYYY), e.g., 1999: ')).trim();
      const languageRaw = (await rl.question('Language (eng/jpn) [eng]: ')).trim().toLowerCase();
      const language = (languageRaw === 'jpn' || languageRaw === 'eng') ? languageRaw : 'eng';
      if (language === 'jpn') {
        console.log('Note: PokémonTCG API is EN-focused; results shown may still be English.\n');
      }

      console.log('\nSearching…');
      const results = await searchCards({ name, setNumber, year });

      if (!results.length) {
        console.log('No results found. Try adjusting name, set number, or year.');
      } else {
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
        const obj = shapeCard(selected, language);
        const info = upsertCard(obj);
        const total = countCards();
        const action = info.changes === 1 ? 'Saved' : 'Updated';
        console.log(`\n${action} card "${obj.name}" (id: ${obj.id}). Total in vault: ${total}`);
      }

      const again = (await rl.question('\nSearch another card? (y/n): ')).trim().toLowerCase();
      if (again !== 'y' && again !== 'yes') {
        console.log('\nGoodbye 👋');
        break;
      }
    }
  } catch (err) {
    console.error('\nError:', err?.message || err);
  } finally {
    // ensure clean exit
    closeDb();
    // readline closes on process exit; explicitly close to be tidy
    // (guarded in case it’s already closed)
    try { process.stdin.pause(); } catch {}
  }
}

main();
