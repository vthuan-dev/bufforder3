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

async function analyzeKeywords() {
  const csvPath = path.join(__dirname, '../backend/prisma/archive/amazon_products_cleaned.csv');
  const rl = readline.createInterface({
    input: fs.createReadStream(csvPath, { encoding: 'utf-8' }),
    crlfDelay: Infinity
  });

  const categories = {};
  let isHeader = true;

  for await (const line of rl) {
    if (isHeader) { isHeader = false; continue; }
    const cols = parseCSVLine(line);
    const cat = cols[1] || 'Unknown';
    categories[cat] = (categories[cat] || 0) + 1;
  }

  console.log('Categories count in CSV:');
  console.log(JSON.stringify(categories, null, 2));
}

analyzeKeywords();
