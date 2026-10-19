const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const query = `
    SELECT 
      COUNT(*) as total_products,
      SUM(CASE WHEN isActive = 1 THEN 1 ELSE 0 END) as current_active,
      SUM(CASE WHEN isActive = 0 THEN 1 ELSE 0 END) as current_inactive,
      SUM(CASE WHEN name IS NULL OR name = '' THEN 1 ELSE 0 END) as invalid_name,
      SUM(CASE WHEN price IS NULL OR price <= 0 THEN 1 ELSE 0 END) as invalid_price,
      SUM(CASE WHEN image IS NULL OR image = '' THEN 1 ELSE 0 END) as invalid_image
    FROM product;
  `;
  conn.exec(`mysql -u root -p0904521297t greeting_message -e "${query}"`, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d);
    stream.stderr.on('data', () => {});
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
