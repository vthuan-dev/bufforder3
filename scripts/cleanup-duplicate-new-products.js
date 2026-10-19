const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const query = `
    DELETE FROM product WHERE id >= 25590 AND isActive = 0;

    SELECT '=== TOP 10 SẢN PHẨM MỚI NHẤT TRÊN ADMIN SAU KHI DỌN DẸP ===' as title;
    SELECT id, name, brand, category, price, isActive 
    FROM product 
    ORDER BY id DESC 
    LIMIT 10;

    SELECT '=== TỔNG QUAN HIỆN TẠI ===' as title;
    SELECT 
      COUNT(*) as total_active,
      SUM(CASE WHEN price BETWEEN 10000 AND 20000 THEN 1 ELSE 0 END) as active_10k_20k,
      COUNT(DISTINCT image) as unique_images
    FROM product 
    WHERE isActive = 1;
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
}).connect({ host: '223.130.11.200', username: 'root', password: '0904521297t' });
