const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const query = "SELECT COUNT(*) as total_orders FROM greeting_message.order; SELECT productId, COUNT(*) as c FROM greeting_message.order WHERE productId IS NOT NULL GROUP BY productId ORDER BY c DESC LIMIT 10; SELECT DISTINCT status FROM greeting_message.order;";
  conn.exec(`mysql -u root -p0904521297t greeting_message -e "${query}"`, (err, stream) => {
    if (err) throw err;
    let out = '';
    let errOut = '';
    stream.on('data', d => out += d);
    stream.stderr.on('data', d => errOut += d);
    stream.on('close', () => {
      if (errOut) console.error('STDERR:', errOut);
      console.log('STDOUT:\n', out);
      conn.end();
    });
  });
}).connect({
  host: '223.130.11.200',
  port: 22,
  username: 'root',
  password: '0904521297t'
});
