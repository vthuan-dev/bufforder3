const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const remoteCmd = `cd /opt/bufforder/backend && node -e "
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    async function main() {
      const top = await prisma.product.findMany({
        where: { isActive: true },
        orderBy: { price: 'desc' },
        take: 20,
        select: { id: true, name: true, price: true, brand: true }
      });
      console.log('Top 20 highest price products on VPS:');
      top.forEach(p => console.log(p.id + ' | $' + p.price + ' | ' + p.brand + ' | ' + p.name));
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
