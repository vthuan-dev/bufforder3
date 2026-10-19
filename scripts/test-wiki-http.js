const https = require('https');

const urls = [
  'https://upload.wikimedia.org/wikipedia/commons/6/6b/Mist_Blue_iPhone_17.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/8/8f/White_iPhone_17.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/b/b2/Sage_iPhone_17.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/5/56/Black_iPhone_17.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/1/13/Lavender_iPhone_17.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/5/5c/IPhone_17%2C_Air%2C_17_Pro%2C_and_Pro_max.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/9/9d/Silver_iPhone_17_Pro_Max.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/9/92/Cosmic_Orange_iPhone_17_Pro_Max.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/3/34/IPhone_18_Pro_Max_rear.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/8/8a/IPhone_18_Pro_rear.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/2/22/IPhone_18_Pro_black_rear.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/e/eb/IPhone_18_Pro_Max_black_rear.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/f/f4/IPhone_18_Pro_-_black_01.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/5/53/IPhone_18_Pro_-_black_02.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/8/80/IPhone_18_Pro_-_black_03.jpg'
];

function check(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'ProductBot/1.0' } }, (res) => {
      resolve({ url: url.split('/').pop(), status: res.statusCode });
    }).on('error', e => resolve({ url: url.split('/').pop(), status: 'ERR', error: e.message }));
  });
}

async function run() {
  for (const u of urls) {
    const res = await check(u);
    console.log(res.status, res.url);
  }
}

run();
