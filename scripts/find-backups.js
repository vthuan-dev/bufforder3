const { Client } = require('ssh2');

const c = new Client();
c.on('ready', () => {
  c.exec('find /opt /var/backups /root /tmp -name "*.sql" 2>/dev/null', (err, st) => {
    let out = '';
    st.on('data', d => out += d);
    st.on('close', () => {
      console.log('Backups found:\n', out);
      c.end();
    });
  });
}).connect({
  host: '223.130.11.200',
  port: 22,
  username: 'root',
  password: '0904521297t'
});
