const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const q = `SELECT id, name, brand, price, image FROM product WHERE name LIKE '%Rolex GMT Master II Pepsi%' LIMIT 10`;
  conn.exec(`mysql -u root -p0904521297t greeting_message -e "${q}"`, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d);
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
