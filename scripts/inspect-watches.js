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

let watchCount = 0;
let isHeader = true;
const sampleWatches = [];
const subcats = {};

rl.on('line', (line) => {
  if (isHeader) { isHeader = false; return; }
  const cols = parseCSVLine(line);
  if (cols.length >= 9) {
    const name = cols[3];
    const cat = cols[1];
    const subcat = cols[2];
    const img = cols[8];
    if (/watch/i.test(name) || /watch/i.test(subcat)) {
      watchCount++;
      subcats[subcat] = (subcats[subcat] || 0) + 1;
      if (sampleWatches.length < 10) {
        sampleWatches.push({ name, cat, subcat, img });
      }
    }
  }
});

rl.on('close', () => {
  console.log('Total watches found in CSV:', watchCount);
  console.log('Subcats with watches:', subcats);
  console.log('Sample watches:', JSON.stringify(sampleWatches.slice(0, 5), null, 2));
});
