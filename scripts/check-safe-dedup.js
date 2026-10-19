const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ Connected to VPS. Analyzing duplicates to deactivate...');

  const query = `
    -- Find duplicates: for each (name, brand, category) where count > 1,
    -- identify IDs that are NOT in \`order\`.
    SELECT COUNT(*) as duplicate_records
    FROM product p
    WHERE p.isActive = 1
      AND p.id NOT IN (SELECT DISTINCT productId FROM greeting_message.order WHERE productId IS NOT NULL)
      AND p.id NOT IN (
        SELECT min_id FROM (
          SELECT MIN(id) as min_id 
          FROM product 
          WHERE isActive = 1 
          GROUP BY name, brand, category
        ) as t
      );
  `;

  conn.exec(`mysql -u root -p0904521297t greeting_message -e "${query}"`, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d);
    stream.on('close', () => {
      console.log('Duplicate records that can be safely marked isActive = 0:\n', out);
      conn.end();
    });
  });
}).connect({
  host: '223.130.11.200',
  port: 22,
  username: 'root',
  password: '0904521297t'
});
