const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const q = `SELECT DISTINCT image FROM product WHERE image LIKE '%unsplash%'`;
  conn.exec(`mysql -u root -p0904521297t greeting_message -e "${q}"`, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d);
    stream.on('close', async () => {
      const urls = out.split('\n').map(l => l.trim()).filter(l => l.startsWith('http'));
      console.log('Total unique unsplash URLs:', urls.length);

      const dead = [];
      const ok = [];

      for (const url of urls) {
        try {
          const res = await fetch(url, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } });
          if (res.ok) {
            ok.push(url);
          } else {
            dead.push({ url, status: res.status });
          }
        } catch (e) {
          dead.push({ url, status: e.message });
        }
      }

      console.log('OK URLs:', ok.length);
      console.log('Dead URLs:', dead.length);
      console.log('\nList of DEAD unsplash URLs:');
      dead.forEach(d => console.log(` - ${d.status}: ${d.url}`));
      conn.end();
    });
  });
}).connect({
  host: '223.130.11.200',
  port: 22,
  username: 'root',
  password: '0904521297t'
});
