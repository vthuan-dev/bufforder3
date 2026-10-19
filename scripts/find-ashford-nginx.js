const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const query = 'grep -rn "ashfordorder.com" /etc/nginx/ 2>/dev/null;';
  conn.exec(query, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d);
    stream.stderr.on('data', () => {});
    stream.on('close', () => {
      console.log('Nginx config:', out);
      conn.end();
    });
  });
}).connect({
  host: '223.130.11.200',
  port: 22,
  username: 'root',
  password: '0904521297t'
});
