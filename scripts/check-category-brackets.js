const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const sql = `
    SELECT 
      CASE 
        WHEN price < 200 THEN '1. < $200'
        WHEN price BETWEEN 200 AND 500 THEN '2. $200 - $500'
        WHEN price BETWEEN 500 AND 800 THEN '3. $500 - $800'
        WHEN price BETWEEN 800 AND 1200 THEN '4. $800 - $1200'
        WHEN price BETWEEN 1200 AND 2000 THEN '5. $1200 - $2000'
        ELSE '6. > $2000'
      END as price_bracket,
      category,
      count(*) as cnt
    FROM product
    WHERE isActive = 1
    GROUP BY price_bracket, category
    ORDER BY price_bracket, cnt DESC;
  `;
  conn.exec(`mysql -u root -p0904521297t greeting_message -e "${sql.replace(/\n/g, ' ')}"`, (err, stream) => {
    let out = '';
    stream.on('data', d => out += d);
    stream.on('close', () => {
      console.log(out);
      conn.end();
    });
  });
}).connect({ host: '223.130.11.200', port: 22, username: 'root', password: '0904521297t' });
