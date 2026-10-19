const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const query = `
    SELECT 
      CASE WHEN id < 25590 THEN 'Trước khi thêm (cũ)' ELSE 'Vừa thêm (mới)' END as source_batch,
      COUNT(*) as total_count,
      SUM(CASE WHEN isActive = 1 THEN 1 ELSE 0 END) as active_count,
      SUM(CASE WHEN isActive = 0 THEN 1 ELSE 0 END) as inactive_count
    FROM product
    WHERE price BETWEEN 10000 AND 20000
    GROUP BY source_batch;
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
