const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const query = `
    UPDATE product SET category = 'Đồng hồ' WHERE category = 'Watches';
    UPDATE product SET category = 'Túi xách' WHERE category IN ('Bags & Handbags', 'Handbags');
    UPDATE product SET category = 'Trang sức cao cấp' WHERE category = 'Fine Jewelry';
    UPDATE product SET category = 'Kính mắt & Phụ kiện' WHERE category = 'Eyewear & Accessories';
    UPDATE product SET category = 'Trang sức' WHERE category = 'Jewelry';
    UPDATE product SET category = 'Điện tử' WHERE category = 'Electronics';
    UPDATE product SET category = 'Thời trang & May mặc' WHERE category IN ('Clothing', 'Fashion');
    UPDATE product SET category = 'Đồ dùng nhà bếp' WHERE category = 'Kitchenware';
    UPDATE product SET category = 'Nội thất' WHERE category = 'Furniture';
    UPDATE product SET category = 'Đồ chơi' WHERE category = 'Toys';
    UPDATE product SET category = 'Trang trí nhà cửa' WHERE category = 'Home Decor';
    UPDATE product SET category = 'Giày dép' WHERE category = 'Footwear';
    UPDATE product SET category = 'Thể thao & Dã ngoại' WHERE category = 'Sports & Outdoors';
    UPDATE product SET category = 'Phụ kiện ô tô' WHERE category = 'Automotive';
    UPDATE product SET category = 'Nhạc cụ' WHERE category IN ('Music Instruments', 'Musical Instruments');
    UPDATE product SET category = 'Thú cưng' WHERE category = 'Pet Supplies';
    UPDATE product SET category = 'Chăm sóc sức khỏe' WHERE category = 'Healthcare & Wellness';
    UPDATE product SET category = 'Cắm trại & Dã ngoại' WHERE category = 'Camping & Hiking';
    UPDATE product SET category = 'Dụng cụ & Sửa chữa' WHERE category = 'Tools & Home Improvement';
    UPDATE product SET category = 'Làm đẹp & Chăm sóc' WHERE category IN ('Beauty & Personal', 'Beauty & Personal Care', 'Beauty');
    UPDATE product SET category = 'Thiết bị gia dụng' WHERE category = 'Home Appliances';
    UPDATE product SET category = 'Làm vườn & Ngoài trời' WHERE category = 'Gardening & Outdoor';
    UPDATE product SET category = 'Mẹ & Bé' WHERE category = 'Baby Products';
    UPDATE product SET category = 'Văn phòng phẩm' WHERE category = 'Office Supplies';
    UPDATE product SET category = 'Phụ kiện du lịch' WHERE category = 'Travel Accessories';
    UPDATE product SET category = 'Sức khỏe & Đời sống' WHERE category = 'Health & Household';
    UPDATE product SET category = 'Âm nhạc' WHERE category = 'Music';
    UPDATE product SET category = 'Dụng cụ mỹ thuật' WHERE category IN ('Art Supplies', 'Arts & Crafts', 'Art & Craft');
    UPDATE product SET category = 'Công nghiệp & Khoa học' WHERE category = 'Industrial & Scientific';
    UPDATE product SET category = 'Sách & Báo' WHERE category = 'Books';
    UPDATE product SET category = 'Gaming & Phụ kiện' WHERE category = 'Gaming & Accessories';
    UPDATE product SET category = 'Bách hóa & Thực phẩm' WHERE category = 'Groceries';
    UPDATE product SET category = 'Máy ảnh & Kỹ thuật số' WHERE category = 'Camera';
    UPDATE product SET category = 'Đồ sưu tầm' WHERE category = 'Collectibles';

    SELECT '=== THỐNG KÊ CÁC DANH MỤC TIẾNG VIỆT SAU KHI CẬP NHẬT ===' as title;
    SELECT category, COUNT(*) as count 
    FROM product 
    GROUP BY category 
    ORDER BY count DESC;

    SELECT '=== TOP 5 SẢN PHẨM MẪU TRÊN TRANG 1 ADMIN ===' as title;
    SELECT id, name, brand, category, price 
    FROM product 
    ORDER BY createdAt DESC 
    LIMIT 5;
  `;

  conn.exec(`mysql -u root -p0904521297t greeting_message -e "${query}"`, (err, stream) => {
    if (err) throw err;
    let out = '';
    let errOut = '';
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
