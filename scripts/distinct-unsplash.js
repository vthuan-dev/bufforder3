const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const q = `
    SELECT COUNT(DISTINCT image) as unique_unsplash_urls, COUNT(*) as total_unsplash_rows 
    FROM product 
    WHERE image LIKE '%unsplash%';
    
    SELECT image, COUNT(*) as cnt, MIN(name) as sample_name, MIN(price) as price 
    FROM product 
    WHERE image LIKE '%unsplash%' 
    GROUP BY image 
    ORDER BY cnt DESC;
  `;
  conn.exec(`mysql -u root -p0904521297t greeting_message -e "${q.replace(/\r?\n/g, ' ')}"`, (err, stream) => {
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
