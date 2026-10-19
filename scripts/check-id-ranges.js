const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const sql = "SELECT category, min(id) as min_id, max(id) as max_id, count(*) as cnt FROM product WHERE isActive = 1 AND price BETWEEN 500 AND 800 GROUP BY category ORDER BY max_id DESC";
  conn.exec(`mysql -u root -p0904521297t greeting_message -e "${sql}"`, (err, stream) => {
    let out = '';
    stream.on('data', d => out += d);
    stream.on('close', () => {
      console.log(out);
      conn.end();
    });
  });
}).connect({ host: '223.130.11.200', port: 22, username: 'root', password: '0904521297t' });
