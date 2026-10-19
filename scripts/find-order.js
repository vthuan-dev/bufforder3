const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const sql = "SELECT id, userId, orderNumber, productName, productPrice, commissionAmount, status, createdAt FROM `order` WHERE orderNumber LIKE '%06866943794%' OR productName LIKE '%Marcie%' LIMIT 5";
  conn.exec(`mysql -u root -p0904521297t greeting_message -e "${sql}"`, (err, stream) => {
    let out = '';
    stream.on('data', d => out += d);
    stream.on('close', () => {
      console.log(out);
      conn.end();
    });
  });
}).connect({ host: '223.130.11.200', port: 22, username: 'root', password: '0904521297t' });
