const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const remoteCmd = `cd /opt/bufforder/backend && node -e "
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    async function main() {
      const prods = await prisma.product.findMany({
        where: { isActive: true, price: { gte: 800, lte: 1200 } },
        select: { id: true, name: true, price: true, image: true, brand: true },
        orderBy: { price: 'asc' }
      });
      console.log('Total active products between $800-$1200:', prods.length);
      const uniqueNames = new Set();
      for (const p of prods) {
        uniqueNames.add(p.name);
      }
      console.log('Unique product names:', uniqueNames.size);
      console.log('Unique names:', Array.from(uniqueNames));
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
