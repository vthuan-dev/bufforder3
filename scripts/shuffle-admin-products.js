const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const query = `
    UPDATE product SET createdAt = DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 5000000) SECOND);

    SELECT '=== TOP 20 SẢN PHẨM TRANG 1 ADMIN SAU KHI XÁO TRỘN (LỘN XỘN) ===' as title;
    SELECT id, name, brand, category, price 
    FROM product 
    ORDER BY createdAt DESC 
    LIMIT 20;
  `;

  conn.exec(`mysql -u root -p0904521297t greeting_message -e "${query}"`, (err, stream) => {
    if (err) throw err;
    let out = '';
    let errOut = '';
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
