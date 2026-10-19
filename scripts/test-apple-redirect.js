const https = require('https');

function getFinalUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        resolve({ original: url, status: res.statusCode, location: res.headers.location });
      } else {
        resolve({ original: url, status: res.statusCode, type: res.headers['content-type'] });
      }
    }).on('error', e => resolve({ error: e.message }));
  });
}

async function test() {
  const r1 = await getFinalUrl('https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-finish-select-202409-6-1inch-teal?wid=5120&hei=2880&fmt=p-jpg');
  console.log('Redirect:', r1);

  const r2 = await getFinalUrl('https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-3inch-deserttitanium?wid=5120&hei=2880&fmt=p-jpg');
  console.log('Redirect 2:', r2);
}

test();
