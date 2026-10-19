const https = require('https');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve(null); }
      });
    }).on('error', reject);
  });
}

function checkImage(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve({ status: res.statusCode, size: res.headers['content-length'] });
    }).on('error', e => resolve({ status: 'ERR', error: e.message }));
  });
}

async function verify() {
  console.log('Testing image accessibility from https://api.ashfordorder.com...');
  const testImg = await checkImage('https://api.ashfordorder.com/uploads/iphones/iphone-16-teal.jpg');
  console.log('iPhone 16 Teal image:', testImg);

  const testImg17 = await checkImage('https://api.ashfordorder.com/uploads/iphones/iphone-17-mist-blue.jpg');
  console.log('iPhone 17 Mist Blue image:', testImg17);

  const testImg18 = await checkImage('https://api.ashfordorder.com/uploads/iphones/iphone-18-pro.jpg');
  console.log('iPhone 18 Pro image:', testImg18);
}

verify();
