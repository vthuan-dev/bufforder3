const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const remoteCmd = `cd /opt/bufforder/backend && node -e "
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    async function main() {
      // 1. Update Garmin Forerunner 965
      const u1 = await prisma.product.updateMany({
        where: { name: { contains: 'Forerunner' } },
        data: { image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80&auto=format&fit=crop' }
      });
      console.log('Updated Forerunner products:', u1.count);

      // 2. Update Garmin Fenix 8
      const u2 = await prisma.product.updateMany({
        where: { name: { contains: 'Fenix' } },
        data: { image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80&auto=format&fit=crop' }
      });
      console.log('Updated Fenix products:', u2.count);

      // 3. Update Garmin Epix Pro
      const u3 = await prisma.product.updateMany({
        where: { name: { contains: 'Epix' } },
        data: { image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80&auto=format&fit=crop' }
      });
      console.log('Updated Epix products:', u3.count);

      // 4. Update any remaining products with those 3 broken Amazon URLs
      const brokenUrls = [
        'https://m.media-amazon.com/images/I/61t94J9xHQL._AC_UY218_.jpg',
        'https://m.media-amazon.com/images/I/71uVvFjZ-oL._AC_UY218_.jpg',
        'https://m.media-amazon.com/images/I/71k4oBv0T8L._AC_UY218_.jpg'
      ];
      for (const bUrl of brokenUrls) {
        const u = await prisma.product.updateMany({
          where: { image: bUrl },
          data: { image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80&auto=format&fit=crop' }
        });
        console.log('Replaced broken URL ' + bUrl + ' on ' + u.count + ' products');
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
