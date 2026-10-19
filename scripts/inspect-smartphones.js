const fs = require('fs');
const path = require('path');
const readline = require('readline');

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

const phones = [];
let isHeader = true;

rl.on('line', (line) => {
  if (isHeader) { isHeader = false; return; }
  const cols = parseCSVLine(line);
  if (cols.length >= 9 && cols[2] === 'Smartphones') {
    phones.push({ name: cols[3], img: cols[8], price: cols[5], url: cols[4] });
  }
});

rl.on('close', async () => {
  console.log(`Found ${phones.length} Smartphones in CSV:`);
  for (const p of phones) {
    try {
      const res = await fetch(p.img);
      console.log(res.status, p.name.substring(0, 50), p.img);
    } catch (e) {
      console.log('ERR', p.name.substring(0, 50));
    }
  }
});
