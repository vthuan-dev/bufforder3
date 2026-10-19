const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const sql = "SELECT count(*) as total, sum(isActive=1) as active, sum(name LIKE '%iPhone%') as iphones FROM product;";
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
