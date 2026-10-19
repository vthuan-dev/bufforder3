const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const vpsCode = `
    const { PrismaClient } = require('/opt/bufforder/backend/node_modules/@prisma/client');
    const prisma = new PrismaClient();

    async function test(price) {
      console.log('=== TESTING TARGET PRICE: $' + price + ' ===');
      let minPrice = price * 0.85;
      let maxPrice = price * 1.15;

      let prods = await prisma.product.findMany({
        where: { isActive: true, price: { gte: minPrice, lte: maxPrice } },
        orderBy: { id: 'desc' },
        take: 300
      });
      console.log('Total fetched (take 300):', prods.length);
      const catCount = {};
      prods.forEach(p => {
        catCount[p.category] = (catCount[p.category] || 0) + 1;
      });
      console.log('Category distribution in rawProducts:');
      for (const [cat, cnt] of Object.entries(catCount)) {
        console.log('  ' + cat + ': ' + cnt + ' (' + ((cnt / prods.length) * 100).toFixed(1) + '%)');
      }
    }

    async function run() {
      await test(1050); // The exact price in user's screenshot
      await test(685);
      await test(300);
      await prisma.$disconnect();
    }
    run();
  `;
  conn.exec('node', (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d);
    stream.stderr.on('data', d => out += d);
    stream.on('close', () => {
      console.log(out);
      conn.end();
    });
    stream.write(vpsCode);
    stream.end();
  });
}).connect({ host: '223.130.11.200', port: 22, username: 'root', password: '0904521297t' });
