const fs = require('fs');
const readline = require('readline');
const path = require('path');

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

const rl = readline.createInterface({
  input: fs.createReadStream(path.join(__dirname, '../backend/prisma/archive/amazon_products_cleaned.csv')),
  crlfDelay: Infinity
});

const apparelInCSV = [];
let isHeader = true;

rl.on('line', (line) => {
  if (isHeader) { isHeader = false; return; }
  const cols = parseCSVLine(line);
  if (cols.length >= 9) {
    const name = cols[3];
    const cat = cols[1];
    const subcat = cols[2];
    const img = cols[8];
    if (/\b(jacket|hoodie|shirt|t-shirt|tee|pants|trousers|sweater|coat|sweatshirt|polo|shorts|jeans)\b/i.test(name) ||
        /\b(jacket|hoodie|shirt|t-shirt|tee|pants|sweater|coat|polo|jeans)\b/i.test(subcat)) {
      apparelInCSV.push({ cat, subcat, name, img, price: cols[5], url: cols[4] });
    }
  }
});

rl.on('close', async () => {
  console.log(`Total apparel items found in CSV: ${apparelInCSV.length}`);
  const catBreak = {};
  apparelInCSV.forEach(a => catBreak[a.cat] = (catBreak[a.cat] || 0) + 1);
  console.log('By category in CSV:', catBreak);
  console.log('\nSample 15 apparel items:');
  for (const a of apparelInCSV.slice(0, 15)) {
    try {
      const res = await fetch(a.img);
      console.log(res.status, `[${a.subcat}] ${a.name.substring(0, 45)} -> ${a.img}`);
    } catch (e) {
      console.log('ERR', a.name.substring(0, 45));
    }
  }
});
