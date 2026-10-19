const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const query = `
    SELECT id, name, brand, category, price, image 
    FROM product 
    WHERE name LIKE '%Omega Constellation%' 
       OR name LIKE '%Omega Seamaster%' 
       OR name LIKE '%Patek Philippe Annual Calendar%' 
       OR name LIKE '%Rolex GMT-Master%' 
       OR name LIKE '%Cartier Tank%' 
       OR name LIKE '%Seiko Presage%' 
       OR name LIKE '%Garmin Forerunner%' 
       OR name LIKE '%Garmin Fenix%' 
       OR name LIKE '%Rolex Submariner%'
    LIMIT 30;
  `;
  conn.exec(`mysql -u root -p0904521297t greeting_message -e "${query}"`, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d);
    stream.on('close', () => {
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
