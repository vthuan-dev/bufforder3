const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const query = `
    SELECT price, COUNT(*) as cnt 
    FROM product 
    WHERE price > 100000 
    GROUP BY price 
    ORDER BY price DESC 
    LIMIT 20;

    SELECT id, name, brand, category, price 
    FROM product 
    WHERE price >= 300000 
    LIMIT 10;
  `;

  conn.exec(`mysql -u root -p0904521297t greeting_message -e "${query}"`, (err, stream) => {
    if (err) throw err;
    let out = '';
    let errOut = '';
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
