const https = require('https');

const tests = [
  'https://as-images.apple.com/is/iphone-16-finish-select-202409-6-1inch-teal?wid=1000&hei=1000&fmt=jpeg',
  'https://as-images.apple.com/is/iphone-16-finish-select-202409-6-1inch-ultramarine?wid=1000&hei=1000&fmt=jpeg',
  'https://as-images.apple.com/is/iphone-16-finish-select-202409-6-1inch-pink?wid=1000&hei=1000&fmt=jpeg',
  'https://as-images.apple.com/is/iphone-16-finish-select-202409-6-1inch-white?wid=1000&hei=1000&fmt=jpeg',
  'https://as-images.apple.com/is/iphone-16-finish-select-202409-6-1inch-black?wid=1000&hei=1000&fmt=jpeg',
  'https://as-images.apple.com/is/iphone-16-finish-select-202409-6-7inch-teal?wid=1000&hei=1000&fmt=jpeg',
  'https://as-images.apple.com/is/iphone-16-finish-select-202409-6-7inch-ultramarine?wid=1000&hei=1000&fmt=jpeg',
  'https://as-images.apple.com/is/iphone-16-finish-select-202409-6-7inch-pink?wid=1000&hei=1000&fmt=jpeg',
  'https://as-images.apple.com/is/iphone-16-finish-select-202409-6-7inch-white?wid=1000&hei=1000&fmt=jpeg',
  'https://as-images.apple.com/is/iphone-16-finish-select-202409-6-7inch-black?wid=1000&hei=1000&fmt=jpeg',
  'https://as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-3inch-deserttitanium?wid=1000&hei=1000&fmt=jpeg',
  'https://as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-3inch-naturaltitanium?wid=1000&hei=1000&fmt=jpeg',
  'https://as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-3inch-whitetitanium?wid=1000&hei=1000&fmt=jpeg',
  'https://as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-3inch-blacktitanium?wid=1000&hei=1000&fmt=jpeg',
  'https://as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-9inch-deserttitanium?wid=1000&hei=1000&fmt=jpeg',
  'https://as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-9inch-naturaltitanium?wid=1000&hei=1000&fmt=jpeg',
  'https://as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-9inch-whitetitanium?wid=1000&hei=1000&fmt=jpeg',
  'https://as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-9inch-blacktitanium?wid=1000&hei=1000&fmt=jpeg'
];

function check(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve({ status: res.statusCode, url: url.split('/is/')[1].split('?')[0] });
    }).on('error', e => resolve({ status: 'ERR', error: e.message }));
  });
}

async function run() {
  for (const t of tests) {
    const res = await check(t);
    console.log(res.status, res.url);
  }
}

run();
