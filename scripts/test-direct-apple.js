const https = require('https');

function test(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve({ url, status: res.statusCode, type: res.headers['content-type'], length: res.headers['content-length'] });
    }).on('error', e => resolve({ error: e.message }));
  });
}

async function run() {
  const r = await test('https://as-images.apple.com/is/iphone-16-finish-select-202409-6-1inch-teal?wid=1000&hei=1000&fmt=jpeg');
  console.log(r);
}

run();
