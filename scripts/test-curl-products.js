const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const cmd = `
    node -e "
      const jwt = require('/opt/bufforder/backend/node_modules/jsonwebtoken');
      const secret = process.env.JWT_SECRET || 'your_jwt_secret_key_here_change_this_in_production';
      const token = jwt.sign({ userId: 'cmuebbtra068dl65kvlfi1nvo', phoneNumber: '9893422747' }, secret);
      console.log(token);
    "
  `;

  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    let token = '';
    stream.on('data', d => token += d);
    stream.on('close', () => {
      token = token.trim();
      console.log('Got token:', token.substring(0, 30) + '...');
      
      const curlCmd = `curl -s -H "Authorization: Bearer ${token}" http://localhost:5000/api/products`;
      conn.exec(curlCmd, (err2, stream2) => {
        let out = '';
        stream2.on('data', d => out += d);
        stream2.on('close', () => {
          try {
            const json = JSON.parse(out);
            console.log('Success:', json.success);
            console.log('Total products returned:', json.data.length);
            console.log('\nTop 8 products displayed:');
            json.data.slice(0, 8).forEach((p, i) => {
              console.log(`${i+1}. [${p.category}] ${p.brand} - ${p.name.substring(0, 40)}: $${p.price}`);
            });
            const names = json.data.map(p => p.name.trim().toLowerCase().slice(0, 20));
            const imgs = json.data.map(p => (p.image || '').split('?')[0]);
            console.log('\nDeduplication verification:');
            console.log('Total items:', json.data.length);
            console.log('Unique names:', new Set(names).size);
            console.log('Unique images:', new Set(imgs).size);
          } catch (e) {
            console.log('Output:', out.substring(0, 200));
          }
          conn.end();
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
