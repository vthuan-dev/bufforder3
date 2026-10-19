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

const iphones = [];
let isHeader = true;

rl.on('line', (line) => {
  if (isHeader) { isHeader = false; return; }
  const cols = parseCSVLine(line);
  if (cols.length >= 9) {
    const name = cols[3];
    const img = cols[8];
    if (/iphone/i.test(name)) {
      iphones.push({ name, img, price: cols[5], url: cols[4] });
    }
  }
});

rl.on('close', async () => {
  console.log(`Found ${iphones.length} iPhones in CSV.`);
  for (const ip of iphones) {
    try {
      const res = await fetch(ip.img);
      console.log(res.status, ip.name.substring(0, 50), ip.img);
    } catch (e) {
      console.log('ERR', ip.name.substring(0, 50));
    }
  }
});
