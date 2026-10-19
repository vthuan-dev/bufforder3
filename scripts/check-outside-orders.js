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
  const sql = "SELECT count(*) as orderCount FROM \\`order\\` o JOIN product p ON o.productId = p.id WHERE p.category NOT IN (" + inClause + ");";

  conn.exec(`mysql -u root -p0904521297t greeting_message -e "${sql}"`, (err, stream) => {
    let out = '';
    stream.on('data', d => out += d);
    stream.stderr.on('data', d => console.error('ERR:', d.toString()));
    stream.on('close', () => {
      console.log('Result:\n', out);
      conn.end();
    });
  });
}).connect({
  host: '223.130.11.200',
  port: 22,
  username: 'root',
  password: '0904521297t'
});
