const { Client } = require('ssh2');
const c = new Client();
c.on('ready', () => {
  const query = 'SELECT count(*) as count FROM product WHERE price IS NULL OR price <= 0;';
  c.exec(`mysql -u root -p0904521297t greeting_message -e "${query}"`, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d);
    stream.on('close', () => {
      console.log('Result:', out);
      c.end();
    });
  });
}).connect({
  host: '223.130.11.200',
  port: 22,
  username: 'root',
  password: '0904521297t'
});
