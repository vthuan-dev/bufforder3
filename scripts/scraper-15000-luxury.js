const https = require('https');
const fs = require('fs');
const path = require('path');

// Target output
const outputPath = path.join(__dirname, 'dataset-15000-luxury.json');

// Helper to delay between requests
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper HTTP fetch with retry
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
              const data = JSON.parse(raw);
              resolve(data);
            } catch (e) {
              if (retries > 0) {
                setTimeout(() => fetchJson(url, retries - 1).then(resolve).catch(reject), 1000);
              } else {
                resolve({ products: [] });
              }
            }
          } else {
            if (retries > 0) {
              setTimeout(() => fetchJson(url, retries - 1).then(resolve).catch(reject), 1500);
            } else {
              resolve({ products: [] });
            }
          }
        });
      }
    );
    req.on('error', (err) => {
      if (retries > 0) {
        setTimeout(() => fetchJson(url, retries - 1).then(resolve).catch(reject), 1500);
      } else {
        resolve({ products: [] });
      }
    });
    req.on('timeout', () => {
      req.destroy();
      if (retries > 0) {
        setTimeout(() => fetchJson(url, retries - 1).then(resolve).catch(reject), 1500);
      } else {
        resolve({ products: [] });
      }
    });
  });
}

// Brand normalizer mapping
const KNOWN_BRANDS = [
  'Rolex', 'Patek Philippe', 'Audemars Piguet', 'Cartier', 'Omega', 'Tissot', 'Hamilton',
  'Van Cleef & Arpels', 'Tiffany & Co.', 'Bvlgari', 'Chanel', 'Hermès', 'Hermes',
  'Louis Vuitton', 'Gucci', 'Dior', 'Prada', 'Saint Laurent', 'Bottega Veneta',
  'Celine', 'Fendi', 'Balenciaga', 'Goyard', 'Burberry', 'Chloe', 'Chloé',
  'David Yurman', 'David Webb', 'Chopard', 'Seiko', 'Longines', 'Rado', 'Citizen',
  'Ray-Ban', 'Tom Ford', 'Oakley', 'Calvin Klein', 'Swarovski', 'Bulova', 'Mido'
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

  // Strip common noisy prefixes/suffixes
  title = title.replace(/\s*-\s*Pre-Owned$/i, '');
  title = title.replace(/\s*-\s*Unworn$/i, '');
  title = title.replace(/\s*\(Pre-Owned\)$/i, '');
  title = title.replace(/\s*#\w+$/i, ''); // e.g. trailing item code
  return title.trim();
}

function detectBrand(title, vendor) {
  let v = (vendor || '').trim();
  if (v && v !== 'Beladora' && v !== 'Default' && v !== 'Ashford' && v !== 'General') {
    return v;
  }
  // Try to match known luxury brand from title
  const lower = title.toLowerCase();
  for (const b of KNOWN_BRANDS) {
    if (lower.includes(b.toLowerCase())) {
      return b;
    }
  }
  return v || 'Luxury Collection';
}

function normalizeCategory(type, title, defaultCat = 'Luxury Goods') {
  const t = (type || '').toLowerCase();
  const titleLower = (title || '').toLowerCase();

  if (t.includes('watch') || titleLower.includes('watch') || titleLower.includes('chronograph') || titleLower.includes('powermatic')) {
    return 'Watches';
  }
  if (t.includes('bag') || t.includes('tote') || t.includes('satchel') || t.includes('crossbody') || t.includes('clutch') || t.includes('wallet') ||
      titleLower.includes('bag') || titleLower.includes('tote') || titleLower.includes('satchel') || titleLower.includes('speedy') || titleLower.includes('birkin') || titleLower.includes('kelly')) {
    return 'Bags & Handbags';
  }
  if (t.includes('ring') || t.includes('earring') || t.includes('necklace') || t.includes('bracelet') || t.includes('brooch') || t.includes('pin') || t.includes('jewelry') ||
      titleLower.includes('diamond') || titleLower.includes('gold') || titleLower.includes('earring') || titleLower.includes('bracelet') || titleLower.includes('necklace')) {
    return 'Fine Jewelry';
  }
  if (t.includes('glass') || t.includes('sunglass') || t.includes('eyewear') || titleLower.includes('glasses') || titleLower.includes('sunglasses')) {
    return 'Eyewear & Accessories';
  }
  if (t.includes('shoe') || t.includes('sneaker') || t.includes('boot') || t.includes('apparel') || t.includes('jacket') || t.includes('coat')) {
    return 'Shoes & Apparel';
  }
  return defaultCat;
}

// Scrape source configuration
const SOURCES = [
  {
    name: 'Fashionphile',
    domain: 'www.fashionphile.com',
    maxPages: 28, // 28 * 250 = ~7,000 items
    defaultCat: 'Bags & Handbags',
  },
  {
    name: 'Ashford',
    domain: 'www.ashford.com',
    maxPages: 25, // 25 * 250 = ~6,250 items
    defaultCat: 'Watches',
  },
  {
    name: 'WatchGuys',
    domain: 'www.watchguys.com',
    maxPages: 8, // 8 * 250 = ~2,000 items
    defaultCat: 'Watches',
  },
  {
    name: 'Beladora',
    domain: 'www.beladora.com',
    maxPages: 6, // 6 * 250 = ~1,500 items
    defaultCat: 'Fine Jewelry',
  },
];

async function run() {
  console.log('🚀 Starting Luxury Products Scraper (Target: ~15,000 products)...');
  const allProducts = [];
  const seenKeys = new Set();

  for (const src of SOURCES) {
    console.log(`\n📦 Scraping from [${src.name}] (Max ${src.maxPages} pages)...`);
    let srcCount = 0;

    for (let page = 1; page <= src.maxPages; page++) {
      const url = `https://${src.domain}/products.json?limit=250&page=${page}`;
      process.stdout.write(`   Fetching page ${page}/${src.maxPages}... `);
      
      const res = await fetchJson(url);
      const items = res.products || [];

      if (items.length === 0) {
        console.log(`No more products on page ${page}. Ending source early.`);
        break;
      }

      let validInPage = 0;
      for (const item of items) {
        const title = cleanTitle(item.title);
        if (!title || title.length < 5) continue;

        const price = parseFloat(item.variants?.[0]?.price);
        if (isNaN(price) || price <= 0) continue;

        const imgRaw = item.images?.[0]?.src;
        if (!imgRaw || typeof imgRaw !== 'string' || !imgRaw.startsWith('http')) continue;

        // Clean image URL (keep full res)
        const image = imgRaw.split('?')[0]; // strip query string for pure CDN link

        // Deduplicate key
        const key = `${title.toLowerCase()}_${Math.round(price)}`;
        if (seenKeys.has(key)) continue;
        seenKeys.add(key);

        const brand = detectBrand(title, item.vendor);
        const category = normalizeCategory(item.product_type, title, src.defaultCat);

        allProducts.push({
          name: title,
          brand: brand,
          category: category,
          price: Math.round(price * 100) / 100,
          image: image,
          productUrl: `https://${src.domain}/products/${item.handle || ''}`,
          source: src.name,
        });

        validInPage++;
        srcCount++;
      }

      console.log(`added ${validInPage} valid items (Total so far: ${allProducts.length})`);
      await sleep(250); // Be respectful to CDN
    }
    console.log(`✅ [${src.name}] finished. Harvested ${srcCount} unique items.`);
  }

  console.log(`\n🎉 Scraping Completed! Total unique valid products: ${allProducts.length}`);
  fs.writeFileSync(outputPath, JSON.stringify(allProducts, null, 2), 'utf8');
  console.log(`💾 Saved dataset to: ${outputPath}`);
}

run().catch((err) => {
  console.error('Fatal error in scraper:', err);
  process.exit(1);
});
