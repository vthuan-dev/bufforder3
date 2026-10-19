const fs = require('fs');
const path = require('path');
const { Client } = require('ssh2');

const jsonPath = path.join(__dirname, 'dataset-2000-luxury-10k.json');
const sqlPath = path.join(__dirname, 'dataset-2000-luxury-10k.sql');
const remoteSqlFile = '/root/dataset-2000-luxury-10k.sql';

if (!fs.existsSync(jsonPath)) {
  console.error('File JSON chưa tồn tại:', jsonPath);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
console.log(`📦 Bắt đầu xử lý ${data.length} sản phẩm $10k-$20k...`);

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  const clean = String(str)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r/g, '')
    .replace(/\n/g, ' ')
    .trim();
  return `'${clean}'`;
}

// 1. Tạo file SQL
let sql = `SET NAMES utf8mb4; SET FOREIGN_KEY_CHECKS = 0;\n\n`;
const BATCH_SIZE = 500;
let currentBatch = [];

for (let i = 0; i < data.length; i++) {
  const p = data[i];
  const name = escapeSql(p.name);
  const brand = escapeSql(p.brand || 'Luxury');
  const cat = escapeSql(p.category || 'Watches');
  const price = typeof p.price === 'number' && !isNaN(p.price) ? p.price : 12500;
  const image = escapeSql(p.image);
  const productUrl = escapeSql(p.productUrl || 'https://ashfordorder.com');
  const isActive = 1;

  currentBatch.push(`(${name}, ${brand}, ${cat}, ${price}, ${image}, ${productUrl}, ${isActive}, NOW(), NOW())`);

  if (currentBatch.length === BATCH_SIZE || i === data.length - 1) {
    sql += `INSERT INTO product (name, brand, category, price, image, productUrl, isActive, createdAt, updatedAt) VALUES\n` +
           currentBatch.join(',\n') + ';\n\n';
    currentBatch = [];
  }
}
sql += `SET FOREIGN_KEY_CHECKS = 1;\n`;
fs.writeFileSync(sqlPath, sql, 'utf8');
console.log(`✅ Đã tạo file SQL: ${sqlPath} (${(fs.statSync(sqlPath).size / 1024).toFixed(1)} KB)`);

// 2. Upload và nạp vào VPS
console.log('🚀 Kết nối VPS 223.130.11.200...');
const conn = new Client();
conn.on('ready', () => {
  conn.sftp((errSftp, sftp) => {
    if (errSftp) throw errSftp;
    console.log('📤 Đang upload SQL lên VPS...');
    const readStream = fs.createReadStream(sqlPath);
    const writeStream = sftp.createWriteStream(remoteSqlFile);

    readStream.pipe(writeStream);
    writeStream.on('close', () => {
      console.log('⚡ Đang import vào MySQL greeting_message...');
      const importCmd = `
        mysql -u root -p0904521297t greeting_message < ${remoteSqlFile} &&
        mysql -u root -p0904521297t greeting_message -e "
          CREATE TEMPORARY TABLE keep_ids AS SELECT MIN(id) as min_id FROM product WHERE isActive = 1 GROUP BY image;
          UPDATE product SET isActive = 0 WHERE isActive = 1 AND id NOT IN (SELECT min_id FROM keep_ids);

          SELECT '=== THỐNG KÊ SAU KHI THÊM HÀNG 10K-20K ===' as title;
          SELECT 
            COUNT(*) as total_active,
            SUM(CASE WHEN price BETWEEN 10000 AND 20000 THEN 1 ELSE 0 END) as in_range_10k_20k,
            COUNT(DISTINCT image) as unique_images
          FROM product 
          WHERE isActive = 1;

          SELECT '=== MẪU SẢN PHẨM 10K-20K VỪA THÊM ===' as title;
          SELECT id, name, brand, category, price, SUBSTRING(image, 1, 65) as img
          FROM product 
          WHERE isActive = 1 AND price BETWEEN 10000 AND 20000 
          ORDER BY id DESC 
          LIMIT 8;
        "
      `;

      conn.exec(importCmd, (errExec, streamExec) => {
        if (errExec) throw errExec;
        let out = '';
        streamExec.on('data', d => out += d);
        streamExec.stderr.on('data', () => {});
        streamExec.on('close', () => {
          console.log('\n📊 KẾT QUẢ TỪ DATABASE:');
          console.log(out);
          conn.end();
        });
      });
    });
  });
}).connect({
  host: '223.130.11.200',
  port: 22,
  username: 'root',
  password: '0904521297t'
});
