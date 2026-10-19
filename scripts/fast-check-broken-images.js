const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const remoteCmd = `cd /opt/bufforder/backend && node -e "
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    async function main() {
      const prods = await prisma.product.findMany({
        where: { isActive: true },
        select: { id: true, name: true, price: true, image: true, brand: true }
      });
      console.log('Total active products:', prods.length);

      const uniqueImgs = [...new Set(prods.map(p => p.image).filter(Boolean))];
      console.log('Total unique images:', uniqueImgs.length);

      const broken = [];
      const batchSize = 50;
      for (let i = 0; i < uniqueImgs.length; i += batchSize) {
        const batch = uniqueImgs.slice(i, i + batchSize);
        await Promise.all(batch.map(async (url) => {
          try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 4000);
            const res = await fetch(url, { method: 'HEAD', signal: controller.signal });
            clearTimeout(timer);
            if (!res.ok) {
              broken.push({ url, status: res.status });
            }
          } catch (e) {
            broken.push({ url, error: e.message });
          }
        }));
        if ((i + batchSize) % 200 === 0 || i + batchSize >= uniqueImgs.length) {
          console.log(\`Checked \${Math.min(i + batchSize, uniqueImgs.length)}/\${uniqueImgs.length} - found \${broken.length} broken\`);
        }
      }

      console.log('Total broken unique image URLs:', broken.length);
      console.log(JSON.stringify(broken, null, 2));
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
