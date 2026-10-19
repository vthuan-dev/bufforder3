const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ Connected to VPS. Pulling latest code and restarting backend...');
  
  const cmd = `cd /opt/bufforder && git pull origin main && pm2 restart bufforder-backend`;

  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d);
    stream.stderr.on('data', d => out += d);
    stream.on('close', (code) => {
      console.log(`Exit code: ${code}`);
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
