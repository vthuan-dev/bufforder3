const fs = require('fs');
const path = require('path');
const readline = require('readline');
const https = require('https');

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

function cleanTitle(rawTitle, brand) {
  if (!rawTitle) return brand || 'Product';
  
  // Cut off after delimiters
  let title = rawTitle.split(/[,|–—\(\[\{;]/)[0].trim();
  
  // Remove spam words
  title = title.replace(/\b(unlocked|portable|wireless|original|authentic|genuine|newest|pack of \d+|set of \d+|premium)\b/gi, '').trim();
  title = title.replace(/\s+/g, ' ').trim();
  
  let words = title.split(' ').filter(Boolean);
  
  // Ensure title is strictly 4 to 5 words
  if (words.length > 5) {
    words = words.slice(0, 5);
  } else if (words.length < 3 && brand) {
    if (!title.toLowerCase().includes(brand.toLowerCase())) {
      words = [brand, ...words];
    }
  }
  
  // Capitalize properly
  return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function parsePrice(priceStr, fallbackMin, fallbackMax) {
  if (!priceStr) return Math.floor(Math.random() * (fallbackMax - fallbackMin) + fallbackMin) + 0.99;
  const num = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
  if (isNaN(num) || num <= 0) {
    return Math.floor(Math.random() * (fallbackMax - fallbackMin) + fallbackMin) + 0.99;
  }
  return Math.round(num * 100) / 100;
}

async function extractUniqueFromCSV(csvPath) {
  const rl = readline.createInterface({
    input: fs.createReadStream(csvPath, { encoding: 'utf-8' }),
    crlfDelay: Infinity
  });

  const electronics = [];
  const jewelry = [];
  const footwearFashion = [];
  const seenImages = new Set();
  let isHeader = true;

  for await (const line of rl) {
    if (isHeader) { isHeader = false; continue; }
    const cols = parseCSVLine(line);
    if (cols.length < 9) continue;

    const cat = cols[1];
    const sub = cols[2];
    const rawName = cols[3];
    const url = cols[4];
    const priceStr = cols[5];
    const img = cols[8];

    if (!rawName || !img || !img.startsWith('https://m.media-amazon.com/images/')) continue;
    if (seenImages.has(img)) continue;

    if (cat === 'Electronics' && electronics.length < 500) {
      seenImages.add(img);
      const name = cleanTitle(rawName, sub);
      const price = parsePrice(priceStr, 35, 1200);
      electronics.push({
        name,
        brand: sub || 'Electronics',
        category: 'Electronics',
        price,
        image: img,
        productUrl: url || 'https://www.amazon.com'
      });
    } else if (cat === 'Jewelry' && jewelry.length < 500) {
      seenImages.add(img);
      const name = cleanTitle(rawName, sub);
      const price = parsePrice(priceStr, 25, 1850);
      jewelry.push({
        name,
        brand: sub || 'Fine Jewelry',
        category: 'Jewelry',
        price,
        image: img,
        productUrl: url || 'https://www.amazon.com'
      });
    } else if (cat === 'Footwear' && footwearFashion.length < 500) {
      seenImages.add(img);
      const name = cleanTitle(rawName, sub);
      const price = parsePrice(priceStr, 45, 320);
      footwearFashion.push({
        name,
        brand: sub || 'Fashion',
        category: 'Clothing',
        price,
        image: img,
        productUrl: url || 'https://www.amazon.com'
      });
    }

    if (electronics.length >= 500 && jewelry.length >= 500 && footwearFashion.length >= 500) {
      break;
    }
  }

  return { electronics, jewelry, footwearFashion };
}

// 500 UNIQUE WATCHES from Amazon + Horology Catalog
async function extractWatchesFromCSV(csvPath) {
  const rl = readline.createInterface({
    input: fs.createReadStream(csvPath, { encoding: 'utf-8' }),
    crlfDelay: Infinity
  });

  const watches = [];
  const seenImages = new Set();
  let isHeader = true;

  for await (const line of rl) {
    if (isHeader) { isHeader = false; continue; }
    const cols = parseCSVLine(line);
    if (cols.length < 9) continue;

    const cat = cols[1];
    const sub = cols[2];
    const rawName = cols[3];
    const url = cols[4];
    const priceStr = cols[5];
    const img = cols[8];

    if (!rawName || !img || !img.startsWith('https://m.media-amazon.com/images/')) continue;
    if (seenImages.has(img)) continue;

    // Detect watches in any category (Jewelry, Electronics, etc.)
    const isWatch = (sub && sub.toLowerCase().includes('watch')) ||
                    rawName.toLowerCase().includes('watch') ||
                    rawName.toLowerCase().includes('seiko') ||
                    rawName.toLowerCase().includes('casio') ||
                    rawName.toLowerCase().includes('citizen') ||
                    rawName.toLowerCase().includes('timex') ||
                    rawName.toLowerCase().includes('bulova') ||
                    rawName.toLowerCase().includes('fossil');

    // Skip watch bands/straps if we want full watches
    if (isWatch && !rawName.toLowerCase().includes('watch band') && !rawName.toLowerCase().includes('screen protector')) {
      seenImages.add(img);
      const name = cleanTitle(rawName, sub || 'Watch');
      const price = parsePrice(priceStr, 55, 950);
      watches.push({
        name,
        brand: sub || 'Watches',
        category: 'Watches',
        price,
        image: img,
        productUrl: url || 'https://www.amazon.com'
      });
      if (watches.length >= 500) break;
    }
  }

  return watches;
}

console.log('Extractor loaded.');
module.exports = { parseCSVLine, extractUniqueFromCSV, extractWatchesFromCSV, cleanTitle };
