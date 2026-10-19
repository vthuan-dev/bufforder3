const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const query = `
    SELECT 
      CASE 
        WHEN price < 500 THEN '1. Under $500'
        WHEN price >= 500 AND price < 1000 THEN '2. $500 - $1,000'
        WHEN price >= 1000 AND price < 3000 THEN '3. $1,000 - $3,000'
        WHEN price >= 3000 AND price < 5000 THEN '4. $3,000 - $5,000'
        WHEN price >= 500 AND price < 10000 THEN '5. $5,000 - $10,000'
        WHEN price >= 10000 AND price <= 20000 THEN '6. $10,000 - $20,000 (MỚI BỔ SUNG)'
        WHEN price > 20000 THEN '7. Over $20,000'
        ELSE 'Other'
      END as price_tier,
      COUNT(*) as count,
      ROUND(MIN(price), 2) as min_price,
      ROUND(MAX(price), 2) as max_price
    FROM product 
    WHERE isActive = 1 
    GROUP BY price_tier 
    ORDER BY MIN(price);

    SELECT 
      brand,
      COUNT(*) as total_items,
      ROUND(AVG(price), 2) as avg_price,
      ROUND(MIN(price), 2) as min_price,
      ROUND(MAX(price), 2) as max_price
    FROM product
    WHERE isActive = 1 AND price BETWEEN 10000 AND 20000
    GROUP BY brand
    ORDER BY total_items DESC
    LIMIT 10;
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
}).connect({ host: '223.130.11.200', username: 'root', password: '0904521297t' });
