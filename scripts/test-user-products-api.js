const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const vpsScript = `
    const jwt = require('/opt/bufforder/backend/node_modules/jsonwebtoken');
    const http = require('http');
    const secret = process.env.JWT_SECRET || 'your_jwt_secret_key_here_change_this_in_production';
    // User Nguyen Hoang Nam (9893422747)
    const token = jwt.sign({ userId: 'cmuebbtra068dl65kvlfi1nvo', phoneNumber: '9893422747' }, secret);

    http.get('http://localhost:5000/api/products', {
      headers: { 'Authorization': 'Bearer ' + token }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log('Success:', json.success);
          console.log('Total returned:', json.data.length);
          console.log('\nTop 8 products displayed to user:');
          json.data.slice(0, 8).forEach((p, idx) => {
            console.log((idx + 1) + '. [' + p.category + '] ' + p.brand + ' - ' + p.name.substring(0, 45) + ' : $' + p.price + ' | img: ' + (p.image || '').substring(0, 55));
          });

          // Check if any duplicate names or images exist in the returned array
          const names = json.data.map(p => p.name.trim().toLowerCase().slice(0, 20));
          const imgs = json.data.map(p => (p.image || '').split('?')[0]);
          const uniqueNames = new Set(names);
          const uniqueImgs = new Set(imgs);
          console.log('\nUniqueness check:');
          console.log('Total items:', json.data.length);
          console.log('Unique names:', uniqueNames.size);
          console.log('Unique images:', uniqueImgs.size);
        } catch (e) {
          console.log('Error parsing response:', data);
        }
        process.exit(0);
      });
    });
  `;

  conn.exec(`node -e "${vpsScript.replace(/\r?\n/g, ' ')}"`, (err, stream) => {
    if (err) throw err;
    let out = '';
    let errOut = '';
    stream.on('data', d => out += d);
    stream.stderr.on('data', d => out += d);
    stream.on('close', () => {
      if (errOut) console.error('STDERR:', errOut);
      console.log('STDOUT:', out);
      conn.end();
    });
  });
}).connect({
  host: '223.130.11.200',
  port: 22,
  username: 'root',
  password: '0904521297t'
});
