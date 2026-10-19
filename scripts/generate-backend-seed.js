const fs = require('fs');
const path = require('path');

const listPath = path.join(__dirname, '100-verified-products.json');
const list = JSON.parse(fs.readFileSync(listPath, 'utf8'));

const fileContent = `const prisma = require('./lib/prisma');

const products = ${JSON.stringify(list, null, 2)};

async function seed100Products() {
  console.log('🚀 Bắt đầu seed 100 sản phẩm mới vào database...');
  console.log('📦 Tổng sản phẩm chuẩn bị:', products.length);

  try {
    let added = 0;
    for (const p of products) {
      const existing = await prisma.product.findFirst({
        where: { name: p.name }
      });

      if (!existing) {
        await prisma.product.create({
          data: {
            name: p.name,
            brand: p.brand,
            category: p.category,
            price: parseFloat(p.price),
            image: p.image,
            productUrl: p.productUrl || 'https://ashfordorder.com',
            isActive: true
          }
        });
        added++;
      }
    }

    const totalNow = await prisma.product.count();
    console.log(\`\\n✅ Đã thêm mới: \${added} sản phẩm!\`);
    console.log(\`📊 Tổng số sản phẩm trong DB: \${totalNow} sản phẩm!\`);
  } catch (error) {
    console.error('❌ Lỗi khi seed sản phẩm:', error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

seed100Products();
`;

fs.writeFileSync(path.join(__dirname, '..', 'backend', 'seed-100-curated.js'), fileContent);
console.log('✅ Generated backend/seed-100-curated.js successfully!');
