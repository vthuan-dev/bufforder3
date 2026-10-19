const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ SSH Client Ready - Fetching backend error logs');
  
  const cmd = 'tail -n 100 /root/.pm2/logs/bufforder-backend-error.log && echo "=== OUTPUT LOGS ===" && tail -n 100 /root/.pm2/logs/bufforder-backend-out.log';
  
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log(`Connection closed with code: ${code}`);
      conn.end();
    }).on('data', (data) => {
      process.stdout.write(data);
    }).stderr.on('data', (data) => {
      process.stderr.write(data);
    });
  });
}).connect({
  host: '223.130.11.200',
  port: 22,
  username: 'root',
  password: '0904521297t'
});
