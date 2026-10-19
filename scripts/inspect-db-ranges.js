const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const query = `
    SELECT 
      CASE 
        WHEN id <= 2100 THEN 'original/amazon (<=2100)'
        WHEN id BETWEEN 2101 AND 2500 THEN '2101-2500'
        WHEN id BETWEEN 2501 AND 5000 THEN '2501-5000'
        ELSE '> 5000'
      END as id_range,
      COUNT(*) as count,
      COUNT(DISTINCT name) as unique_names,
      COUNT(DISTINCT image) as unique_images,
      MIN(price) as min_price,
      MAX(price) as max_price
    FROM product
    GROUP BY id_range;
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
