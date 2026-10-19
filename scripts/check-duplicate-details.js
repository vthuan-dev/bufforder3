const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const query = `
    SELECT COUNT(*) as order_count_new_ids FROM \\\`order\\\` WHERE productId >= 25590;
    SELECT 
      COUNT(*) as total_inactive_new,
      COUNT(DISTINCT image) as unique_images_among_inactive
    FROM product 
    WHERE id >= 25590 AND isActive = 0;
  `;

  conn.exec(`mysql -u root -p0904521297t greeting_message -e "${query}"`, (err, stream) => {
    if (err) {
      console.error('Exec error:', err);
      conn.end();
      return;
    }
    let out = '';
    let errOut = '';
    stream.on('data', d => out += d);
    stream.stderr.on('data', d => errOut += d);
    stream.on('close', () => {
      if (errOut) console.error('STDERR:', errOut);
      console.log('STDOUT:', out);
      conn.end();
    });
  });

}).connect({ host: '223.130.11.200', username: 'root', password: '0904521297t' });
