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

const watchItems = [];
let isHeader = true;

rl.on('line', (line) => {
  if (isHeader) { isHeader = false; return; }
  const cols = parseCSVLine(line);
  if (cols.length >= 9) {
    const subcat = cols[2];
    const name = cols[3];
    const img = cols[8];
    if (subcat === "Men's watches" || subcat === "Women's watches" || subcat === 'Smartwatches' || subcat === 'Sports watches') {
      watchItems.push({ name, subcat, img, price: cols[5], url: cols[4] });
    }
  }
});

rl.on('close', async () => {
  const menWatches = watchItems.filter(w => w.subcat === "Men's watches");
  const womenWatches = watchItems.filter(w => w.subcat === "Women's watches");
  console.log(`Men's watches: ${menWatches.length}`);
  menWatches.slice(0, 10).forEach(w => console.log(`• ${w.name.substring(0, 50)} -> ${w.img}`));
  console.log(`\nWomen's watches: ${womenWatches.length}`);
  womenWatches.slice(0, 10).forEach(w => console.log(`• ${w.name.substring(0, 50)} -> ${w.img}`));
});
