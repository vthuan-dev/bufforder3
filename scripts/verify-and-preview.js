const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'dataset-5000-new.json'), 'utf8'));

console.log(`====================================================`);
console.log(`📊 BÁO CÁO KIỂM TRA TẬP DỮ LIỆU SẢN PHẨM MỚI (${data.length} SP)`);
console.log(`====================================================`);

// 1. Phân bổ danh mục
const catMap = {};
const brandMap = {};
let minPrice = Infinity;
let maxPrice = -Infinity;
let wordCountDistribution = {};
const iphone18List = [];

const STOP_WORDS = new Set([
  'and', 'with', 'for', 'the', 'of', 'in', 'on', 'at', 'to', 'a', 'an', 'or', 'by', '&',
  'from', 'as', 'via', 'that', 'which', 'who', 'this', 'these', 'those', 'is', 'are',
  'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
  'but', 'if', 'then', 'else', 'when', 'up', 'down', 'out', 'off', 'over', 'under',
  'again', 'further', 'then', 'once', 'into', 'through', 'during', 'before', 'after',
  'above', 'below', 'w', 'service', 'pcs', 'pack'
]);
const PREFIX_FRAGMENTS = new Set(['non', 'anti', 'multi', 'pre', 'co', 're', 'sub', 'mid', 'semi', 'tri', 'bi', 'w']);

const badEndingTitles = [];
const seenImages = new Set();
let duplicateImageCount = 0;

for (let i = 0; i < data.length; i++) {
  const p = data[i];
  catMap[p.category] = (catMap[p.category] || 0) + 1;
  brandMap[p.brand] = (brandMap[p.brand] || 0) + 1;
  if (p.price < minPrice) minPrice = p.price;
  if (p.price > maxPrice) maxPrice = p.price;

  const words = p.name.split(' ').filter(Boolean);
  const wc = words.length;
  wordCountDistribution[wc] = (wordCountDistribution[wc] || 0) + 1;

  const lastWord = words[words.length - 1].toLowerCase();
  if (STOP_WORDS.has(lastWord) || PREFIX_FRAGMENTS.has(lastWord) || /^\d+$/.test(lastWord)) {
    badEndingTitles.push({ index: i, name: p.name });
  }

  if (seenImages.has(p.image)) {
    duplicateImageCount++;
  } else {
    seenImages.add(p.image);
  }

  if (p.name.includes('iPhone 18')) {
    iphone18List.push(p);
  }
}

console.log('\n--- 1. PHÂN BỔ DANH MỤC ---');
console.log(JSON.stringify(catMap, null, 2));

console.log('\n--- 2. CHẤT LƯỢNG TIÊU ĐỀ SẢN PHẨM ---');
console.log(`• Phân bổ số lượng từ trong tên sản phẩm:`);
console.log(JSON.stringify(wordCountDistribution, null, 2));
console.log(`• Tên sản phẩm kết thúc bằng từ nối/stop-word/tiền tố cụt/số vô nghĩa: ${badEndingTitles.length} (Mục tiêu: 0)`);
if (badEndingTitles.length > 0) {
  console.log('  Các trường hợp chưa đạt:', badEndingTitles.slice(0, 5));
} else {
  console.log('  ✅ 100% tên sản phẩm gọn gàng, tự nhiên, không bị cụt!');
}

console.log('\n--- 3. HÌNH ẢNH SẢN PHẨM ---');
console.log(`• Tổng số ảnh duy nhất: ${seenImages.size}`);
console.log(`• Ảnh trùng lặp trong tập: ${duplicateImageCount}`);

console.log('\n--- 4. DÒNG APPLE IPHONE 18 ĐƯỢC TẠO RIÊNG (13 MODEL) ---');
iphone18List.forEach((p, idx) => console.log(`  ${idx + 1}. ${p.name} - $${p.price}`));

console.log('\n--- 5. 300 SẢN PHẨM QUẦN ÁO / THỜI TRANG MỚI THÊM (SAMPLE) ---');
const clothingItems = data.filter(p => p.category === 'Clothing');
const apparelItems = clothingItems.slice(750);
console.log(`• Tổng sản phẩm Quần áo thời trang (Apparel): ${apparelItems.length} SP`);
console.log('• Mẫu 15 sản phẩm Quần áo tiêu biểu:');
apparelItems.slice(0, 15).forEach((p, idx) => {
  console.log(`  ${idx + 1}. [${p.brand}] ${p.name} - $${p.price}`);
  console.log(`     Ảnh: ${p.image.substring(0, 65)}...`);
});

console.log('\n--- 6. KIỂM TRA SẢN PHẨM CAROTE (TRƯỚC ĐÂY BỊ CỤT TẠI DÒNG 57) ---');
const caroteItems = data.filter(p => p.name.toLowerCase().includes('carote')).slice(0, 5);
caroteItems.forEach((c, idx) => console.log(`  ${idx + 1}. ${c.name} - $${c.price}`));
