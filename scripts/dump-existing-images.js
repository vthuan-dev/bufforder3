const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const conn = new Client();
conn.on('ready', () => {
  console.log('Fetching existing product image URLs from VPS MySQL...');
  const query = 'mysql -u root -p0904521297t greeting_message -N -e "SELECT image FROM product WHERE image IS NOT NULL AND image != \'\'"';
  let out = '';
  conn.exec(query, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => out += d);
    stream.on('close', () => {
      const urls = out.split('\n').map(u => u.trim()).filter(Boolean);
      console.log(`Found ${urls.length} existing images in database.`);
      fs.writeFileSync(path.join(__dirname, 'existing-images.json'), JSON.stringify(urls, null, 2));
      conn.end();
    });
  });
}).connect({
  host: '223.130.11.200',
  port: 22,
  username: 'root',
  password: '0904521297t'
});
