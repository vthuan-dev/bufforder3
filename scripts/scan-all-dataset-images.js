const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'dataset-5000-new.json'), 'utf8'));
console.log(`Starting scan of ${data.length} images...`);

const agentHttps = new https.Agent({ keepAlive: true, maxSockets: 50 });
const agentHttp = new http.Agent({ keepAlive: true, maxSockets: 50 });

async function checkUrl(url) {
  return new Promise((resolve) => {
    try {
      const u = new URL(url);
      const req = (u.protocol === 'https:' ? https : http).request(u, {
        method: 'HEAD',
        agent: u.protocol === 'https:' ? agentHttps : agentHttp,
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }, (res) => {
        resolve({ url, status: res.statusCode, ok: res.statusCode === 200 });
      });
      req.on('error', (err) => resolve({ url, status: 0, ok: false, error: err.message }));
      req.on('timeout', () => { req.destroy(); resolve({ url, status: 408, ok: false, error: 'Timeout' }); });
      req.end();
    } catch (e) {
      resolve({ url, status: 0, ok: false, error: e.message });
    }
  });
}

async function run() {
  const uniqueUrls = [...new Set(data.map(p => p.image))];
  console.log(`Found ${uniqueUrls.length} unique images to verify.`);

  const brokenMap = new Map();
  const CONCURRENCY = 50;
  let index = 0;
  let scanned = 0;

  async function worker() {
    while (index < uniqueUrls.length) {
      const i = index++;
      const url = uniqueUrls[i];
      const res = await checkUrl(url);
      scanned++;
      if (!res.ok) {
        brokenMap.set(url, res.status);
      }
      if (scanned % 500 === 0 || scanned === uniqueUrls.length) {
        console.log(`Progress: ${scanned}/${uniqueUrls.length} | Broken so far: ${brokenMap.size}`);
      }
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);

  console.log(`\nScan finished. Total broken images: ${brokenMap.size}`);
  const brokenList = Array.from(brokenMap.entries());
  fs.writeFileSync(path.join(__dirname, 'broken-images.json'), JSON.stringify(brokenList, null, 2));

  // Find which products have broken images
  const brokenProducts = data.filter(p => brokenMap.has(p.image));
  console.log(`Total products affected: ${brokenProducts.length}`);
  fs.writeFileSync(path.join(__dirname, 'broken-products-list.json'), JSON.stringify(brokenProducts.slice(0, 50), null, 2));
}

run();
