const fs = require('fs');
const path = require('path');
const { Client } = require('ssh2');

const localSqlFile = path.join(__dirname, 'dataset-15000-luxury.sql');
const remoteSqlFile = '/root/dataset-15000-luxury.sql';

if (!fs.existsSync(localSqlFile)) {
  console.error('❌ File SQL chưa tồn tại. Cần chạy generate-luxury-sql.js trước!');
  process.exit(1);
}

const stats = fs.statSync(localSqlFile);
console.log('🚀 Bắt đầu quy trình nạp an toàn bộ dữ liệu 15,000 Luxury Products lên VPS...');
console.log(`📄 File SQL nguồn: ${localSqlFile} (${(stats.size / (1024 * 1024)).toFixed(2)} MB)`);

const conn = new Client();

conn.on('ready', () => {
  console.log('✅ Đã kết nối SSH thành công tới VPS 223.130.11.200');

  // Bước 1: Sao lưu bảng product hiện tại
  const backupCmd = `mysqldump -u root -p0904521297t greeting_message product > /root/backup_product_before_15000_$(date +%s).sql`;
  console.log('🛡️ Bước 1/4: Đang thực hiện sao lưu bảng product dự phòng...');

  conn.exec(backupCmd, (err, stream) => {
    if (err) {
      console.error('❌ Lỗi sao lưu:', err);
      conn.end();
      return;
    }

    stream.on('data', () => {});
    stream.stderr.on('data', () => {});

    stream.on('close', (code) => {
      if (code !== 0) {
        console.error('❌ Sao lưu thất bại với code:', code);
        conn.end();
        return;
      }
      console.log('✅ Đã tạo bản sao lưu snapshot an toàn trên VPS!');

      // Bước 2: SFTP Upload file SQL
      console.log('📤 Bước 2/4: Đang upload dataset-15000-luxury.sql lên VPS qua SFTP...');
      conn.sftp((errSftp, sftp) => {
        if (errSftp) {
          console.error('❌ Lỗi SFTP:', errSftp);
          conn.end();
          return;
        }

        const readStream = fs.createReadStream(localSqlFile);
        const writeStream = sftp.createWriteStream(remoteSqlFile);

        readStream.pipe(writeStream);

        writeStream.on('close', () => {
          console.log('✅ Đã upload xong toàn bộ file SQL lên /root/dataset-15000-luxury.sql');

          // Bước 3: Ẩn sản phẩm cũ & nạp sản phẩm mới
          console.log('⚡ Bước 3/4: Đang deactive sản phẩm cũ và nạp 15,000 sản phẩm Luxury...');
          const deployCmd = `
            mysql -u root -p0904521297t greeting_message -e "
              UPDATE product SET isActive = 0 WHERE id NOT IN (SELECT DISTINCT productId FROM \\\`order\\\` WHERE productId IS NOT NULL);
            " && mysql -u root -p0904521297t greeting_message < ${remoteSqlFile}
          `;

          const startTime = Date.now();
          conn.exec(deployCmd, (errExec, streamExec) => {
            if (errExec) {
              console.error('❌ Lỗi thực thi import:', errExec);
              conn.end();
              return;
            }

            let stderr = '';
            streamExec.stderr.on('data', (d) => (stderr += d));

            streamExec.on('close', (importCode) => {
              const duration = ((Date.now() - startTime) / 1000).toFixed(2);
              if (importCode !== 0) {
                console.error(`❌ Import lỗi (code ${importCode}):`, stderr);
                conn.end();
                return;
              }
              console.log(`🎉 Nạp dữ liệu hoàn tất trong ${duration}s!`);

              // Bước 4: Kiểm tra và xác nhận toàn vẹn
              console.log('🔍 Bước 4/4: Kiểm tra xác nhận dữ liệu trên database production...');
              const verifyQuery = `
                mysql -u root -p0904521297t greeting_message -e "
                  SELECT '=== THỐNG KÊ SẢN PHẨM TRÊN PROD ===' as title;
                  SELECT 
                    COUNT(*) as total_all_products,
                    SUM(isActive = 1) as active_products,
                    SUM(isActive = 0) as inactive_products
                  FROM product;

                  SELECT '=== KIỂM TRA ĐƠN HÀNG LỊCH SỬ ===' as title;
                  SELECT COUNT(*) as total_orders FROM \\\`order\\\`;

                  SELECT '=== PHÂN BỔ SẢN PHẨM ACTIVE THEO DANH MỤC ===' as title;
                  SELECT category, COUNT(*) as count 
                  FROM product 
                  WHERE isActive = 1 
                  GROUP BY category 
                  ORDER BY count DESC;

                  SELECT '=== TOP THƯƠNG HIỆU LUXURY ACTIVE ===' as title;
                  SELECT brand, COUNT(*) as count 
                  FROM product 
                  WHERE isActive = 1 
                  GROUP BY brand 
                  ORDER BY count DESC 
                  LIMIT 15;

                  SELECT '=== MẪU SẢN PHẨM ACTIVE TRÊN PROD ===' as title;
                  SELECT id, name, brand, category, price, SUBSTRING(image, 1, 65) as image_preview 
                  FROM product 
                  WHERE isActive = 1 
                  ORDER BY id DESC 
                  LIMIT 8;
                "
              `;

              conn.exec(verifyQuery, (errVerify, streamVerify) => {
                if (errVerify) {
                  console.error('❌ Lỗi chạy query kiểm tra:', errVerify);
                  conn.end();
                  return;
                }

                let output = '';
                streamVerify.on('data', (d) => (output += d));
                streamVerify.on('close', () => {
                  console.log('\n📊 KẾT QUẢ XÁC NHẬN TỪ PRODUCTION DATABASE:');
                  console.log(output);
                  conn.end();
                });
              });
            });
          });
        });

        writeStream.on('error', (errWrite) => {
          console.error('❌ Lỗi ghi file SFTP:', errWrite);
          conn.end();
        });
      });
    });
  });
}).connect({
  host: '223.130.11.200',
  port: 22,
  username: 'root',
  password: '0904521297t',
});
