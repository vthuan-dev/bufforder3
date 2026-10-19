const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const query = 'mysql -u root -p0904521297t greeting_message -e "SELECT category, COUNT(*) as count FROM product GROUP BY category ORDER BY count DESC; SELECT COUNT(*) as total FROM product;"';
  conn.exec(query, (err, stream) => {
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
