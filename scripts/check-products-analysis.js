const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const query = `
    SELECT MIN(price) as min_p, MAX(price) as max_p, COUNT(*) as total FROM product;
    SELECT id, name, brand, category, price, image FROM product ORDER BY price DESC LIMIT 10;
    SELECT image, COUNT(*) as c FROM product WHERE image IS NOT NULL GROUP BY image ORDER BY c DESC LIMIT 10;
    SELECT COUNT(DISTINCT image) as unique_images, COUNT(*) as total_products FROM product;
  `;
  conn.exec(`mysql -u root -p0904521297t greeting_message -e "${query}"`, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d);
    stream.on('close', () => {
      console.log(out);
      conn.end();
    });
  });
}).connect({
  host: '223.130.11.200',
  port: 22,
  username: 'root',
  password: '0904521297t'
});
