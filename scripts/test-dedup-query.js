const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const query = `
    SELECT COUNT(*) as total_active, COUNT(DISTINCT name) as unique_names, COUNT(DISTINCT image) as unique_images 
    FROM product 
    WHERE isActive = 1;

    -- Count duplicate names in Watches
    SELECT name, COUNT(*) as c 
    FROM product 
    WHERE category = 'Watches' AND isActive = 1 
    GROUP BY name 
    HAVING c > 1 
    ORDER BY c DESC 
    LIMIT 10;
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
