const https = require('https');
const jwt = require('../backend/node_modules/jsonwebtoken');

const token = jwt.sign(
  { id: 'cmq6p4nhz0000eya9ikkxs8ca', username: 'admin', role: 'admin' },
  'your_jwt_secret_key_here_change_this_in_production'
);

const categories = [
  { key: 'Watches', vi: 'Đồng hồ' },
  { key: 'Bags & Handbags', vi: 'Túi xách' },
  { key: 'Fine Jewelry', vi: 'Trang sức cao cấp' },
  { key: 'Eyewear & Accessories', vi: 'Kính mắt & Phụ kiện' },
  { key: 'Jewelry', vi: 'Trang sức' },
  { key: 'Electronics', vi: 'Điện tử' },
  { key: 'Clothing', vi: 'Thời trang & May mặc' },
  { key: 'Kitchenware', vi: 'Đồ dùng nhà bếp' },
  { key: 'Home Appliances', vi: 'Thiết bị gia dụng' },
  { key: 'Sports & Outdoors', vi: 'Thể thao & Dã ngoại' },
  { key: 'Beauty', vi: 'Làm đẹp' }
];

function fetchAdmin(cat) {
  return new Promise((resolve) => {
    const url = `https://api.ashfordorder.com/api/admin/products?limit=1&category=${encodeURIComponent(cat)}`;
    const req = https.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.data?.pagination?.total || 0);
        } catch (e) {
          resolve('ERR');
        }
      });
    });
    req.on('error', () => resolve('ERR'));
  });
}

async function run() {
  console.log('Testing category filters via API (with valid Admin JWT):\n');
  for (const c of categories) {
    const countKey = await fetchAdmin(c.key);
    const countVi = await fetchAdmin(c.vi);
    console.log(`- ${c.vi.padEnd(25)} (key: ${c.key.padEnd(22)}): ${countKey} SP`);
  }
}

run();
