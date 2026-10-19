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

      const byHost = {};
      for (const p of prods) {
        let host = 'empty';
        if (p.image) {
          try { host = new URL(p.image).hostname; } catch { host = 'invalid'; }
        }
        byHost[host] = (byHost[host] || 0) + 1;
      }
      console.log('Host distribution:', byHost);
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
