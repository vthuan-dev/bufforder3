const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const remoteCmd = `cd /opt/bufforder/backend && node -e "
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    async function main() {
      const prods = await prisma.product.findMany({
        where: { name: { contains: 'Garmin' } },
        select: { id: true, name: true, price: true, image: true, isActive: true }
      });
      console.log('Total Garmin products:', prods.length);
      for (const p of prods) {
        console.log(p.id + ' Active:' + p.isActive + ' Price:' + p.price + ' Name:' + p.name);
        console.log('   Image:' + p.image);
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
