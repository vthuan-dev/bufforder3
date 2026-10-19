const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, 'dataset-5000-new.json');
const sqlPath = path.join(__dirname, 'dataset-5300-new.sql');

const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
console.log('📦 Total items in dataset-5000-new.json:', data.length);

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  const clean = String(str)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r/g, '')
    .replace(/\n/g, ' ');
  return `'${clean}'`;
}

const BATCH_SIZE = 500;
let currentBatch = [];
let totalBatches = 0;

let sql = `-- =======================================================
-- Seed 5,300 New Verified Products
-- Generated for Ashford Order Production DB
-- Total records: ${data.length}
-- =======================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

`;

for (let i = 0; i < data.length; i++) {
  const p = data[i];
  const name = escapeSql(p.name);
  const brand = escapeSql(p.brand || 'Generic');
  const cat = escapeSql(p.category);
  const price = (typeof p.price === 'number' && !isNaN(p.price)) ? p.price : 99.99;
  const image = escapeSql(p.image);
  const productUrl = escapeSql(p.productUrl || 'https://ashfordorder.com');
  const isActive = p.isActive === false ? 0 : 1;

  currentBatch.push(`  (${name}, ${brand}, ${cat}, ${price}, ${image}, ${productUrl}, ${isActive}, NOW(), NOW())`);

  if (currentBatch.length === BATCH_SIZE || i === data.length - 1) {
    totalBatches++;
    sql += `INSERT INTO product (name, brand, category, price, image, productUrl, isActive, createdAt, updatedAt) VALUES\n` +
           currentBatch.join(',\n') + ';\n\n';
    currentBatch = [];
  }
}

sql += `SET FOREIGN_KEY_CHECKS = 1;\n`;

fs.writeFileSync(sqlPath, sql, 'utf8');
const stats = fs.statSync(sqlPath);
console.log(`✅ Generated ${sqlPath}`);
console.log(`📊 Total Batches: ${totalBatches}`);
console.log(`💾 File Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
