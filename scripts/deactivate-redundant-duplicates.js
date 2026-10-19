const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ Connected to VPS. Deactivating 1,305 redundant duplicates...');

  const query = `
    -- Temporary table to hold IDs of products to keep
    CREATE TEMPORARY TABLE keep_products AS
    SELECT DISTINCT productId as id FROM greeting_message.order WHERE productId IS NOT NULL
    UNION
    SELECT MIN(id) as id FROM product WHERE isActive = 1 GROUP BY name, brand, category;

    -- Update products not in keep_products to isActive = 0
    UPDATE product
    SET isActive = 0
    WHERE isActive = 1
      AND id NOT IN (SELECT id FROM keep_products);

    -- Check results
    SELECT 
      SUM(CASE WHEN isActive = 1 THEN 1 ELSE 0 END) as active_products,
      SUM(CASE WHEN isActive = 0 THEN 1 ELSE 0 END) as inactive_products,
      COUNT(DISTINCT CASE WHEN isActive = 1 THEN name END) as unique_active_names,
      COUNT(DISTINCT CASE WHEN isActive = 1 THEN image END) as unique_active_images
    FROM product;
  `;

  conn.exec(`mysql -u root -p0904521297t greeting_message << 'EOF'\n${query}\nEOF`, (err, stream) => {
    if (err) throw err;
    let out = '';
    let errOut = '';
    stream.on('data', d => out += d);
    stream.stderr.on('data', d => errOut += d);
    stream.on('close', () => {
      if (errOut) console.error('STDERR:', errOut);
      console.log('STDOUT:\n', out);
      conn.end();
    });
  });
}).connect({
  host: '223.130.11.200',
  port: 22,
  username: 'root',
  password: '0904521297t'
});
