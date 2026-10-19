const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const query = `
    SELECT '=== TOP CATEGORIES ===' as info;
    SELECT category, COUNT(*) as count FROM product GROUP BY category ORDER BY count DESC LIMIT 10;
    
    SELECT '=== IPHONE 18 SAMPLE ===' as info;
    SELECT id, name, brand, category, price, SUBSTRING(image, 1, 65) as img FROM product WHERE name LIKE '%iPhone 18%' LIMIT 6;
    
    SELECT '=== APPAREL / FASHION SAMPLE ===' as info;
    SELECT id, name, brand, category, price, SUBSTRING(image, 1, 65) as img FROM product WHERE brand IN ('Nike', 'Adidas', 'Gucci', 'Louis Vuitton', 'Ralph Lauren') ORDER BY id DESC LIMIT 6;
    
    SELECT '=== KITCHENWARE SAMPLE ===' as info;
    SELECT id, name, brand, category, price, SUBSTRING(image, 1, 65) as img FROM product WHERE category = 'Kitchenware' ORDER BY id DESC LIMIT 5;
    
    SELECT '=== TOTAL PRODUCTS ===' as info;
    SELECT COUNT(*) as grand_total FROM product;
  `;

  conn.exec(`mysql -u root -p0904521297t greeting_message -e "${query.replace(/\r?\n/g, ' ')}"`, (err, stream) => {
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
