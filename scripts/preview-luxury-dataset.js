const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, 'dataset-15000-luxury.json');

if (!fs.existsSync(jsonPath)) {
  console.error('Dataset file does not exist yet at:', jsonPath);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
console.log('=====================================================');
console.log(`📦 TOTAL PRODUCTS HARVESTED: ${data.length}`);
console.log('=====================================================\n');

// Stats by Source
const bySource = {};
const byCategory = {};
const byBrand = {};
const priceTiers = {
  'Under $500': 0,
  '$500 - $1,200 (Core Task Range)': 0,
  '$1,200 - $5,000 (High-End)': 0,
  'Over $5,000 (Ultra Luxury)': 0,
};

let invalidNames = 0;
let invalidPrices = 0;
let invalidImages = 0;

data.forEach((p) => {
  bySource[p.source] = (bySource[p.source] || 0) + 1;
  byCategory[p.category] = (byCategory[p.category] || 0) + 1;
  byBrand[p.brand] = (byBrand[p.brand] || 0) + 1;

  if (p.price < 500) priceTiers['Under $500']++;
  else if (p.price <= 1200) priceTiers['$500 - $1,200 (Core Task Range)']++;
  else if (p.price <= 5000) priceTiers['$1,200 - $5,000 (High-End)']++;
  else priceTiers['Over $5,000 (Ultra Luxury)']++;

  if (!p.name || p.name.length < 5 || p.name.length > 120) invalidNames++;
  if (!p.price || isNaN(p.price) || p.price <= 0) invalidPrices++;
  if (!p.image || !p.image.startsWith('https://')) invalidImages++;
});

console.log('📊 Phân bổ theo Nguồn (Source):');
Object.entries(bySource).forEach(([k, v]) => console.log(`   • ${k.padEnd(20)}: ${v} sản phẩm`));

console.log('\n📊 Phân bổ theo Danh mục (Category):');
Object.entries(byCategory).forEach(([k, v]) => console.log(`   • ${k.padEnd(25)}: ${v} sản phẩm`));

console.log('\n📊 Phân bổ theo Dải giá (Price Tiers):');
Object.entries(priceTiers).forEach(([k, v]) => console.log(`   • ${k.padEnd(35)}: ${v} sản phẩm`));

console.log('\n💎 Top 15 Thương hiệu xuất hiện nhiều nhất:');
const topBrands = Object.entries(byBrand).sort((a, b) => b[1] - a[1]).slice(0, 15);
topBrands.forEach(([b, c]) => console.log(`   • ${b.padEnd(25)}: ${c} sản phẩm`));

console.log('\n🛡️ Kiểm tra chất lượng kỹ thuật:');
console.log(`   • Tên không hợp lệ / quá dài: ${invalidNames}`);
console.log(`   • Giá lỗi (<= 0 hoặc null)  : ${invalidPrices}`);
console.log(`   • Ảnh lỗi (không phải https): ${invalidImages}`);

console.log('\n🔍 Mẫu 10 sản phẩm ngẫu nhiên để duyệt chất lượng:');
const sample = [];
const step = Math.floor(data.length / 10);
for (let i = 0; i < 10; i++) {
  sample.push(data[i * step]);
}

sample.forEach((p, idx) => {
  console.log(`\n[#${idx + 1}] [${p.brand}] ${p.name}`);
  console.log(`    Danh mục: ${p.category} | Giá: $${p.price.toLocaleString('en-US')} | Nguồn: ${p.source}`);
  console.log(`    Ảnh: ${p.image}`);
});
