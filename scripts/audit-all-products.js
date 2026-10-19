const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const query = `
    SELECT '=== THỐNG KÊ GIÁ THẤP NHẤT VÀ CAO NHẤT ===' as title;
    SELECT 
      MIN(price) as min_price,
      MAX(price) as max_price,
      ROUND(AVG(price), 2) as avg_price,
      COUNT(*) as total_count
    FROM product;

    SELECT '=== TOP 5 SẢN PHẨM GIÁ THẤP NHẤT ===' as title;
    SELECT id, name, brand, category, price, SUBSTRING(image, 1, 60) as img 
    FROM product 
    ORDER BY price ASC 
    LIMIT 5;

    SELECT '=== TOP 5 SẢN PHẨM GIÁ CAO NHẤT ===' as title;
    SELECT id, name, brand, category, price, SUBSTRING(image, 1, 60) as img 
    FROM product 
    ORDER BY price DESC 
    LIMIT 5;

    SELECT '=== KIỂM TRA LỖI DỮ LIỆU ===' as title;
    SELECT 
      SUM(CASE WHEN price <= 0 THEN 1 ELSE 0 END) as price_zero_or_negative,
      SUM(CASE WHEN price > 300000 THEN 1 ELSE 0 END) as price_over_300k,
      SUM(CASE WHEN name IS NULL OR name = '' THEN 1 ELSE 0 END) as missing_name,
      SUM(CASE WHEN image IS NULL OR image = '' THEN 1 ELSE 0 END) as missing_image,
      SUM(CASE WHEN image NOT LIKE 'http%' THEN 1 ELSE 0 END) as invalid_image_protocol
    FROM product;

    SELECT '=== PHÂN PHỐI CÁC KHOẢNG GIÁ HIỆN TẠI ===' as title;
    SELECT 
      CASE 
        WHEN price < 50 THEN '1. Dưới $50'
        WHEN price >= 50 AND price < 200 THEN '2. $50 - $200'
        WHEN price >= 200 AND price < 500 THEN '3. $200 - $500'
        WHEN price >= 500 AND price < 1000 THEN '4. $500 - $1,000'
        WHEN price >= 1000 AND price < 5000 THEN '5. $1,000 - $5,000'
        WHEN price >= 5000 AND price < 10000 THEN '6. $5,000 - $10,000'
        WHEN price >= 10000 AND price <= 20000 THEN '7. $10,000 - $20,000'
        WHEN price > 20000 THEN '8. Trên $20,000'
        ELSE 'Khác'
      END as price_range,
      COUNT(*) as count,
      ROUND(MIN(price), 2) as min_p,
      ROUND(MAX(price), 2) as max_p
    FROM product
    GROUP BY price_range
    ORDER BY MIN(price);
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
