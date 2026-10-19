const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const mapping = {
    // -> Thời trang & May mặc
    'Giày dép': 'Thời trang & May mặc',
    'Fashion': 'Thời trang & May mặc',
    'Thời trang': 'Thời trang & May mặc',
    'Mẹ & Bé': 'Thời trang & May mặc',

    // -> Thể thao & Dã ngoại
    'Cắm trại & Dã ngoại': 'Thể thao & Dã ngoại',
    'Làm vườn & Ngoài trời': 'Thể thao & Dã ngoại',

    // -> Làm đẹp
    'Làm đẹp & Chăm sóc': 'Làm đẹp',
    'Chăm sóc sức khỏe': 'Làm đẹp',
    'Sức khỏe & Đời sống': 'Làm đẹp',
    'Beauty & Personal': 'Làm đẹp',
    'Beauty & Personal Care': 'Làm đẹp',

    // -> Điện tử
    'Gaming & Phụ kiện': 'Điện tử',
    'Âm nhạc': 'Điện tử',
    'Máy ảnh & Kỹ thuật số': 'Điện tử',
    'Phụ kiện ô tô': 'Điện tử',

    // -> Túi xách
    'Phụ kiện du lịch': 'Túi xách',
    'Handbags': 'Túi xách',

    // -> Đồ dùng nhà bếp
    'Bách hóa & Thực phẩm': 'Đồ dùng nhà bếp',

    // -> Thiết bị gia dụng
    'Nội thất': 'Thiết bị gia dụng',
    'Trang trí nhà cửa': 'Thiết bị gia dụng',
    'Đồ chơi': 'Thiết bị gia dụng',
    'Dụng cụ & Sửa chữa': 'Thiết bị gia dụng',
    'Dụng cụ mỹ thuật': 'Thiết bị gia dụng',
    'Văn phòng phẩm': 'Thiết bị gia dụng',
    'Sách & Báo': 'Thiết bị gia dụng',
    'Công nghiệp & Khoa học': 'Thiết bị gia dụng',
    'Thú cưng': 'Thiết bị gia dụng',

    // -> Trang sức
    'Đồ sưu tầm': 'Trang sức'
  };

  // Build CASE statement to simulate preview
  let whens = Object.entries(mapping)
    .map(([oldCat, newCat]) => `WHEN category = '${oldCat}' THEN '${newCat}'`)
    .join(' ');

  const sql = `
    SELECT 
      CASE ${whens} ELSE category END as targetCategory,
      count(*) as count
    FROM product
    GROUP BY targetCategory
    ORDER BY count DESC;
  `;

  conn.exec(`mysql -u root -p0904521297t greeting_message -e "${sql}"`, (err, stream) => {
    let out = '';
    stream.on('data', d => out += d);
    stream.stderr.on('data', () => {});
    stream.on('close', () => {
      console.log('Projected Counts for the 11 Clean Categories:\n');
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
