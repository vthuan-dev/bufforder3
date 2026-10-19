const https = require('https');

function fetch(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', () => resolve(''));
  });
}

async function test() {
  const html16 = await fetch('https://www.gsmarena.com/apple_iphone_16-13315.php');
  const img16 = html16.match(/https:\/\/[^"]*fdn[^"]*\.(jpg|png|webp)/gi);
  console.log('iPhone 16 matches:', img16 ? img16.slice(0, 10) : 'none');
}

test();
