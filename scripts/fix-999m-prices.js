const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const query = `
    SELECT productId, COUNT(*) as cnt FROM \\\`order\\\` WHERE productId IN (3093, 3103) GROUP BY productId;
    UPDATE product SET price = 15.00 WHERE price < 1;
    SELECT MIN(price) as new_min_price, MAX(price) as new_max_price FROM product;
  `;

  conn.exec(`mysql -u root -p0904521297t greeting_message -e "${query}"`, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d);
    stream.stderr.on('data', () => {});
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
