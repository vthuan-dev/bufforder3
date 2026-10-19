const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const query = `
    SELECT id, name, brand, category, price, isActive FROM product ORDER BY id ASC LIMIT 3;
    SELECT id, name, brand, category, price, isActive FROM product ORDER BY id DESC LIMIT 3;
  `;
  conn.exec(`mysql -u root -p0904521297t greeting_message -e "${query}"`, (err, stream) => {
    if (err) throw err;
    let out = '';
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
