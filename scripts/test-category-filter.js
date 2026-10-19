const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  // Query MySQL directly simulating the backend filter
  const query = `
    SELECT '=== TEST FILTER CATEGORY IN (Watches, Đồng hồ) ===' as title;
    SELECT id, name, brand, category, price 
    FROM product 
    WHERE category IN ('Watches', 'Đồng hồ') 
    LIMIT 3;

    SELECT '=== TEST FILTER CATEGORY IN (Bags & Handbags, Túi xách) ===' as title;
    SELECT id, name, brand, category, price 
    FROM product 
    WHERE category IN ('Bags & Handbags', 'Túi xách') 
    LIMIT 3;

    SELECT '=== TEST FILTER CATEGORY IN (Fine Jewelry, Trang sức cao cấp) ===' as title;
    SELECT id, name, brand, category, price 
    FROM product 
    WHERE category IN ('Fine Jewelry', 'Trang sức cao cấp') 
    LIMIT 3;
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
