const fs = require('fs');
const path = require('path');
const { Client } = require('ssh2');

const localSqlFile = path.join(__dirname, 'dataset-5300-new.sql');
const remoteSqlFile = '/root/dataset-5300-new.sql';

console.log('🚀 Bắt đầu quá trình seed 5,300 sản phẩm lên VPS...');
console.log('📄 File SQL nguồn:', localSqlFile);

const conn = new Client();

conn.on('ready', () => {
  console.log('✅ Đã kết nối SSH thành công tới VPS 223.130.11.200');

  // 1. Dùng SFTP upload file SQL
  conn.sftp((err, sftp) => {
    if (err) {
      console.error('❌ Lỗi mở kết nối SFTP:', err);
      conn.end();
      return;
    }

    console.log('📤 Đang upload dataset-5300-new.sql lên /root/dataset-5300-new.sql...');
    const readStream = fs.createReadStream(localSqlFile);
    const writeStream = sftp.createWriteStream(remoteSqlFile);

    readStream.pipe(writeStream);

    writeStream.on('close', () => {
      console.log('✅ Upload hoàn tất! Kích thước file đã chuyển xong.');

      // 2. Chạy lệnh import MySQL
      const importCmd = `mysql -u root -p0904521297t greeting_message < ${remoteSqlFile}`;
      console.log('⚡ Đang thực thi lệnh import SQL vào database greeting_message...');
      
      const startTime = Date.now();
      conn.exec(importCmd, (err, stream) => {
        if (err) {
          console.error('❌ Lỗi thực thi import:', err);
          conn.end();
          return;
        }

        let stderr = '';
        stream.stderr.on('data', d => stderr += d);

        stream.on('close', (code) => {
          const duration = ((Date.now() - startTime) / 1000).toFixed(2);
          if (code !== 0) {
            console.error(`❌ Import lỗi (code ${code}):`, stderr);
            conn.end();
            return;
          }
          console.log(`🎉 Import thành công trong ${duration}s!`);

          // 3. Chạy các truy vấn kiểm tra xác thực
          const verifyQuery = `
            mysql -u root -p0904521297t greeting_message -e "
              SELECT '=== TỔNG SỐ SẢN PHẨM HIỆN TẠI ===' as title;
              SELECT COUNT(*) as total_products FROM product;

              SELECT '=== PHÂN BỔ THEO DANH MỤC TOP ===' as title;
              SELECT category, COUNT(*) as count FROM product GROUP BY category ORDER BY count DESC LIMIT 15;

              SELECT '=== SẢN PHẨM IPHONE 18 VỪA SEED ===' as title;
              SELECT id, name, brand, category, price, SUBSTRING(image, 1, 50) as image_url FROM product WHERE name LIKE '%iPhone 18%' LIMIT 5;

              SELECT '=== SẢN PHẨM THỜI TRANG (CLOTHING) VỪA SEED ===' as title;
              SELECT id, name, brand, category, price, SUBSTRING(image, 1, 50) as image_url FROM product WHERE category = 'Clothing' ORDER BY id DESC LIMIT 5;
            "
          `;

          conn.exec(verifyQuery, (err2, stream2) => {
            if (err2) {
              console.error('❌ Lỗi chạy query kiểm tra:', err2);
              conn.end();
              return;
            }

            let output = '';
            stream2.on('data', d => output += d);
            stream2.on('close', () => {
              console.log('\n📊 KẾT QUẢ KIỂM TRA DATABASE:');
              console.log(output);
              conn.end();
            });
          });
        });
      });
    });

    writeStream.on('error', (err) => {
      console.error('❌ Lỗi ghi file SFTP:', err);
      conn.end();
    });
  });
}).connect({
  host: '223.130.11.200',
  port: 22,
  username: 'root',
  password: '0904521297t'
});
