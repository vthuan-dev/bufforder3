const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, 'dataset-15000-luxury.json');
const sqlPath = path.join(__dirname, 'dataset-15000-luxury.sql');

if (!fs.existsSync(jsonPath)) {
  console.error('JSON dataset does not exist:', jsonPath);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
console.log(`📦 Generating SQL for ${data.length} luxury products...`);

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  const clean = String(str)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r/g, '')
    .replace(/\n/g, ' ')
    .trim();
  return `'${clean}'`;
}

const BATCH_SIZE = 500;
let currentBatch = [];
let totalBatches = 0;

let sql = `-- =======================================================
-- Seed 15,000 Verified Luxury & High-End Products
-- Authentic data from Fashionphile, Ashford, WatchGuys, Beladora
-- Generated at: ${new Date().toISOString()}
-- Total records: ${data.length}
-- =======================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

`;

for (let i = 0; i < data.length; i++) {
  const p = data[i];
  const name = escapeSql(p.name);
  const brand = escapeSql(p.brand || 'Luxury');
  const cat = escapeSql(p.category || 'Luxury Goods');
  const price = typeof p.price === 'number' && !isNaN(p.price) ? p.price : 99.99;
  const image = escapeSql(p.image);
  const productUrl = escapeSql(p.productUrl || 'https://ashfordorder.com');
  const isActive = 1;

  currentBatch.push(
    `  (${name}, ${brand}, ${cat}, ${price}, ${image}, ${productUrl}, ${isActive}, NOW(), NOW())`
  );

  if (currentBatch.length === BATCH_SIZE || i === data.length - 1) {
    totalBatches++;
    sql +=
      `INSERT INTO product (name, brand, category, price, image, productUrl, isActive, createdAt, updatedAt) VALUES\n` +
      currentBatch.join(',\n') +
      ';\n\n';
    currentBatch = [];
  }
}

sql += `SET FOREIGN_KEY_CHECKS = 1;\n`;

fs.writeFileSync(sqlPath, sql, 'utf8');
const stats = fs.statSync(sqlPath);
console.log(`✅ Successfully generated ${sqlPath}`);
console.log(`📊 File Size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
console.log(`📊 Total SQL Batches: ${totalBatches}`);
