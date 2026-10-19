const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const remoteCmd = `cd /opt/bufforder/backend && node -e "
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    async function main() {
      const prods = await prisma.product.findMany({
        where: { isActive: true, price: { gte: 500, lte: 1500 } },
        select: { id: true, name: true, price: true, image: true, brand: true }
      });
      console.log('Total active products $500-$1500:', prods.length);

      const uniqueUrls = [...new Set(prods.map(p => p.image).filter(Boolean))];
      console.log('Unique image URLs:', uniqueUrls.length);

      const broken = [];
      for (const url of uniqueUrls) {
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 3000);
          const res = await fetch(url, { 
            headers: { 'User-Agent': 'Mozilla/5.0' },
            signal: controller.signal 
          });
          clearTimeout(timer);
          if (!res.ok) {
            broken.push({ url, status: res.status });
          }
        } catch (e) {
          broken.push({ url, error: e.message });
        }
      }

      console.log('Broken count in $500-$1500 range:', broken.length);
      for (const b of broken) {
        const affected = prods.filter(p => p.image === b.url);
        console.log(\`Broken URL: \${b.url} (status: \${b.status || b.error}) -> \${affected.length} products:\`);
        affected.forEach(p => console.log(\`   [\${p.id}] \${p.name} (\$\${p.price})\`));
      }
      await prisma.\\$disconnect();
    }
    main();
  "`;

  conn.exec(remoteCmd, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d);
    stream.stderr.on('data', d => out += d);
    stream.on('close', (code) => {
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
