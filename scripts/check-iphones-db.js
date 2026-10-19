const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const sql = "SELECT id, name, brand, price, category, image FROM product WHERE name LIKE '%iPhone%' ORDER BY id DESC LIMIT 50;";
  conn.exec(`mysql -u root -p0904521297t greeting_message -e "${sql}"`, (err, stream) => {
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
