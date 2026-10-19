const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const allowed = [
    'Đồng hồ', 'Watches',
    'Túi xách', 'Bags & Handbags',
    'Trang sức cao cấp', 'Fine Jewelry',
    'Kính mắt & Phụ kiện', 'Eyewear & Accessories',
    'Trang sức', 'Jewelry',
    'Điện tử', 'Electronics',
    'Thời trang', 'Fashion',
    'Thời trang & May mặc', 'Clothing',
    'Đồ dùng nhà bếp', 'Kitchenware',
    'Thiết bị gia dụng', 'Home Appliances',
    'Thể thao & Dã ngoại', 'Sports & Outdoors',
    'Làm đẹp', 'Beauty', 'Làm đẹp & Chăm sóc'
  ];
  
  const inClause = allowed.map(c => `'${c}'`).join(',');
  const sql = `
    SELECT 
      SUM(category IN (${inClause})) as insideCount,
      SUM(category NOT IN (${inClause})) as outsideCount,
      COUNT(*) as total
    FROM product;
    
    SELECT category, count(*) as count 
    FROM product 
    WHERE category NOT IN (${inClause})
    GROUP BY category 
    ORDER BY count DESC;
  `;

  conn.exec(`mysql -u root -p0904521297t greeting_message -e "${sql}"`, (err, stream) => {
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
