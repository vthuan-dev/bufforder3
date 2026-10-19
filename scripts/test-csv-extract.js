const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Standard CSV line parser
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

function cleanPrice(priceStr, fallbackMin = 20, fallbackMax = 500) {
  if (!priceStr) return Math.floor(Math.random() * (fallbackMax - fallbackMin) + fallbackMin) + 0.99;
  const num = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
  if (isNaN(num) || num <= 0) {
    return Math.floor(Math.random() * (fallbackMax - fallbackMin) + fallbackMin) + 0.99;
  }
  return Math.round(num * 100) / 100;
}

async function extractFromAmazonCSV(csvPath) {
  const rl = readline.createInterface({
    input: fs.createReadStream(csvPath, { encoding: 'utf-8' }),
    crlfDelay: Infinity
  });

  const electronicsList = [];
  const jewelryList = [];
  let isHeader = true;

  for await (const line of rl) {
    if (isHeader) {
      isHeader = false;
      continue;
    }
    const cols = parseCSVLine(line);
    if (cols.length < 9) continue;

    const category = cols[1];
    const subcategory = cols[2];
    const name = cols[3];
    const productUrl = cols[4];
    const priceStr = cols[5];
    const image = cols[8];

    if (!name || !image || !image.startsWith('http')) continue;

    if (category === 'Electronics' && electronicsList.length < 500) {
      const price = cleanPrice(priceStr, 50, 1500);
      electronicsList.push({
        name,
        brand: subcategory || 'Electronics',
        category: 'Electronics',
        price,
        image,
        productUrl: productUrl || 'https://www.amazon.com',
        source: 'Amazon'
      });
    } else if (category === 'Jewelry' && jewelryList.length < 500) {
      const price = cleanPrice(priceStr, 30, 2000);
      jewelryList.push({
        name,
        brand: subcategory || 'Jewelry',
        category: 'Jewelry',
        price,
        image,
        productUrl: productUrl || 'https://www.amazon.com',
        source: 'Amazon'
      });
    }

    if (electronicsList.length >= 500 && jewelryList.length >= 500) {
      break;
    }
  }

  return { electronicsList, jewelryList };
}

console.log('Script loaded successfully.');
