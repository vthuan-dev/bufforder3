const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const q = `SELECT id, name, brand, category, price, SUBSTRING(image, 1, 60) as img FROM product WHERE price BETWEEN 17000 AND 26000 ORDER BY id DESC LIMIT 20`;
  conn.exec(`mysql -u root -p0904521297t greeting_message -e "${q}"`, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d);
    stream.on('close', () => {
      console.log('PRODUCTS BETWEEN 17k AND 26k (Newest first):');
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
