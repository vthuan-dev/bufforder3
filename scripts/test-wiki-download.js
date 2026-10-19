const https = require('https');

function download(url) {
  return new Promise((resolve) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://commons.wikimedia.org/'
      }
    }, (res) => {
      resolve({ status: res.statusCode, length: res.headers['content-length'], type: res.headers['content-type'] });
    }).on('error', e => resolve({ error: e.message }));
  });
}

async function run() {
  const r1 = await download('https://upload.wikimedia.org/wikipedia/commons/6/6b/Mist_Blue_iPhone_17.jpg');
  console.log('iPhone 17 Mist Blue:', r1);

  const r2 = await download('https://upload.wikimedia.org/wikipedia/commons/3/34/IPhone_18_Pro_Max_rear.jpg');
  console.log('iPhone 18 Pro Max rear:', r2);
}

run();
