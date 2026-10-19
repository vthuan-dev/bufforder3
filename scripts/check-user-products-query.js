const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  // Check products that match user query
  // targetProductPrice = 888.89 -> 755.56 to 1022.22
  // freezeConfig.enabled = true, userBalance = 5340.52 -> price > 5340.53
  const query = `
    SELECT id, name, brand, category, price, image FROM product 
    WHERE isActive = 1 AND (
      (price >= 755.56 AND price <= 1022.22)
      OR (price > 5340.53)
    )
    ORDER BY id ASC
    LIMIT 30;
  `;
  conn.exec(`mysql -u root -p0904521297t greeting_message -e "${query}"`, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d);
    stream.on('close', () => {
      console.log('PRODUCTS RETURNED:');
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
