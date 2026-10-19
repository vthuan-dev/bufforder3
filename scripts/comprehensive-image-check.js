const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const remoteCmd = `cd /opt/bufforder/backend && node -e "
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    async function main() {
      console.log('Fetching all active products...');
      const prods = await prisma.product.findMany({
        where: { isActive: true },
        select: { id: true, name: true, price: true, image: true, brand: true }
      });
      console.log('Total active products:', prods.length);

      const urlToProducts = new Map();
      let emptyCount = 0;
      for (const p of prods) {
        if (!p.image || !p.image.trim()) {
          emptyCount++;
          continue;
        }
        const img = p.image.trim();
        if (!urlToProducts.has(img)) urlToProducts.set(img, []);
        urlToProducts.get(img).push(p);
      }

      console.log('Unique image URLs to verify:', urlToProducts.size);
      if (emptyCount > 0) console.log('Products with empty image:', emptyCount);

      const urls = Array.from(urlToProducts.keys());
      const broken = [];
      const batchSize = 30;

      for (let i = 0; i < urls.length; i += batchSize) {
        const batch = urls.slice(i, i + batchSize);
        await Promise.all(batch.map(async (url) => {
          try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 5000);
            const res = await fetch(url, {
              method: 'GET',
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
              },
              signal: controller.signal
            });
            clearTimeout(timer);
            if (!res.ok) {
              broken.push({ url, status: res.status, prods: urlToProducts.get(url) });
            }
          } catch (e) {
            broken.push({ url, error: e.message, prods: urlToProducts.get(url) });
          }
        }));

        if ((i + batchSize) % 150 === 0 || i + batchSize >= urls.length) {
          process.stdout.write(\`Checked \${Math.min(i + batchSize, urls.length)}/\${urls.length} (broken found: \${broken.length})\\n\`);
        }
      }

      console.log('\\n=== SUMMARY ===');
      console.log('Total checked:', urls.length);
      console.log('Total broken URLs:', broken.length);

      if (broken.length > 0) {
        console.log('\\nBroken URLs detail:');
        for (const b of broken) {
          console.log(\`URL: \${b.url} | Status: \${b.status || b.error} | Affected products count: \${b.prods.length}\`);
          for (const p of b.prods.slice(0, 5)) {
            console.log(\`   - [\${p.id}] \${p.name} (\$\${p.price}) [\${p.brand}]\`);
          }
        }
      } else {
        console.log('🎉 100% OF ACTIVE PRODUCT IMAGES ARE VALID AND WORKING!');
      }

      await prisma.\\$disconnect();
    }
    main();
  "`;

  conn.exec(remoteCmd, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => {
      process.stdout.write(d);
      out += d;
    });
    stream.stderr.on('data', d => {
      process.stderr.write(d);
      out += d;
    });
    stream.on('close', (code) => {
      console.log(`\nSSH session closed with exit code: ${code}`);
      conn.end();
    });
  });
}).connect({
  host: '223.130.11.200',
  port: 22,
  username: 'root',
  password: '0904521297t'
});
