const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const query = `
    SELECT 'Active (Dang hoat dong)' as status, MIN(id) as min_id, MAX(id) as max_id, COUNT(*) as cnt 
    FROM product WHERE id >= 25590 AND isActive = 1
    UNION ALL
    SELECT 'Inactive (Khong hoat dong)' as status, MIN(id) as min_id, MAX(id) as max_id, COUNT(*) as cnt 
    FROM product WHERE id >= 25590 AND isActive = 0;
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
}).connect({ host: '223.130.11.200', username: 'root', password: '0904521297t' });
