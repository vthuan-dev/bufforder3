const { Client } = require('ssh2');

const c = new Client();
c.on('ready', () => {
  c.exec(`mysql -u root -p0904521297t greeting_message -e "SHOW TABLES;"`, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d);
    stream.on('close', () => {
      console.log('TABLES:');
      console.log(out);
      c.end();
    });
  });
}).connect({
  host: '223.130.11.200',
  port: 22,
  username: 'root',
  password: '0904521297t'
});
