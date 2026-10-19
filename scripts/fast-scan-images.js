const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'dataset-5000-new.json'), 'utf8'));
console.log(`Checking all ${data.length} products...`);

const agentHttps = new https.Agent({ keepAlive: true, maxSockets: 40 });
const agentHttp = new http.Agent({ keepAlive: true, maxSockets: 40 });

function checkUrl(url) {
  return new Promise((resolve) => {
    try {
      const u = new URL(url);
      const client = u.protocol === 'https:' ? https : http;
      const req = client.get(url, {
        agent: u.protocol === 'https:' ? agentHttps : agentHttp,
        timeout: 4000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }, (res) => {
        const status = res.statusCode;
        res.destroy(); // Abort reading body to save bandwidth and speed up
        resolve({ url, status, ok: status === 200 });
      });
      req.on('error', (err) => resolve({ url, status: 0, ok: false, error: err.message }));
      req.on('timeout', () => { req.destroy(); resolve({ url, status: 408, ok: false, error: 'Timeout' }); });
    } catch (e) {
      resolve({ url, status: 0, ok: false, error: e.message });
    }
  });
}

async function run() {
  const uniqueUrls = [...new Set(data.map(p => p.image))];
  console.log(`Unique URLs to check: ${uniqueUrls.length}`);

  const brokenMap = new Map();
  const CONCURRENCY = 40;
  let index = 0;
  let finished = 0;

  async function worker() {
    while (index < uniqueUrls.length) {
      const i = index++;
      const url = uniqueUrls[i];
      const res = await checkUrl(url);
      finished++;
      if (!res.ok) {
        brokenMap.set(url, res.status);
      }
      if (finished % 500 === 0 || finished === uniqueUrls.length) {
        console.log(`Checked: ${finished}/${uniqueUrls.length} | Broken so far: ${brokenMap.size}`);
      }
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);

  console.log(`\nDONE. Total broken URLs: ${brokenMap.size}`);
  
  // Tag broken products
  const brokenProducts = [];
  data.forEach((p, idx) => {
    if (brokenMap.has(p.image)) {
      brokenProducts.push({ index: idx, name: p.name, category: p.category, status: brokenMap.get(p.image), image: p.image });
    }
  });

  console.log(`Total products with broken images: ${brokenProducts.length}`);
  fs.writeFileSync(path.join(__dirname, 'broken-products.json'), JSON.stringify(brokenProducts, null, 2));
  console.log('Saved report to broken-products.json');
}

run();
