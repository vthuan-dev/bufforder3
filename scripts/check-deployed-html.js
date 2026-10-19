const https = require('https');

const req = https.get('https://ashfordorder.com', { rejectUnauthorized: false }, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('HTML from ashfordorder.com:');
    const scripts = data.match(/src="[^"]+"/g);
    console.log(scripts);
    const hashes = data.match(/assets\/[a-zA-Z0-9_-]+\.js/g);
    console.log('Asset bundles:', hashes);
  });
});
req.on('error', e => console.error(e));
