const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const ids = Array.from({ length: 16 }, (_, i) => 5549 + i).join(',');
  const sql = `SELECT id, productId FROM \`order\` WHERE productId IN (${ids});`;
  conn.exec(`mysql -u root -p0904521297t greeting_message -e "${sql}"`, (err, stream) => {
    let out = '';
    stream.on('data', d => out += d);
    stream.stderr.on('data', () => {});
    stream.on('close', () => {
      console.log('Order references:', out.trim() || 'NONE');
      conn.end();
    });
  });
}).connect({
  host: '223.130.11.200',
  port: 22,
  username: 'root',
  password: '0904521297t'
});
