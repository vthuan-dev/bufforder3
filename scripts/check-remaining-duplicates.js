const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const query = `
    SELECT category, COUNT(*) as count, COUNT(DISTINCT image) as unique_images, COUNT(DISTINCT name) as unique_names
    FROM product
    WHERE isActive = 1
    GROUP BY category;

    -- Check which images are still repeated more than 5 times
    SELECT image, COUNT(*) as c, SUBSTRING(GROUP_CONCAT(name SEPARATOR ' | '), 1, 100) as sample_names
    FROM product
    WHERE isActive = 1
    GROUP BY image
    HAVING c > 5
    ORDER BY c DESC
    LIMIT 15;
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
