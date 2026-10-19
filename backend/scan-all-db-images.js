const prisma = require('./lib/prisma');

async function checkAllImages() {
  console.log('🚀 Bắt đầu quét toàn bộ ảnh sản phẩm trên VPS Database...\n');

  const products = await prisma.product.findMany({
    select: { id: true, name: true, image: true, category: true, price: true, isActive: true }
  });

  console.log(`📊 Tổng số sản phẩm trong DB: ${products.length}\n`);

  // 1. Phân loại theo Domain
  const domainStats = {};
  const nullImages = [];
  const invalidUrls = [];

  products.forEach(p => {
    if (!p.image || p.image.trim() === '') {
      nullImages.push(p);
      return;
    }
    if (!p.image.startsWith('http://') && !p.image.startsWith('https://')) {
      invalidUrls.push(p);
      return;
    }
    try {
      const u = new URL(p.image);
      domainStats[u.hostname] = (domainStats[u.hostname] || 0) + 1;
    } catch {
      invalidUrls.push(p);
    }
  });

  console.log('🌐 Thống kê domain ảnh:');
  Object.entries(domainStats)
    .sort((a, b) => b[1] - a[1])
    .forEach(([domain, count]) => {
      console.log(`   - ${domain}: ${count} ảnh`);
    });

  if (nullImages.length > 0) {
    console.log(`\n❌ Sản phẩm KHÔNG có ảnh (null/rỗng): ${nullImages.length}`);
  }
  if (invalidUrls.length > 0) {
    console.log(`❌ Sản phẩm URL không hợp lệ: ${invalidUrls.length}`);
  }

  // 2. Test HTTP status cho tất cả domain hoặc sản phẩm
  console.log('\n🧪 Bắt đầu test tải thử ảnh thực tế qua HTTP...');
  
  // Test distinct URLs first to be super fast
  const uniqueUrls = [...new Set(products.map(p => p.image).filter(Boolean))];
  console.log(`   Số lượng URL duy nhất cần kiểm tra: ${uniqueUrls.length}`);

  const urlStatusMap = new Map();
  const concurrency = 25;
  let finished = 0;

  for (let i = 0; i < uniqueUrls.length; i += concurrency) {
    const chunk = uniqueUrls.slice(i, i + concurrency);
    await Promise.all(chunk.map(async (url) => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);
        const res = await fetch(url, {
          method: 'HEAD',
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: controller.signal
        });
        clearTimeout(timeout);

        if (res.ok) {
          urlStatusMap.set(url, { ok: true, status: res.status });
        } else {
          // If HEAD returns 403 or 405, try GET with range 0-1000
          const getRes = await fetch(url, {
            method: 'GET',
            headers: { 'User-Agent': 'Mozilla/5.0', 'Range': 'bytes=0-1000' }
          });
          if (getRes.ok || getRes.status === 206) {
            urlStatusMap.set(url, { ok: true, status: getRes.status });
          } else {
            urlStatusMap.set(url, { ok: false, status: getRes.status });
          }
        }
      } catch (err) {
        urlStatusMap.set(url, { ok: false, error: err.name || 'FetchError' });
      } finally {
        finished++;
        if (finished % 200 === 0 || finished === uniqueUrls.length) {
          process.stdout.write(`\r   Tiến độ kiểm tra: ${finished}/${uniqueUrls.length} URLs...`);
        }
      }
    }));
  }

  console.log('\n\n📋 TỔNG KẾT KIỂM TRA ẢNH:');

  const deadProducts = [];
  const okProducts = [];

  products.forEach(p => {
    if (!p.image) {
      deadProducts.push({ ...p, reason: 'Ảnh null/rỗng' });
      return;
    }
    const st = urlStatusMap.get(p.image);
    if (!st || !st.ok) {
      deadProducts.push({ ...p, reason: st ? `HTTP ${st.status || st.error}` : 'Lỗi URL' });
    } else {
      okProducts.push(p);
    }
  });

  console.log(`✅ Số sản phẩm ảnh HOẠT ĐỘNG TỐT: ${okProducts.length}`);
  console.log(`❌ Số sản phẩm ảnh BỊ LỖI / CHẾT: ${deadProducts.length}`);

  if (deadProducts.length > 0) {
    console.log('\n🚨 Danh sách 20 sản phẩm bị lỗi ảnh đầu tiên:');
    deadProducts.slice(0, 20).forEach((p, idx) => {
      console.log(`   ${idx + 1}. [ID: ${p.id}] ${p.name} | Lỗi: ${p.reason} | URL: ${p.image}`);
    });
  }

  await prisma.$disconnect();
}

checkAllImages().catch(console.error);
