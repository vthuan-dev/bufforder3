const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ Connected to VPS. Updating 34 broken Rolex products...');
  
  const verifiedRolexImage = 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80';
  
  const updateQuery = `
    UPDATE product 
    SET image = '${verifiedRolexImage}',
        name = 'Rolex GMT-Master II Pepsi Jubilee'
    WHERE image LIKE '%photo-1547996160-71dfabbce073%';
    
    SELECT id, name, price, SUBSTRING(image, 1, 65) as img 
    FROM product 
    WHERE id BETWEEN 2310 AND 2350;
  `;

  conn.exec(`mysql -u root -p0904521297t greeting_message -e "${updateQuery.replace(/\r?\n/g, ' ')}"`, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d);
    stream.stderr.on('data', d => out += d);
    stream.on('close', () => {
      console.log('Updated rows sample:');
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
