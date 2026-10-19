const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const vpsScript = `
    const jwt = require('/opt/bufforder/backend/node_modules/jsonwebtoken');
    const http = require('http');
    const secret = process.env.JWT_SECRET || 'your_jwt_secret_key_here_change_this_in_production';
    const adminToken = jwt.sign({ userId: 1, role: 'ADMIN', isAdmin: true }, secret);

    http.get('http://localhost:5000/api/admin/products/find-by-price/70000', {
      headers: { 'Authorization': 'Bearer ' + adminToken }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log('Raw JSON:', JSON.stringify(json, null, 2));
        } catch (e) {
          console.log(data);
        }
        process.exit(0);
      });
    });
  `;

  conn.exec(`node -e "${vpsScript.replace(/\r?\n/g, ' ')}"`, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d);
    stream.stderr.on('data', d => out += d);
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
