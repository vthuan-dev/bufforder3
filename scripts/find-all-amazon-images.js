const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const remoteCmd = `cd /opt/bufforder/backend && node -e "
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    async function main() {
      const prods = await prisma.product.findMany({
        where: { isActive: true, image: { contains: 'media-amazon' } },
        select: { id: true, name: true, price: true, image: true, brand: true }
      });
      console.log('Total active products with Amazon images:', prods.length);

      const uniqueUrls = [...new Set(prods.map(p => p.image))];
      console.log('Unique Amazon image URLs:', uniqueUrls.length);

      // Check all unique Amazon URLs
      const results = { ok: 0, fail: 0, failedUrls: [] };
      for (const url of uniqueUrls) {
        try {
          const res = await fetch(url, { method: 'HEAD' });
          if (res.status === 200) {
            results.ok++;
          } else {
            results.fail++;
            results.failedUrls.push({ url, status: res.status });
          }
        } catch (e) {
          results.fail++;
          results.failedUrls.push({ url, error: e.message });
        }
      }
      console.log('Results:', { ok: results.ok, fail: results.fail });
      console.log('Failed URLs sample:', results.failedUrls);
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
