const https = require('https');

function download(url) {
  return new Promise((resolve) => {
    https.get(url, {
      headers: {
        'User-Agent': 'AshfordProductManager/1.0 (https://www.ashfordorder.com; admin@ashfordorder.com)'
      }
    }, (res) => {
      resolve({ status: res.statusCode, length: res.headers['content-length'], type: res.headers['content-type'] });
    }).on('error', e => resolve({ error: e.message }));
  });
}

async function run() {
  const r1 = await download('https://upload.wikimedia.org/wikipedia/commons/6/6b/Mist_Blue_iPhone_17.jpg');
  console.log('iPhone 17 Mist Blue:', r1);
}

run();
