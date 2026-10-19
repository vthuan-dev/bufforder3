const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('Connected to VPS. Running database recategorization...');

  const queries = [
    "UPDATE product SET category = 'Thời trang & May mặc' WHERE category IN ('Giày dép', 'Fashion', 'Thời trang', 'Mẹ & Bé', 'Clothing');",
    "UPDATE product SET category = 'Thể thao & Dã ngoại' WHERE category IN ('Cắm trại & Dã ngoại', 'Làm vườn & Ngoài trời', 'Sports & Outdoors');",
    "UPDATE product SET category = 'Làm đẹp' WHERE category IN ('Làm đẹp & Chăm sóc', 'Chăm sóc sức khỏe', 'Sức khỏe & Đời sống', 'Beauty & Personal', 'Beauty & Personal Care', 'Beauty');",
    "UPDATE product SET category = 'Điện tử' WHERE category IN ('Gaming & Phụ kiện', 'Âm nhạc', 'Nhạc cụ', 'Máy ảnh & Kỹ thuật số', 'Phụ kiện ô tô', 'Electronics');",
    "UPDATE product SET category = 'Túi xách' WHERE category IN ('Phụ kiện du lịch', 'Handbags', 'Bags & Handbags');",
    "UPDATE product SET category = 'Đồ dùng nhà bếp' WHERE category IN ('Bách hóa & Thực phẩm', 'Kitchenware');",
    "UPDATE product SET category = 'Thiết bị gia dụng' WHERE category IN ('Nội thất', 'Trang trí nhà cửa', 'Đồ chơi', 'Dụng cụ & Sửa chữa', 'Dụng cụ mỹ thuật', 'Văn phòng phẩm', 'Sách & Báo', 'Công nghiệp & Khoa học', 'Thú cưng', 'Home Appliances');",
    "UPDATE product SET category = 'Trang sức' WHERE category IN ('Đồ sưu tầm', 'Jewelry');",
    "UPDATE product SET category = 'Đồng hồ' WHERE category = 'Watches';",
    "UPDATE product SET category = 'Trang sức cao cấp' WHERE category = 'Fine Jewelry';",
    "UPDATE product SET category = 'Kính mắt & Phụ kiện' WHERE category = 'Eyewear & Accessories';",
    "UPDATE \\`order\\` o JOIN product p ON o.productId = p.id SET o.category = p.category;"
  ];

  const fullSql = queries.join(' ') + ' SELECT category, count(*) as count FROM product GROUP BY category ORDER BY count DESC;';

  conn.exec(`mysql -u root -p0904521297t greeting_message -e "${fullSql}"`, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d);
    stream.stderr.on('data', d => console.error(d.toString()));
    stream.on('close', code => {
      console.log(`Finished with code ${code}\n`);
      console.log('Resulting Categories and Product Counts:\n');
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
