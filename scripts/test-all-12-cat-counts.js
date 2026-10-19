const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const CATEGORY_MAP = {
    'Watches': 'Đồng hồ',
    'Đồng hồ': 'Watches',
    'Bags & Handbags': 'Túi xách',
    'Handbags': 'Túi xách',
    'Túi xách': 'Bags & Handbags',
    'Fine Jewelry': 'Trang sức cao cấp',
    'Trang sức cao cấp': 'Fine Jewelry',
    'Eyewear & Accessories': 'Kính mắt & Phụ kiện',
    'Kính mắt & Phụ kiện': 'Eyewear & Accessories',
    'Jewelry': 'Trang sức',
    'Trang sức': 'Jewelry',
    'Clothing': 'Thời trang & May mặc',
    'Fashion': 'Thời trang & May mặc',
    'Thời trang & May mặc': 'Clothing',
    'Thời trang': 'Clothing',
    'Kitchenware': 'Đồ dùng nhà bếp',
    'Đồ dùng nhà bếp': 'Kitchenware',
    'Electronics': 'Điện tử',
    'Điện tử': 'Electronics',
    'Home Appliances': 'Thiết bị gia dụng',
    'Thiết bị gia dụng': 'Home Appliances',
    'Sports & Outdoors': 'Thể thao & Dã ngoại',
    'Thể thao & Dã ngoại': 'Sports & Outdoors',
    'Beauty & Personal': 'Làm đẹp & Chăm sóc',
    'Beauty & Personal Care': 'Làm đẹp & Chăm sóc',
    'Beauty': 'Làm đẹp & Chăm sóc',
    'Làm đẹp & Chăm sóc': 'Beauty',
    'Làm đẹp': 'Beauty'
  };

  const categories = [
    "Watches",
    "Bags & Handbags",
    "Fine Jewelry",
    "Eyewear & Accessories",
    "Jewelry",
    "Electronics",
    "Fashion",
    "Clothing",
    "Kitchenware",
    "Home Appliances",
    "Sports & Outdoors",
    "Beauty"
  ];

  let sql = "";
  for (const cat of categories) {
    const alt = CATEGORY_MAP[cat];
    const inList = alt ? `'${cat}', '${alt}'` : `'${cat}'`;
    sql += `SELECT '${cat}' as catName, count(*) as count FROM product WHERE category IN (${inList}) UNION ALL `;
  }
  sql = sql.slice(0, -11) + ";";

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
