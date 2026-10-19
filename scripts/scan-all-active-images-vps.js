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

      // Collect unique image URLs
      const imgMap = new Map();
      for (const p of prods) {
        if (!p.image) continue;
        if (!imgMap.has(p.image)) imgMap.set(p.image, []);
        imgMap.get(p.image).push(p.id);
      }
      console.log('Total unique active image URLs:', imgMap.size);

      // Check each unique image with HEAD/GET
      const brokenImages = [];
      const entries = Array.from(imgMap.entries());
      
      const BATCH = 20;
      for (let i = 0; i < entries.length; i += BATCH) {
        const batch = entries.slice(i, i + BATCH);
        await Promise.all(batch.map(async ([url, ids]) => {
          try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 6000);
            const res = await fetch(url, { method: 'HEAD', signal: controller.signal });
            clearTimeout(timeout);
            if (res.status >= 400) {
              brokenImages.push({ url, status: res.status, count: ids.length, sampleId: ids[0] });
            }
          } catch (e) {
            brokenImages.push({ url, error: e.message, count: ids.length, sampleId: ids[0] });
          }
        }));
      }

      console.log('Broken images count:', brokenImages.length);
      console.log(JSON.stringify(brokenImages.slice(0, 30), null, 2));
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
