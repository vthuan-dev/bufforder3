const fs = require('fs');
const path = require('path');
const { Client } = require('ssh2');

const localFile = path.join(__dirname, '..', 'backend', 'routes', 'admin.js');
const remoteFile = '/opt/bufforder/backend/routes/admin.js';

console.log('🚀 Đang tải backend/routes/admin.js lên VPS...');
const conn = new Client();
conn.on('ready', () => {
  conn.sftp((errSftp, sftp) => {
    if (errSftp) throw errSftp;
    const readStream = fs.createReadStream(localFile);
    const writeStream = sftp.createWriteStream(remoteFile);

    readStream.pipe(writeStream);
    writeStream.on('close', () => {
      console.log('✅ Đã upload file admin.js lên VPS thành công!');
      console.log('🔄 Đang reload PM2 bufforder-backend...');
      conn.exec('pm2 reload bufforder-backend', (errExec, streamExec) => {
        if (errExec) throw errExec;
        let out = '';
        streamExec.on('data', d => out += d);
        streamExec.stderr.on('data', () => {});
        streamExec.on('close', () => {
          console.log(out);
          console.log('🎉 Đã khởi động lại bufforder-backend thành công!');
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
