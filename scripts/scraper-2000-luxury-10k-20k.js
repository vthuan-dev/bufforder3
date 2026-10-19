const https = require('https');
const fs = require('fs');
const path = require('path');

const outputPath = path.join(__dirname, 'dataset-2000-luxury-10k.json');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function fetchJson(url, retries = 3) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Accept: 'application/json, text/plain, */*',
        },
        timeout: 10000,
      },
      (res) => {
        let raw = '';
        res.on('data', (c) => (raw += c));
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(raw));
            } catch (e) {
              if (retries > 0) setTimeout(() => fetchJson(url, retries - 1).then(resolve).catch(reject), 1000);
              else resolve({ products: [] });
            }
          } else {
            if (retries > 0) setTimeout(() => fetchJson(url, retries - 1).then(resolve).catch(reject), 1500);
            else resolve({ products: [] });
          }
        });
      }
    );
    req.on('error', () => {
      if (retries > 0) setTimeout(() => fetchJson(url, retries - 1).then(resolve).catch(reject), 1500);
      else resolve({ products: [] });
    });
    req.on('timeout', () => {
      req.destroy();
      if (retries > 0) setTimeout(() => fetchJson(url, retries - 1).then(resolve).catch(reject), 1500);
      else resolve({ products: [] });
    });
  });
}

const KNOWN_BRANDS = [
  'Rolex', 'Patek Philippe', 'Audemars Piguet', 'Cartier', 'Omega', 'Tissot', 'Hamilton',
  'Van Cleef & Arpels', 'Tiffany & Co.', 'Bvlgari', 'Chanel', 'Hermès', 'Hermes',
  'Louis Vuitton', 'Gucci', 'Dior', 'Prada', 'Saint Laurent', 'Bottega Veneta',
  'Celine', 'Fendi', 'Balenciaga', 'Goyard', 'Burberry', 'Chloe', 'David Webb', 'David Yurman',
  'Chopard', 'Richard Mille', 'Breitling', 'IWC', 'Panerai', 'Hublot', 'Tudor'
];

function cleanTitle(rawTitle) {
  if (!rawTitle) return '';
  let title = rawTitle
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();

  title = title.replace(/\s*-\s*Pre-Owned$/i, '');
  title = title.replace(/\s*-\s*Unworn$/i, '');
  title = title.replace(/\s*\(Pre-Owned\)$/i, '');
  title = title.replace(/\s*#\w+$/i, '');
  return title.trim();
}

function detectBrand(title, vendor) {
  let v = (vendor || '').trim();
  if (v && v !== 'Beladora' && v !== 'Default' && v !== 'General' && v !== 'Timepiece Perfection') {
    return v;
  }
  const lower = title.toLowerCase();
  for (const b of KNOWN_BRANDS) {
    if (lower.includes(b.toLowerCase())) {
      return b;
    }
  }
  return v || 'Rolex';
}

function normalizeCategory(type, title, defaultCat = 'Watches') {
  const t = (type || '').toLowerCase();
  const titleLower = (title || '').toLowerCase();

  if (t.includes('watch') || titleLower.includes('watch') || titleLower.includes('rolex') || titleLower.includes('patek') || titleLower.includes('audemars') || titleLower.includes('chronograph')) {
    return 'Watches';
  }
  if (t.includes('bag') || t.includes('birkin') || t.includes('kelly') || titleLower.includes('birkin') || titleLower.includes('kelly') || titleLower.includes('flap bag')) {
    return 'Bags & Handbags';
  }
  if (t.includes('ring') || t.includes('bracelet') || t.includes('necklace') || t.includes('jewelry') || titleLower.includes('diamond') || titleLower.includes('bracelet') || titleLower.includes('necklace')) {
    return 'Fine Jewelry';
  }
  return defaultCat;
}

const SOURCES = [
  { name: 'ElementInTime', domain: 'www.elementintime.com', maxPages: 10, defaultCat: 'Watches' },
  { name: 'TimepiecePerfection', domain: 'timepieceperfection.com', maxPages: 10, defaultCat: 'Watches' },
  { name: 'WatchGuys', domain: 'www.watchguys.com', maxPages: 8, defaultCat: 'Watches' },
  { name: 'Beladora', domain: 'www.beladora.com', maxPages: 6, defaultCat: 'Fine Jewelry' },
  { name: 'Fashionphile', domain: 'www.fashionphile.com', maxPages: 40, defaultCat: 'Bags & Handbags' }
];

async function run() {
  console.log('🚀 Đang thu thập ~2.000 sản phẩm Luxury trong dải giá $10,000 - $20,000...');
  const results = [];
  const seenImages = new Set();
  const TARGET_COUNT = 2100;

  for (const src of SOURCES) {
    if (results.length >= TARGET_COUNT) break;
    console.log(`\n📦 Đang quét nguồn [${src.name}] (Tối đa ${src.maxPages} trang)...`);

    for (let page = 1; page <= src.maxPages; page++) {
      if (results.length >= TARGET_COUNT) break;

      const url = `https://${src.domain}/products.json?limit=250&page=${page}`;
      const res = await fetchJson(url);
      const items = res.products || [];

      if (items.length === 0) break;

      let addedInPage = 0;
      for (const item of items) {
        if (results.length >= TARGET_COUNT) break;

        const price = parseFloat(item.variants?.[0]?.price);
        if (isNaN(price) || price < 10000 || price > 20000) continue;

        const title = cleanTitle(item.title);
        if (!title || title.length < 5) continue;

        const imgRaw = item.images?.[0]?.src;
        if (!imgRaw || !imgRaw.startsWith('http')) continue;
        const image = imgRaw.split('?')[0];

        if (seenImages.has(image)) continue;
        seenImages.add(image);

        const brand = detectBrand(title, item.vendor);
        const category = normalizeCategory(item.product_type, title, src.defaultCat);

        results.push({
          name: title.length > 85 ? title.substring(0, 80).trim() + '...' : title,
          brand: brand,
          category: category,
          price: Math.round(price * 100) / 100,
          image: image,
          productUrl: `https://${src.domain}/products/${item.handle || ''}`,
          source: src.name
        });

        addedInPage++;
      }

      console.log(`   Trang ${page}/${src.maxPages}: +${addedInPage} sản phẩm ($10k-$20k) -> Tổng hiện tại: ${results.length}`);
      await sleep(200);
    }
  }

  console.log(`\n🎉 Thu thập hoàn tất! Tổng cộng: ${results.length} sản phẩm từ $10,000 đến $20,000`);
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`💾 Đã lưu dữ liệu tại: ${outputPath}`);
}

run().catch(console.error);
