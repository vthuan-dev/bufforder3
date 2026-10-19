const { Client } = require('ssh2');

const c = new Client();
c.on('ready', () => {
  const q = `
    SELECT 'chatthread' as tbl, count(*) as count FROM chatthread
    UNION ALL
    SELECT 'chatmessage', count(*) FROM chatmessage;
  `;
  c.exec(`mysql -u root -p0904521297t greeting_message -e "${q}"`, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d);
    stream.on('close', () => {
      console.log(out);

      c.exec(`mysql -u root -p0904521297t greeting_message -e "SELECT * FROM chatthread LIMIT 5;"`, (err2, s2) => {
        let out2 = '';
        s2.on('data', d => out2 += d);
        s2.on('close', () => {
          console.log('THREADS DATA:');
          console.log(out2);

          c.exec(`mysql -u root -p0904521297t greeting_message -e "SELECT * FROM chatmessage LIMIT 10;"`, (err3, s3) => {
            let out3 = '';
            s3.on('data', d => out3 += d);
            s3.on('close', () => {
              console.log('MESSAGES DATA:');
              console.log(out3);
              c.end();
            });
          });
        });
      });
    });
  });
}).connect({
  host: '223.130.11.200',
  port: 22,
  username: 'root',
  password: '0904521297t'
});
