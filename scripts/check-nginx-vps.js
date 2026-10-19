const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec("nginx -T | grep -E 'server_name|listen|proxy_pass'", (err, stream) => {
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
