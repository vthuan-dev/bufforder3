const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const query = 'curl -s -k https://ashfordorder.com/api/health;';
  conn.exec(query, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d);
    stream.stderr.on('data', () => {});
    stream.on('close', () => {
      console.log('API health response:', out);
      conn.end();
    });
  });
}).connect({
  host: '223.130.11.200',
  port: 22,
  username: 'root',
  password: '0904521297t'
});
