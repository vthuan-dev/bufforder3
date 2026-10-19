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
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
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

const csvPath = path.join(__dirname, '../backend/prisma/archive/amazon_products_cleaned.csv');
const rl = readline.createInterface({
  input: fs.createReadStream(csvPath),
  crlfDelay: Infinity
});

const catCounts = {};
const subcatCounts = {};
let total = 0;
let isHeader = true;

rl.on('line', (line) => {
  if (isHeader) { isHeader = false; return; }
  total++;
  const cols = parseCSVLine(line);
  if (cols.length >= 3) {
    const cat = cols[1];
    const subcat = cols[2];
    catCounts[cat] = (catCounts[cat] || 0) + 1;
    if (!subcatCounts[cat]) subcatCounts[cat] = {};
    subcatCounts[cat][subcat] = (subcatCounts[cat][subcat] || 0) + 1;
  }
});

rl.on('close', () => {
  console.log('Total rows in CSV:', total);
  console.log('Categories:');
  for (const [cat, count] of Object.entries(catCounts)) {
    console.log(`- ${cat}: ${count}`);
    const topSubs = Object.entries(subcatCounts[cat] || {}).sort((a,b) => b[1] - a[1]).slice(0, 10);
    console.log('  Top subcats:', topSubs.map(([s, c]) => `${s} (${c})`).join(', '));
  }
});
