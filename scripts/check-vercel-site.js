const https = require('https');

function check(url) {
  https.get(url, { rejectUnauthorized: false }, res => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
      console.log(`=== ${url} === (Status: ${res.statusCode})`);
      const scripts = data.match(/assets\/[a-zA-Z0-9_\.-]+/g);
      console.log('Scripts:', scripts ? scripts.slice(0, 5) : 'none');
    });
  }).on('error', e => console.error(url, e.message));
}

check('https://bufforder.vercel.app');
