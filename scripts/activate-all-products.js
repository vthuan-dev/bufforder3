const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const query = `
    UPDATE product SET isActive = 1;

    SELECT '=== THỐNG KÊ SAU KHI BẬT HOẠT ĐỘNG TOÀN BỘ ===' as title;
    SELECT 
      COUNT(*) as total_products,
      SUM(CASE WHEN isActive = 1 THEN 1 ELSE 0 END) as total_active,
      SUM(CASE WHEN isActive = 0 THEN 1 ELSE 0 END) as total_inactive
    FROM product;

    SELECT '=== MẪU SẢN PHẨM Ở CÁC PHÂN ĐOÀN ID ===' as title;
    SELECT id, name, brand, category, price, isActive FROM product WHERE id = 1
    UNION ALL
    SELECT id, name, brand, category, price, isActive FROM product WHERE id = 10000
    UNION ALL
    SELECT id, name, brand, category, price, isActive FROM product WHERE id = 27000
    UNION ALL
    SELECT id, name, brand, category, price, isActive FROM product ORDER BY id DESC LIMIT 1;
  `;

  conn.exec(`mysql -u root -p0904521297t greeting_message -e "${query}"`, (err, stream) => {
    if (err) throw err;
    let out = '';
    let errOut = '';
    stream.on('data', d => out += d);
    stream.stderr.on('data', d => errOut += d);
    stream.on('close', () => {
      if (errOut) console.error('STDERR:', errOut);
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
