const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const sql = "SELECT id, name, brand, category, price, SUBSTRING(image, 1, 65) as img FROM product WHERE name LIKE '%iPhone 17%' OR name LIKE '%iPhone 18%' ORDER BY name ASC LIMIT 35;";
  conn.exec(`mysql -u root -p0904521297t greeting_message -e "${sql}"`, (err, stream) => {
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
