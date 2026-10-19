const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const remoteCmd = `cd /opt/bufforder/backend && node -e "
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    async function main() {
      const u = await prisma.product.updateMany({
        where: { image: 'https://m.media-amazon.com/images/I/71o8n1G4dKL._AC_UY218_.jpg' },
        data: { image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80&auto=format&fit=crop' }
      });
      console.log('Fixed Samsung Galaxy Watch Ultra products:', u.count);
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
